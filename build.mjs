import { cp, mkdir, writeFile } from 'node:fs/promises';
import { copy, email, registry, tourDetails } from './content.mjs';
import { importTours, titleLimit, summaryLimit } from './tour-sheet.mjs';

const root = new URL('./dist/', import.meta.url);
const defaultLanguage = 'en';
const navigation = ['index', 'destinations', 'about'];
const slugs = [
  'champagne', 'rouen-etretat', 'etretat-deauville-trouville', 'mont-saint-michel-calvados',
  'loire', 'versailles', 'giverny', 'bruges', 'transfer',
];
const tourImages = {
  'rouen-etretat': ['rouen'],
  'etretat-deauville-trouville': ['normandy', 1254],
  'mont-saint-michel-calvados': ['mont', 1254],
};
const slideAssets = [
  ['paris', 'destinations'],
  ['normandy', 'destinations', 1254],
  ['loire', 'loire'],
  ['champagne', 'champagne'],
  ['mont', 'destinations', 1254],
];
const importedTours = await importTours(copy, slugs, tourDetails);
const extraPhotos = {
  champagne: ['cellar'],
  'rouen-etretat': ['normandy'],
  'etretat-deauville-trouville': ['coast'],
  'mont-saint-michel-calvados': ['calvados'],
};
const arrow = '<span aria-hidden="true">↗</span>';
const brand = '<span class="brand-mark" aria-hidden="true">P<span>T</span></span><span>Pro<span class="brand-accent">Tours</span></span>';
const image = (src, alt, lazy = false, width = 1536, height = 1024) => `<img src="../assets/${src}.jpg" alt="${alt}" width="${width}" height="${height}"${lazy ? ' loading="lazy"' : ''}>`;
const tourImage = (slug, alt = '', lazy = false) => {
  const [asset, size] = tourImages[slug] ?? [slug];
  return image(asset, alt, lazy, size, size);
};
const shortText = (value, limit) => [...value].length <= limit ? value : `${[...value].slice(0, limit - 1).join('').trimEnd()}…`;
const paragraphs = (value) => value.split(/\r?\n/).filter(line => line.trim()).map(line => `<p>${line}</p>`).join('');
const quote = (slug = '') => `quote.html${slug ? `?trip=${slug}` : ''}`;
const button = (url, label, secondary = false) => `<a class="button ${secondary ? 'secondary' : ''}" href="${url}">${label} ${arrow}</a>`;
const kicker = (label) => `<p class="eyebrow">${label}</p>`;
const section = (label, title, description) => `${kicker(label)}<h1>${title}</h1><p class="lede">${description}</p>`;
const steps = (title, items) => `<section class="section wrap"><h2>${title}</h2><ol class="steps">${items.map(([name, desc]) => `<li><h3>${name}</h3><p>${desc}</p></li>`).join('')}</ol></section>`;
const cta = (t, slug) => `<section class="banner wrap"><h2>${t.ctaTitle}</h2>${button(quote(slug), t.nav[3])}</section>`;

function layout(lang, page, title, description, main) {
  const t = copy[lang];
  const other = lang === 'en' ? 'fr' : 'en';
  const links = navigation.map((route, i) => `<a href="${route}.html"${page === route ? ' aria-current="page"' : ''}>${t.nav[i]}</a>`).join('');
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#f7f4ef">
  <title>${title} · ProTours</title>
  <link rel="stylesheet" href="../assets/site.css">
  <script src="../assets/site.js" type="module"></script>
</head>
<body>
  <a class="skip" href="#main">${t.skip}</a>
  <header class="site-header"><div class="header wrap">
    <a class="brand" href="index.html">${brand}</a>
    <nav class="nav" aria-label="${t.navLabel}">${links}</nav>
    <div class="header-actions"><a class="lang" data-language href="../${other}/${page}.html" lang="${other}" hreflang="${other}" aria-label="${other === 'en' ? 'English' : 'Français'}">${other.toUpperCase()}</a>${button(quote(), t.nav[3])}</div>
  </div></header>
  <main id="main">${main}</main>
  <footer class="footer"><div class="wrap footer-row">
    <div><a class="brand" href="index.html">${brand}</a><p>${t.footer} · ${t.tourLanguage}</p></div>
    <div><a href="about.html">${t.nav[2]}</a><a href="mailto:${email}">${email}</a></div>
  </div></footer>
</body>
</html>`;
}

function homeSlider(t) {
  const { label, previous, next, action, slides } = t.slider;
  const total = String(slides.length).padStart(2, '0');
  return `<section class="hero-carousel wrap" aria-label="${label}" data-carousel>
    <div id="home-slides">
      ${slides.map(([title, description, note, alt], i) => {
        const [asset, route, width] = slideAssets[i];
        return `<div class="hero-slide hero-slide-${asset}" data-slide${i ? ' hidden' : ''}>
          <div class="hero-slide-copy"><h1>${title}</h1><p class="lede">${description}</p>
            <p class="hero-slide-note">${note}</p>${button(`${route}.html`, action)}</div>
          <figure class="hero-slide-photo">${image(asset, alt, i > 0, width, width)}</figure>
        </div>`;
      }).join('')}
    </div>
    <div class="carousel-controls" data-carousel-controls hidden>
      <span class="carousel-count" data-slide-count aria-hidden="true">01 / ${total}</span>
      <span class="sr-only" data-slide-status role="status"></span>
      <div class="carousel-dots">${slides.map(([title], i) =>
        `<button type="button" data-slide-to="${i}" aria-label="${i + 1}. ${title}" aria-controls="home-slides" aria-pressed="${i === 0}"></button>`).join('')}</div>
      <div class="carousel-arrows">
        <button type="button" data-slide-prev aria-label="${previous}" aria-controls="home-slides"><span aria-hidden="true">←</span></button>
        <button type="button" data-slide-next aria-label="${next}" aria-controls="home-slides"><span aria-hidden="true">→</span></button>
      </div>
    </div>
  </section>`;
}

function home(t, lang) {
  return `${homeSlider(t)}
  <ul class="facts wrap">${t.facts.map((fact, i) => `<li><span aria-hidden="true">0${i + 1}</span>${fact}</li>`).join('')}</ul>
  <div class="section-band"><section class="section wrap">
    <div class="section-heading"><div>${kicker(t.catalogLabel)}<h2>${t.moreDestinations}</h2></div>${button('destinations.html', t.tours, true)}</div>
    <div class="card-grid">${['loire', 'giverny', 'bruges'].map(slug => destinationCard(t, lang, slugs.indexOf(slug), 'h3')).join('')}</div>
  </section></div>
  <section class="section wrap benefits">
    <h2>${t.benefitsTitle}</h2>
    <ul class="card-grid benefits-grid">${t.benefits.map(([title, description]) =>
      `<li class="benefit"><h3>${title}</h3><p>${description}</p></li>`).join('')}</ul>
  </section>
  ${steps(t.processTitle, t.process)}
  <section class="section wrap faq"><h2>${t.faqTitle}</h2>${t.faq.map(([question, answer]) =>
    `<details><summary>${question}</summary><p>${answer}</p></details>`).join('')}
  </section>${cta(t)}`;
}

function tourFacts(t, lang, slug) {
  const labels = t.tourFacts;
  const { format, from, hours, basis, minimum } = tourDetails[slug] ?? {};
  const currency = new Intl.NumberFormat(lang, {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
  });
  const priceDetails = labels[basis];
  const price = from == null ? labels.onRequest
    : `${labels.from} ${currency.format(from)}${priceDetails ? `<small>${priceDetails}</small>` : ''}`;
  const number = new Intl.NumberFormat(lang);
  const duration = hours?.length === 1 && !Number.isInteger(hours[0])
    ? `${Math.floor(hours[0])}&nbsp;h ${Math.round((hours[0] % 1) * 60)}&nbsp;min`
    : hours ? `${hours.map(hour => number.format(hour)).join('–')}&nbsp;h` : labels.unknown;
  const facts = [[labels.type, labels[format] ?? labels.unknown], [labels.price, price], [labels.duration, duration], [labels.minimum, minimum ?? labels.unknown]];
  return `<dl class="tour-facts">${facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>`;
}

function destinationCard(t, lang, i, heading = 'h2') {
  const [title, desc] = t.cards[i];
  const slug = slugs[i];
  const imported = importedTours[lang]?.[slug];
  return `<article class="card">
    ${gallery(t, lang, slug, title, true)}
    <div class="card-copy"><${heading}>${imported ? title : shortText(title, titleLimit)}</${heading}>${tourFacts(t, lang, slug)}<p class="card-summary">${imported ? desc : shortText(desc, summaryLimit)}</p>
      <a class="card-link" href="${slug}.html" aria-label="${t.cardAction} — ${title}">${t.cardAction} ${arrow}</a></div>
  </article>`;
}

function gallery(t, lang, slug, title, compact = false) {
  const photos = importedTours[lang]?.[slug]?.photos;
  const pictures = photos?.length
    ? photos.map(src => `<img src="${src}" alt="${compact ? '' : title}" loading="lazy">`)
    : [tourImage(slug, compact ? '' : title, compact), ...(extraPhotos[slug] ?? []).map(src => image(src, compact ? '' : title, true))];
  return `<div class="photo-gallery ${compact ? 'card-art' : 'trip-gallery'}" data-gallery>
    <div class="photo-track" data-photo-track${pictures.length > 1 ? ` tabindex="0" aria-label="${t.galleryLabel}"` : ''}>${pictures.join('')}</div>
    ${pictures.length > 1 ? `<div class="photo-controls" hidden>
      <button type="button" data-photo-prev aria-label="${t.slider.previous}">‹</button>
      <button type="button" data-photo-next aria-label="${t.slider.next}">›</button>
    </div>` : ''}
  </div>`;
}

function destinations(t, lang) {
  const [transferTitle, transferDescription] = t.cards[slugs.indexOf('transfer')];
  return `<section class="section wrap page-intro">${section(t.catalogLabel, t.catalogTitle, t.catalogIntro)}
    <p class="tour-language">${t.tourLanguage}</p>
    <div class="card-grid">${slugs.map((slug, i) => slug === 'transfer' ? '' : destinationCard(t, lang, i)).join('')}</div>
    <aside class="details catalogue-transfer"><div><h2>${transferTitle}</h2><p>${transferDescription}</p></div>${button('transfer.html', t.transferAction, true)}</aside>
  </section>${cta(t)}`;
}

function tripPage(t, lang, slug, title, description) {
  const champagne = slug === 'champagne';
  if (slug === 'transfer') {
    return `<section class="section wrap trip">
    <a class="back-link" href="destinations.html"><span aria-hidden="true">←</span> ${t.backToCatalog}</a>
    <div class="trip-grid">
      <div>${section(t.transferLabel, title, description)}${button(quote(slug), t.nav[3])}</div>
      <figure class="feature-photo">${tourImage(slug)}</figure>
    </div>
  </section><section class="section wrap trip-note"><h2>${t.transferPlan}</h2><p>${t.routeNotes[slug]}</p></section>${cta(t, slug)}`;
  }

  const data = importedTours[lang]?.[slug];
  const sheetText = value => `<div lang="${data.lang}">${paragraphs(value)}</div>`;
  const itinerary = champagne ? t.tripSteps : [t.tripSteps[0], [title, t.routeNotes[slug]], t.returnStep];
  const details = (id, heading, content) => `<section id="${id}" class="tour-section"><h2>${heading}</h2>${content}</section>`;
  return `<section class="section wrap tour-page">
    <a class="back-link" href="destinations.html">← ${t.backToCatalog}</a>
    <h1>${title}</h1><p class="tour-language">${t.tourLanguage}</p>
    <div class="tour-top">
      <aside id="booking" class="details availability"><h2>${t.bookingTitle}</h2>
        ${tourFacts(t, lang, slug)}${quoteForm(t, { title, slug })}
      </aside>
      ${gallery(t, lang, slug, title)}
    </div>
    <div class="tour-sections">
      ${details('overview', t.overviewTitle, data?.description ? sheetText(data.description) : paragraphs(description))}
      ${details('included', t.includedTitle, data?.included ? sheetText(data.included) : paragraphs(t.included))}
      ${details('excluded', t.excludedTitle, data?.excluded ? sheetText(data.excluded) : paragraphs(t.excluded))}
      ${details('itinerary', t.tripStepsTitle, data?.itinerary ? sheetText(data.itinerary)
        : `<ol class="itinerary">${itinerary.map(([name, note]) => `<li><h3>${name}</h3><p>${note}</p></li>`).join('')}</ol>`)}
      ${details('additional', t.additionalTitle, `<p>${t.tourLanguage}</p>${data?.additional ? sheetText(data.additional) : paragraphs(t.additional)}`)}
      ${details('cancellation', t.cancellationTitle, `<p>${t.cancellation}</p>`)}
      ${details('reviews', t.reviewsTitle, `<p>${t.reviewsEmpty}</p>`)}
      ${details('booking-steps', t.bookingStepsTitle, `<ol>${t.process.map(([name, note]) => `<li><strong>${name}</strong><p>${note}</p></li>`).join('')}</ol>`)}
    </div>
  </section>`;
}

function about(t) {
  return `<section class="section wrap about">
    <div>${section(t.aboutLabel, t.aboutTitle, t.aboutIntro)}<p>${t.aboutLanguage}</p>${button(quote(), t.nav[3])}</div>
    <aside class="details"><h2>${t.companyTitle}</h2>
      <dl><dt>${t.operator}</dt><dd>LG-Platform · SARL</dd>
      <dt>${t.office}</dt><dd>73 rue du Château<br>92100 Boulogne-Billancourt, France</dd>
      <dt>SIREN</dt><dd>949 853 394</dd><dt>SIRET</dt><dd>949 853 394 00011</dd>
      <dt>RCS</dt><dd>949 853 394 RCS Nanterre</dd>
      <dt>Email</dt><dd><a href="mailto:${email}">${email}</a></dd></dl>
      <a class="text-link" href="${registry}">${t.registryLabel} ${arrow}</a>
    </aside>
  </section>`;
}

function quotePage(t) {
  return `<section class="section wrap about quote">
    <div>${section(t.quoteLabel, t.quoteTitle, t.quoteIntro)}<a class="text-link" href="mailto:${email}">${email} ${arrow}</a></div>
    ${quoteForm(t)}
  </section>`;
}

function quoteForm(t, tour) {
  const [destination, date, travellers, name, phone, address, comments] = t.form;
  const subject = tour ? t.bookingSubject : t.subject;
  const tourData = tour ? ` data-tour="${tour.title}" data-tour-label="${destination}"` : '';
  const { minimum = 1, tiers } = tourDetails[tour?.slug] ?? {};
  const prices = Object.keys(tiers ?? {});
  const pricing = prices.length > 0;
  const french = t === copy.fr;
  return `<form class="${tour ? 'form' : 'details form'}" data-quote data-email="${email}" data-subject="${subject}" data-tour-language="${t.defaultTourLanguage}"${tourData}>
      ${tour ? '' : `<label class="full">${destination}<select name="trip" required><option value="">${t.choose}</option>${t.cards.map(([title], i) => {
        const slug = slugs[i];
        return `<option value="${slug}" data-min-travellers="${tourDetails[slug]?.minimum ?? 1}">${title}</option>`;
      }).join('')}<option value="other">${t.other}</option></select></label>`}
      <label>${date}<input name="date" type="date" required></label>
      <label>${travellers}<input name="travellers" type="number" min="${minimum}"${pricing ? ` max="${Math.max(...prices)}" value="${minimum}"` : ''} step="1" required></label>
      ${pricing ? `<div class="full booking-price" data-prices='${JSON.stringify(tiers)}'>
        <dl><div><dt>${french ? 'Prix par personne' : 'Price per person'}</dt><dd data-person-price>–</dd></div>
        <div><dt>${french ? 'Total du groupe' : 'Group total'}</dt><dd data-total-price>–</dd></div></dl>
      </div>` : ''}
      ${tour ? `<div class="full"><button type="button" class="button" data-check disabled>${t.checkAvailability}</button><p class="form-help">${t.availabilityNote}</p></div>
      <fieldset class="booking-contact full" data-contact hidden disabled>` : ''}
      <label>${name}<input name="name" autocomplete="name" maxlength="120" required></label>
      <label>${phone}<input name="phone" type="tel" autocomplete="tel" maxlength="40" required></label>
      <label class="full">${address}<input name="email" type="email" autocomplete="email" maxlength="160" required></label>
      ${tour ? '' : `<label class="full">${comments}<textarea name="notes" rows="3" maxlength="700"></textarea></label>`}
      <div class="full"><button type="submit" class="button" disabled>${t.mailButton} ${arrow}</button><p id="mail-help" class="form-help">${t.mailHelp}</p></div>
      ${tour ? '</fieldset>' : ''}
      <div class="full form-status" hidden><p role="status">${t.mailStatus} <a href="mailto:${email}">${email}</a>.</p>
        <textarea readonly aria-label="${subject}" rows="5"></textarea>
        <button type="button" class="button secondary" data-copy data-copied="${t.copied}">${t.copyRequest}</button>
      </div>
    </form>`;
}

for (const [lang, t] of Object.entries(copy)) {
  const directory = new URL(`${lang}/`, root);
  await mkdir(directory, { recursive: true });
  const pages = [
    ['index', t.slider.slides[0][0], t.intro, home(t, lang)],
    ['destinations', t.nav[1], t.catalogIntro, destinations(t, lang)],
    ['about', t.nav[2], t.aboutIntro, about(t)],
    ['quote', t.nav[3], t.quoteIntro, quotePage(t)],
    ...t.cards.map(([name, summary], i) => {
      const slug = slugs[i];
      const title = importedTours[lang]?.[slug] ? name : slug === 'champagne' ? t.tripTitle : name;
      const description = slug === 'champagne' && !importedTours[lang]?.[slug] ? t.champagneIntro : summary;
      return [slug, title, description, tripPage(t, lang, slug, title, description)];
    }),
  ];
  await Promise.all(pages.map(([route, title, description, main]) =>
    writeFile(new URL(`${route}.html`, directory), layout(lang, route, title, description, main))));
}

await cp(new URL('./assets/', import.meta.url), new URL('assets/', root), { recursive: true });
const t = copy[defaultLanguage];
const start = layout(defaultLanguage, 'index', t.slider.slides[0][0], t.intro, home(t, defaultLanguage))
  .replaceAll('../assets/', 'assets/').replace('../fr/', 'fr/')
  .replaceAll(/href="([a-z0-9-]+\.html(?:\?[^"]*)?)"/g, `href="${defaultLanguage}/$1"`);
await writeFile(new URL('index.html', root), start);

const legacy = new URL('ru/', root);
await mkdir(legacy, { recursive: true });
await Promise.all([...navigation, 'quote', ...slugs].map(route => {
  const target = `../${defaultLanguage}/${route}.html`;
  return writeFile(new URL(`${route}.html`, legacy), `<!doctype html>
<html lang="en"><meta charset="utf-8"><title>ProTours</title>
<script>location.replace(${JSON.stringify(target)} + location.search + location.hash)</script>
<meta http-equiv="refresh" content="0; url=${target}">
<a href="${target}">Continue to ProTours</a></html>`);
}));
