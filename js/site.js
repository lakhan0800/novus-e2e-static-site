const order = JSON.parse(localStorage.getItem("order") || "[]");

/** Sends a Pendo Track Event when the Pendo agent is loaded. Tracking never blocks the page. */
const trackPendoEvent = (name, properties) => {
  try {
    if (typeof window.pendo !== "undefined" && typeof window.pendo.track === "function") {
      window.pendo.track(name, properties);
    }
  } catch (trackingError) {
    console.warn("Pendo track failed", trackingError);
  }
};

document.querySelectorAll(".add-to-order").forEach((button) => {
  button.addEventListener("click", () => {
    order.push(button.dataset.item);
    localStorage.setItem("order", JSON.stringify(order));
    // Fires after the item ID is saved to the local order list, which proves the cart grew.
    trackPendoEvent("Item added to order", {
      item_id: button.dataset.item || "unknown",
      order_item_count: order.length,
      page_path: window.location.pathname,
    });
  });
});

const newsletter = document.getElementById("newsletter-form");
if (newsletter) {
  newsletter.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletter.innerHTML = "<p>Thanks for subscribing!</p>";
    // Fires once the form is replaced with the confirmation. The email address is not sent.
    trackPendoEvent("Newsletter subscription confirmed", {
      page_path: window.location.pathname,
    });
  });
}
