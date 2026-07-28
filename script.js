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

  const tabList = document.createElement("div");
  tabList.className = "tour-tab-list";
  tabList.setAttribute("role", "tablist");

  const panels = ["schedule", "photos"].map((name, tabIndex) => {
    const tab = document.createElement("button");
    const panel = document.createElement("div");
    const id = `tour-${cardIndex}-${name}`;

    tab.type = "button";
    tab.className = "tour-tab";
    tab.textContent = name[0].toUpperCase() + name.slice(1);
    tab.setAttribute("role", "tab");
    tab.setAttribute("aria-controls", id);
    tab.setAttribute("aria-selected", String(tabIndex === 0));

    panel.id = id;
    panel.className = `tour-tab-panel ${name}-panel`;
    panel.setAttribute("role", "tabpanel");
    panel.hidden = tabIndex !== 0;

    if (name === "schedule") {
      panel.append(source.querySelector(".timeline").cloneNode(true));
      const note = source.querySelector(".schedule-note");
      const included = source.querySelector(".inclusions-grid");
      if (note) panel.append(note.cloneNode(true));
      if (included) panel.append(included.cloneNode(true));
    } else {
      panel.append(source.querySelector(".tour-photo-strip").cloneNode(true));
    }

    tab.addEventListener("click", () => {
      tabList.querySelectorAll(".tour-tab").forEach((item) =>
        item.setAttribute("aria-selected", String(item === tab))
      );
      panels.forEach((item) => {
        item.hidden = item !== panel;
      });
    });

    tabList.append(tab);
    return panel;
  });

  tabs.append(tabList, ...panels);
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
    `Phone / WhatsApp: ${data.get("phone")}`,
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
