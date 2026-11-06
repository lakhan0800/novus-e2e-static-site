/** Northwind Coffee AI barista — posts to the same /api/assistant route as Taskly. */
(function initNorthwindAssistant() {
  const fab = document.getElementById("assistant-open");
  const panel = document.getElementById("assistant-panel");
  const closeBtn = document.getElementById("assistant-close");
  const form = document.getElementById("assistant-form");
  const input = document.getElementById("assistant-input");
  const list = document.getElementById("assistant-messages");
  if (!fab || !panel || !closeBtn || !form || !input || !list) return;

  const AGENT_ID = "kYd2dyKX_E2kvhId2W6nyZu4ChU";
  const conversationId = crypto.randomUUID();
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

    const promptMessageId = crypto.randomUUID();
    if (typeof pendo !== "undefined" && pendo.trackAgent) {
      pendo.trackAgent("prompt", {
        agentId: AGENT_ID,
        conversationId: conversationId,
        messageId: promptMessageId,
        content: text,
        suggestedPrompt: false,
      });
    }

    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ messages }),
    });
    const body = await response.json();
    const reply = body.reply ?? "";
    messages.push({ role: "assistant", content: reply });
    render();

    if (typeof pendo !== "undefined" && pendo.trackAgent) {
      pendo.trackAgent("agent_response", {
        agentId: AGENT_ID,
        conversationId: conversationId,
        messageId: crypto.randomUUID(),
        content: reply,
      });
    }
  });
})();
