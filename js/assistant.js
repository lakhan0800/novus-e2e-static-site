/** Northwind Coffee AI barista — posts to the same /api/assistant route as Taskly. */
(function initNorthwindAssistant() {
  const fab = document.getElementById("assistant-open");
  const panel = document.getElementById("assistant-panel");
  const closeBtn = document.getElementById("assistant-close");
  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-input");
  const list = document.getElementById("assistant-messages");
  if (!fab || !panel || !closeBtn || !form || !input || !list) return;

  const messages = [];

  const render = () => {
    list.innerHTML = "";
    for (const message of messages) {
      const item = document.createElement("li");
      item.className = `message message-${message.role}`;
      item.textContent = message.content;
      list.appendChild(item);
    }
  };

  fab.addEventListener("click", () => {
    panel.hidden = false;
    fab.hidden = true;
  });
  closeBtn.addEventListener("click", () => {
    panel.hidden = true;
    fab.hidden = false;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    messages.push({ role: "user", content: text });
    input.value = "";
    render();
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ messages }),
    });
    const body = await response.json();
    messages.push({ role: "assistant", content: body.reply ?? "" });
    render();
    // Pendo Track Event: assistant reply returned by /api/assistant and shown in the chat.
    if (
      response.ok &&
      window.pendo &&
      typeof window.pendo.track === "function"
    ) {
      window.pendo.track("Barista AI reply received", {
        response_status: response.status,
        has_reply: Boolean(body.reply),
        reply_length: (body.reply ?? "").length,
        message_count: messages.length,
        page_path: window.location.pathname,
      });
    }
  });
})();
