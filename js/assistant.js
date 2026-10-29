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
    let response;
    let body;
    try {
      response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ messages }),
      });
      body = await response.json();
    } catch (err) {
      // Request failed (network error or unparseable response).
      trackReplyReceived(response, undefined);
      throw err;
    }
    messages.push({ role: "assistant", content: body.reply ?? "" });
    render();
    trackReplyReceived(response, body);
  });

  /**
   * Pendo Track Event: fires once per assistant request, after the reply has
   * been added to the conversation or the request has failed. Never sends the
   * user's message or the reply text (may contain PII) — only its length.
   */
  function trackReplyReceived(response, body) {
    try {
      if (!window.pendo || typeof window.pendo.track !== "function") return;
      const reply = (body && body.reply) || "";
      window.pendo.track("barista_ai_reply_received", {
        success: Boolean(response && response.ok && body),
        response_status: response ? response.status : 0,
        reply_empty: !reply,
        reply_length: reply.length,
        conversation_turn_count: messages.filter((m) => m.role === "user")
          .length,
        page_path: location.pathname,
      });
    } catch (trackingError) {
      // Never let analytics break the assistant.
    }
  }
})();
