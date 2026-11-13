// Boot Novus (Pendo) once per page load with an anonymous visitor. An empty id
// lets the SDK reuse a previously stored visitor id, or create a new anonymous one.
pendo.initialize({ visitor: { id: "" } });

const order = JSON.parse(localStorage.getItem("order") || "[]");

document.querySelectorAll(".add-to-order").forEach((button) => {
  button.addEventListener("click", () => {
    order.push(button.dataset.item);
    localStorage.setItem("order", JSON.stringify(order));
  });
});

const newsletter = document.getElementById("newsletter-form");
if (newsletter) {
  newsletter.addEventListener("submit", (event) => {
    event.preventDefault();
    newsletter.innerHTML = "<p>Thanks for subscribing!</p>";
  });
}
