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
  const status = form.querySelector(".form-status");
  status.textContent =
    "The booking form is ready. Add your email, WhatsApp or CRM connection to start receiving requests.";
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
