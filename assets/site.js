const form = document.querySelector('[data-quote]');
const carousel = document.querySelector('[data-carousel]');

for (const gallery of document.querySelectorAll('[data-gallery]')) {
  const track = gallery.querySelector('[data-photo-track]');
  const controls = gallery.querySelector('.photo-controls');
  if (!controls) continue;
  const move = direction => track.scrollBy({ left: direction * track.clientWidth });
  controls.querySelector('[data-photo-prev]').addEventListener('click', () => move(-1));
  controls.querySelector('[data-photo-next]').addEventListener('click', () => move(1));
  if (gallery.classList.contains('card-art')) {
    track.addEventListener('wheel', event => {
      if (event.ctrlKey || event.deltaX || !event.deltaY) return;
      const end = track.scrollWidth - track.clientWidth;
      if (event.deltaY < 0 ? track.scrollLeft <= 1 : track.scrollLeft >= end - 1) return;
      event.preventDefault();
      move(Math.sign(event.deltaY));
    }, { passive: false });
  }
  controls.hidden = false;
}

if (carousel) {
  const slides = [...carousel.querySelectorAll('[data-slide]')];
  const dots = [...carousel.querySelectorAll('[data-slide-to]')];
  const controls = carousel.querySelector('[data-carousel-controls]');
  const count = carousel.querySelector('[data-slide-count]');
  const status = carousel.querySelector('[data-slide-status]');
  const total = String(slides.length).padStart(2, '0');
  let active = 0;

  function showSlide(index) {
    const next = (index + slides.length) % slides.length;
    if (next === active) return;
    slides[active].hidden = true;
    dots[active].setAttribute('aria-pressed', 'false');
    active = next;
    slides[active].hidden = false;
    dots[active].setAttribute('aria-pressed', 'true');
    count.textContent = `${String(active + 1).padStart(2, '0')} / ${total}`;
    status.textContent = `${active + 1} / ${slides.length} — ${slides[active].querySelector('h1').textContent}`;
  }

  dots.forEach((dot, index) => dot.addEventListener('click', () => showSlide(index)));
  controls.querySelector('[data-slide-prev]').addEventListener('click', () => showSlide(active - 1));
  controls.querySelector('[data-slide-next]').addEventListener('click', () => showSlide(active + 1));
  controls.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    showSlide(active + (event.key === 'ArrowLeft' ? -1 : 1));
  });
  let swipe;
  carousel.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.pointerType === 'mouse' || !event.target.closest('.hero-slide-photo')) return;
    swipe = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  carousel.addEventListener('pointercancel', event => {
    if (swipe?.id === event.pointerId) swipe = undefined;
  });
  carousel.addEventListener('pointerup', event => {
    if (swipe?.id !== event.pointerId) return;
    const dx = event.clientX - swipe.x;
    const dy = event.clientY - swipe.y;
    swipe = undefined;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.25) showSlide(active - Math.sign(dx));
  });
  controls.hidden = false;
}

if (form) {
  const trip = form.elements.namedItem('trip');
  const fromLink = new URLSearchParams(location.search).get('trip');
  if (trip && fromLink && Array.from(trip.options).some(option => option.value === fromLink)) {
    trip.value = fromLink;
    const switcher = document.querySelector('[data-language]');
    const alternate = new URL(switcher.href);
    alternate.searchParams.set('trip', fromLink);
    switcher.href = alternate.href;
  }
  if (trip) {
    const travellers = form.elements.namedItem('travellers');
    const updateMinimum = () => {
      travellers.min = trip.selectedOptions[0]?.dataset.minTravellers ?? '1';
    };
    trip.addEventListener('change', updateMinimum);
    updateMinimum();
  }

  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map(part => String(part).padStart(2, '0')).join('-');
  const dateInput = form.elements.namedItem('date');
  dateInput.min = date;
  const travellers = form.elements.namedItem('travellers');
  const priceBox = form.querySelector('[data-prices]');
  const tiers = priceBox ? JSON.parse(priceBox.dataset.prices) : null;
  const stepper = form.querySelector('[data-traveller-stepper]');
  if (stepper) {
    const buttons = [...stepper.querySelectorAll('[data-step]')];
    const available = tiers ? Object.keys(tiers).map(Number).sort((a, b) => a - b) : null;
    const min = Number(travellers.min);
    function nextCount(direction) {
      const count = travellers.valueAsNumber;
      if (!Number.isFinite(count)) return min;
      if (available) {
        return direction < 0 ? available.findLast(size => size < count) : available.find(size => size > count);
      }
      const next = direction < 0 ? Math.ceil(count) - 1 : Math.floor(count) + 1;
      return next >= min ? next : undefined;
    }
    function updateButtons() {
      for (const button of buttons) button.disabled = nextCount(Number(button.dataset.step)) === undefined;
    }
    for (const button of buttons) {
      button.addEventListener('click', () => {
        const count = nextCount(Number(button.dataset.step));
        if (count === undefined) return;
        travellers.value = String(count);
        travellers.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }
    travellers.addEventListener('input', updateButtons);
    updateButtons();
  }
  if (priceBox) {
    const person = priceBox.querySelector('[data-person-price]');
    const total = priceBox.querySelector('[data-total-price]');
    const money = new Intl.NumberFormat(document.documentElement.lang, {
      style: 'currency', currency: 'EUR', minimumFractionDigits: 0,
    });
    const updatePrice = () => {
      const count = travellers.valueAsNumber;
      const amount = tiers[count];
      person.textContent = amount === undefined ? '–' : money.format(amount);
      total.textContent = amount === undefined ? '–' : money.format(Math.round(amount * 100) * count / 100);
      travellers.setCustomValidity(Number.isInteger(count) && amount === undefined
        ? (document.documentElement.lang === 'fr' ? 'Choisissez un nombre de participants couvert par le tarif.' : 'Choose a group size with an available price.')
        : '');
    };
    travellers.addEventListener('input', updatePrice);
    updatePrice();
  }
  const check = form.querySelector('[data-check]');
  const contact = form.querySelector('[data-contact]');
  if (check) {
    check.disabled = false;
    check.addEventListener('click', () => {
      if (!dateInput.reportValidity() || !travellers.reportValidity()) return;
      contact.hidden = false;
      contact.disabled = false;
      form.elements.namedItem('name').focus();
    });
  }

  const status = form.querySelector('.form-status');
  const draft = status.querySelector('textarea');
  const copy = status.querySelector('[data-copy]');
  const originalCopyLabel = copy.textContent;
  form.querySelector('button[type="submit"]').disabled = false;

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (contact?.disabled) {
      check.click();
      return;
    }
    const fields = form.querySelectorAll('label');
    const { tour, tourLabel } = form.dataset;
    const lines = tour ? [`${tourLabel}: ${tour}`] : [];
    for (const label of fields) {
      const control = label.control;
      const value = control.selectedOptions?.[0]?.textContent ?? control.value.trim();
      if (value) lines.push(`${label.firstChild.textContent.trim()}: ${value}`);
    }
    lines.push(form.dataset.tourLanguage);

    draft.value = lines.join('\n');
    copy.textContent = originalCopyLabel;
    status.hidden = false;
    const subject = encodeURIComponent(form.dataset.subject);
    const body = encodeURIComponent(lines.join('\r\n'));
    window.location.href = `mailto:${form.dataset.email}?subject=${subject}&body=${body}`;
  });

  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(draft.value);
      copy.textContent = copy.dataset.copied;
    } catch {
      draft.focus();
      draft.select();
    }
  });
}
