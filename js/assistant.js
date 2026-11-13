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

  const PENDO_AGENT_ID = "1LCh-JNoMGTG2FOBkGi-4XxkVoU";
  const createId = (prefix) =>
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${prefix}_${Date.now()}`;
  const conversationId = createId("conversation");

  const trackAgent = (eventType, metadata) => {
    if (typeof window.pendo?.trackAgent !== "function") return;
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
    trackAgent("prompt", {
      messageId: createId("prompt"),
      content: text,
      suggestedPrompt: false,
      fileUploaded: false,
    });
    input.value = "";
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
    trackAgent("agent_response", {
      messageId: createId("agent_response"),
      content: reply,
    });
    render();
  });
})();
