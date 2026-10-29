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

  const PENDO_AGENT_ID = "Xfu_Bil32GDUVl8Qcx9bp7g4Cnc";
  const generateId = (prefix) =>
    window.crypto && typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${prefix}_${Date.now()}`;
  const conversationId = generateId("conversation");

  const trackAgent = (eventType, metadata) => {
    if (!window.pendo || typeof window.pendo.trackAgent !== "function") return;
    window.pendo.trackAgent(eventType, {
      agentId: PENDO_AGENT_ID,
      conversationId,
      ...metadata,
    });
  };

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
    trackAgent("prompt", {
      messageId: generateId("prompt"),
      content: text,
      suggestedPrompt: false,
      fileUploaded: false,
    });
    render();
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
    trackAgent("agent_response", {
      messageId: generateId("agent_response"),
      content: reply,
    });
  });
})();
