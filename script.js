const form = document.querySelector("#booking-form");
const tourSelect = document.querySelector("#tour");

document.querySelectorAll("[data-tour]").forEach((button) => {
  button.addEventListener("click", () => {
    const option = [...tourSelect.options].find((item) =>
      item.textContent.startsWith(button.dataset.tour)
    );
    if (option) tourSelect.value = option.value;
    document.querySelector("#book").scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".itinerary-link").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    const itinerary = document.querySelector(link.getAttribute("href"));
    if (!itinerary) return;
    itinerary.open = true;
    itinerary.scrollIntoView({ behavior: "smooth", block: "start" });
  });
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

document.querySelectorAll(".gallery-item").forEach((item) => {
  item.addEventListener("click", () => {
    const thumbnail = item.querySelector("img");
    lightboxImage.src = item.dataset.full;
    lightboxImage.alt = thumbnail.alt;
    lightbox.showModal();
  });
});

lightbox.querySelector(".lightbox-close").addEventListener("click", () => lightbox.close());
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) lightbox.close();
});
