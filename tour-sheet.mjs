import { readFile, readdir } from 'node:fs/promises';

export const titleLimit = 60;
export const summaryLimit = 120;

const columns = [
  'Номер', 'Название', 'Цена за человека', 'Минимум участников', 'Длительность',
  'Краткое описание', 'Длинное описание', 'Маршрут', 'Что включено', 'Что не включено', 'Ссылка на фото',
];
const englishColumns = [
  'No.', 'Tour Name', 'Price per Person', 'Minimum Participants', 'Duration', 'Short Description',
  'Full Description', 'Itinerary', "What's Included", "What's Not Included", 'Photo Link',
];
const sheetRoutes = [
  'champagne', 'mont-saint-michel-calvados', 'rouen-etretat',
  'etretat-deauville-trouville', 'bruges', 'loire',
];
const escapeHtml = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const char = csv[i];
    if (char === '"') {
      if (quoted && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && (char === ',' || char === '\n')) {
      row.push(cell.trim());
      cell = '';
      if (char === '\n') {
        rows.push(row);
        row = [];
      }
    } else {
      cell += char;
    }
  }
  if (quoted) throw new Error('Unclosed quote in the tour CSV');
  if (row.length || cell) rows.push([...row, cell.trim()]);
  return rows.filter(values => values.some(Boolean));
}

async function readSheet(url, lang) {
  if (!url) return parseSheet(await readFile(new URL('./tour-catalogue.csv', import.meta.url), 'utf8'), lang);
  const source = new URL(url);
  if (source.origin !== 'https://docs.google.com' || !source.pathname.startsWith('/spreadsheets/')) {
    throw new Error(`Use a published Google Sheets CSV URL for ${lang}`);
  }
  const response = await fetch(source, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`Could not load ${lang} tour sheet (HTTP ${response.status})`);
  return parseSheet(await response.text(), lang);
}

async function parseSheet(csv, lang) {
  const [header, ...rows] = parseCsv(csv);
  const indexes = columns.map((column, i) => header?.findIndex(value => value === column || value === englishColumns[i]) ?? -1);
  if (indexes.includes(-1)) throw new Error(`Missing required headers in ${lang} tour sheet`);
  const typeIndex = header.findIndex(value => value === 'Тип тура' || value === 'Tour Type');
  const tiersIndex = header.indexOf('Pricing Tiers');
  const additionalIndex = header.indexOf('Additional Information');
  const result = new Map();
  for (const row of rows) {
    const [id, title, price, minimum, duration, summary, description, itinerary, included, excluded, photoLinks] =
      indexes.map(index => row[index] ?? '');
    const number = Number(id);
    if (!/^[1-9]\d{0,7}$/.test(id) || result.has(number)) throw new Error(`Invalid or duplicate tour number ${id} (${lang})`);
    if (!title || [...title].length > titleLimit || !summary || [...summary].length > summaryLimit) {
      throw new Error(`Tour ${id} (${lang}) requires a title of up to ${titleLimit} and a summary of up to ${summaryLimit} characters`);
    }
    const from = Number(price.replace(',', '.'));
    const writtenDuration = duration.match(/^(?:approximately )?(\d+) hours?(?: (\d+) minutes?)?$/i);
    const hours = writtenDuration ? [Number(writtenDuration[1]) + Number(writtenDuration[2] ?? 0) / 60]
      : duration.split(/[-–]/).map(value => Number(value.replace(',', '.')));
    const format = (row[typeIndex] ?? '').toLowerCase();
    if (!Number.isFinite(from) || from <= 0 || !/^[1-9]\d*$/.test(minimum) ||
        hours.length > 2 || hours.some(value => !Number.isFinite(value) || value <= 0) ||
        (hours.length === 2 && hours[0] > hours[1]) || (format && !['private', 'group'].includes(format))) {
      throw new Error(`Invalid price, minimum, duration or format for tour ${id} (${lang})`);
    }
    const tiers = Object.create(null);
    for (const line of (row[tiersIndex] ?? '').split(/\r?\n/).filter(value => value.trim())) {
      const match = line.trim().match(/^(\d+)\s+guests?\s*[—–-]\s*(\d+(?:[.,]\d{1,2})?)$/i);
      const guests = Number(match?.[1]);
      const amount = Number(match?.[2].replace(',', '.'));
      if (!match || guests < Number(minimum) || amount <= 0 || guests in tiers) {
        throw new Error(`Invalid pricing tier for tour ${id} (${lang})`);
      }
      tiers[guests] = amount;
    }
    const dir = new URL(`./assets/gallery/${number}/`, import.meta.url);
    const localPhotos = await readdir(dir).catch(error => {
      if (error.code === 'ENOENT') return [];
      throw error;
    });
    const photos = localPhotos.filter(file => /^\d+\.jpg$/.test(file)).sort().map(file => `../assets/gallery/${number}/${file}`);
    photos.push(...photoLinks.split(/\r?\n/).filter(Boolean).flatMap(link => {
      const photo = new URL(link.trim());
      if (photo.protocol !== 'https:') throw new Error(`Tour ${id} (${lang}) requires HTTPS image links`);
      if (photo.hostname === 'drive.google.com' && photo.pathname.startsWith('/drive/folders/')) return [];
      return [escapeHtml(photo.href)];
    }));
    result.set(number, {
      title: escapeHtml(title), summary: escapeHtml(summary), description: escapeHtml(description),
      itinerary: escapeHtml(itinerary), included: escapeHtml(included), excluded: escapeHtml(excluded),
      additional: escapeHtml(row[additionalIndex] ?? ''), lang, photos,
      facts: { from: Math.min(from, ...Object.values(tiers)), hours, minimum: Number(minimum), tiers, basis: 'person', ...(format ? { format } : {}) },
    });
  }
  return result;
}

export async function importTours(copy, slugs, tourDetails) {
  const { PROTOURS_SHEET_EN: enUrl, PROTOURS_SHEET_FR: frUrl } = process.env;
  const imported = { en: Object.create(null), fr: Object.create(null) };
  const [en, fr] = await Promise.all([readSheet(enUrl, 'en'), frUrl ? readSheet(frUrl, 'fr') : null]);
  if (fr && (en.size !== fr.size || [...en.keys()].some(id => !fr.has(id)))) throw new Error('EN and FR sheets must use the same tour numbers');
  for (const [id, data] of en) {
    const translation = fr?.get(id);
    if (translation && JSON.stringify(data.facts) !== JSON.stringify(translation.facts)) throw new Error(`Prices, hours and type differ between languages for tour ${id}`);
    const slug = sheetRoutes[id - 1] ?? `tour-${id}`;
    let index = slugs.indexOf(slug);
    if (index < 0) {
      if (!data.photos.length || !data.itinerary || !data.facts.format) {
        throw new Error(`New tour ${id} needs photos, itinerary and type`);
      }
      index = slugs.length;
      slugs.push(slug);
    }
    tourDetails[slug] = { format: 'private', ...tourDetails[slug], ...data.facts };
    for (const [lang, entry] of [['en', data], ['fr', translation ?? data]]) {
      if (lang === 'en' || translation || !copy[lang].cards[index]) copy[lang].cards[index] = [entry.title, entry.summary];
      imported[lang][slug] = entry;
    }
    if (!translation && id === 2) copy.fr.cards[index] = [
      'Excursion au Mont-Saint-Michel depuis Paris',
      'Découvrez le village médiéval et l’abbaye du Mont-Saint-Michel lors d’une excursion depuis Paris.',
    ];
  }
  return imported;
}
