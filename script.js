const form = document.querySelector("#booking-form");
const tourSelect = document.querySelector("#tour");

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-tour]");
  if (button) {
    const option = [...tourSelect.options].find((item) =>
      item.textContent.startsWith(button.dataset.tour)
    );
    if (option) tourSelect.value = option.value;
    document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
  }
});

document.querySelectorAll(".tour-tabs").forEach((tabs, cardIndex) => {
  const source = document.querySelector(tabs.dataset.source);
  if (!source) return;

  const carousel = document.createElement("div");
  const viewport = document.createElement("div");
  const track = document.createElement("div");
  const controls = document.createElement("div");
  const previous = document.createElement("button");
  const next = document.createElement("button");
  const photos = [...source.querySelectorAll(".tour-photo-strip .gallery-item")];
  let currentPhoto = 0;

  carousel.className = "tour-photo-carousel";
  viewport.className = "tour-photo-viewport";
  track.className = "tour-photo-track";
  controls.className = "tour-photo-controls";
  previous.type = next.type = "button";
  previous.className = next.className = "tour-photo-arrow";
  previous.textContent = "←";
  next.textContent = "→";
  previous.setAttribute("aria-label", "Previous tour photo");
  next.setAttribute("aria-label", "Next tour photo");
  photos.forEach((photo) => track.append(photo.cloneNode(true)));
  viewport.append(track);
  controls.append(previous, next);
  carousel.append(viewport, controls);

  const showPhoto = (index) => {
    currentPhoto = (index + photos.length) % photos.length;
    track.style.transform = `translateX(-${currentPhoto * 100}%)`;
  };
  previous.addEventListener("click", () => showPhoto(currentPhoto - 1));
  next.addEventListener("click", () => showPhoto(currentPhoto + 1));

  const scheduleToggle = document.createElement("button");
  const schedulePanel = document.createElement("div");
  const scheduleId = `tour-${cardIndex}-schedule`;
  scheduleToggle.type = "button";
  scheduleToggle.className = "schedule-toggle";
  scheduleToggle.setAttribute("aria-controls", scheduleId);
  scheduleToggle.setAttribute("aria-expanded", "true");
  scheduleToggle.innerHTML = "<span>Schedule</span><b aria-hidden=\"true\">+</b>";
  schedulePanel.id = scheduleId;
  schedulePanel.className = "tour-tab-panel schedule-panel";
  schedulePanel.hidden = false;
  schedulePanel.append(source.querySelector(".timeline").cloneNode(true));
  const note = source.querySelector(".schedule-note");
  const included = source.querySelector(".inclusions-grid");
  if (note) schedulePanel.append(note.cloneNode(true));
  schedulePanel.querySelectorAll("time").forEach((time) => {
    const parts = time.textContent.split(/[–—-]/);
    time.textContent = parts[parts.length - 1].trim();
  });

  scheduleToggle.addEventListener("click", () => {
    const isOpen = scheduleToggle.getAttribute("aria-expanded") === "true";
    scheduleToggle.setAttribute("aria-expanded", String(!isOpen));
    schedulePanel.hidden = isOpen;
  });

  const includedToggle = document.createElement("button");
  const includedPanel = document.createElement("div");
  const includedId = `tour-${cardIndex}-included`;
  includedToggle.type = "button";
  includedToggle.className = "schedule-toggle included-toggle";
  includedToggle.setAttribute("aria-controls", includedId);
  includedToggle.setAttribute("aria-expanded", "false");
  includedToggle.innerHTML = "<span>Included</span><b aria-hidden=\"true\">+</b>";
  includedPanel.id = includedId;
  includedPanel.className = "tour-tab-panel included-panel";
  includedPanel.hidden = true;
  if (included) includedPanel.append(included.cloneNode(true));

  includedToggle.addEventListener("click", () => {
    const isOpen = includedToggle.getAttribute("aria-expanded") === "true";
    includedToggle.setAttribute("aria-expanded", String(!isOpen));
    includedPanel.hidden = isOpen;
  });

  tabs.append(carousel, scheduleToggle, schedulePanel, includedToggle, includedPanel);
});

const benefitsTrack = document.querySelector(".benefits-grid");
const scrollBenefits = (direction) => {
  const card = benefitsTrack.querySelector("article");
  benefitsTrack.scrollBy({
    left: direction * (card.getBoundingClientRect().width + 24),
    behavior: "smooth",
  });
};

document.querySelector(".benefits-prev").addEventListener("click", () => scrollBenefits(-1));
document.querySelector(".benefits-next").addEventListener("click", () => scrollBenefits(1));

benefitsTrack.addEventListener("scroll", () => {
  const atStart = benefitsTrack.scrollLeft < 5;
  const atEnd = benefitsTrack.scrollLeft + benefitsTrack.clientWidth >= benefitsTrack.scrollWidth - 5;
  document.querySelector(".benefits-prev").disabled = atStart;
  document.querySelector(".benefits-next").disabled = atEnd;
});
document.querySelector(".benefits-prev").disabled = true;

let benefitsAutoplay;
const startBenefits = () => {
  clearInterval(benefitsAutoplay);
  benefitsAutoplay = setInterval(() => {
    const atEnd = benefitsTrack.scrollLeft + benefitsTrack.clientWidth >= benefitsTrack.scrollWidth - 5;
    if (atEnd) {
      benefitsTrack.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      scrollBenefits(1);
    }
  }, 4000);
};
startBenefits();

const countryCode = document.querySelector("#country-code");
const phoneInput = document.querySelector("#phone");
countryCode.addEventListener("change", () => {
  phoneInput.placeholder = countryCode.selectedOptions[0].dataset.placeholder;
});
phoneInput.addEventListener("input", () => {
  const groupSizes = countryCode.selectedOptions[0].dataset.placeholder
    .split(" ")
    .map((group) => group.length);
  const maxLength = groupSizes.reduce((total, size) => total + size, 0);
  const digits = phoneInput.value.replace(/\D/g, "").slice(0, maxLength);
  const groups = [];
  let cursor = 0;
  groupSizes.forEach((size) => {
    if (cursor < digits.length) groups.push(digits.slice(cursor, cursor + size));
    cursor += size;
  });
  phoneInput.value = groups.join(" ");
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const message = [
    "Hello ProTours! I would like to request availability.",
    "",
    `Tour: ${data.get("tour")}`,
    `Preferred date: ${data.get("date")}`,
    `Guests: ${data.get("guests")}`,
    `Name: ${data.get("name")}`,
    `Phone / WhatsApp: ${data.get("country-code")} ${data.get("phone")}`,
  ].join("\n");
  const status = form.querySelector(".form-status");
  status.textContent = "Opening WhatsApp so you can send your request…";
  window.open(`https://wa.me/33780796121?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

const chatLauncher = document.querySelector("#chat-launcher");
const chatPanel = document.querySelector("#chat-panel");
const chatClose = document.querySelector("#chat-close");

chatLauncher.addEventListener("click", () => {
  const isOpen = !chatPanel.hidden;
  chatPanel.hidden = isOpen;
  chatLauncher.setAttribute("aria-expanded", String(!isOpen));
});

chatClose.addEventListener("click", () => {
  chatPanel.hidden = true;
  chatLauncher.setAttribute("aria-expanded", "false");
});

document.querySelector("#chat-send").addEventListener("click", () => {
  const field = document.querySelector("#chat-message");
  const message = field.value.trim() || "Hello ProTours! I have a question about your day trips.";
  window.open(`https://wa.me/33780796121?text=${encodeURIComponent(message)}`, "_blank", "noopener");
});

const lightbox = document.querySelector("#gallery-lightbox");
const lightboxImage = lightbox.querySelector("img");

document.addEventListener("click", (event) => {
  const item = event.target.closest(".gallery-item");
  if (item) {
    const thumbnail = item.querySelector("img");
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = thumbnail.alt;
    lightbox.showModal();
  }
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
