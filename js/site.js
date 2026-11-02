const order = JSON.parse(localStorage.getItem("order") || "[]");

document.querySelectorAll(".add-to-order").forEach((button) => {
  button.addEventListener("click", () => {
    order.push(button.dataset.item);
    localStorage.setItem("order", JSON.stringify(order));
    // Pendo Track Event: item persisted to the order in localStorage.
    if (window.pendo && typeof window.pendo.track === "function") {
      window.pendo.track("Item added to order", {
        item_id: button.dataset.item || "unknown",
        order_item_count: order.length,
        page_path: window.location.pathname,
      });
    }
  });
});

const newsletter = document.getElementById("newsletter-form");
if (newsletter) {
  newsletter.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletter.innerHTML = "<p>Thanks for subscribing!</p>";
    // Pendo Track Event: subscription confirmation shown to the visitor.
    if (window.pendo && typeof window.pendo.track === "function") {
      window.pendo.track("Newsletter subscription confirmed", {
        form_id: "newsletter-form",
        page_path: window.location.pathname,
      });
    }
  });
}
