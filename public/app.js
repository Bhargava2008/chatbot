const form = document.querySelector("#chat-form");
const input = document.querySelector("#message");
const inputCount = document.querySelector("#input-count");
const sendButton = document.querySelector("#send");
const status = document.querySelector("#status");
const replyElement = document.querySelector("#reply");
const replyCount = document.querySelector("#reply-count");
const result = document.querySelector(".result");

function lineCount(text) {
  return text.length === 0 ? 0 : text.split(/\r\n|\r|\n/).length;
}

function updateInputDetails() {
  inputCount.textContent = `${input.value.length} characters · ${lineCount(input.value)} lines`;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, window.innerHeight * 0.4)}px`;
}

input.addEventListener("input", updateInputDetails);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!input.value.trim()) {
    input.focus();
    return;
  }

  sendButton.disabled = true;
  result.setAttribute("aria-busy", "true");
  status.hidden = false;
  status.textContent = "Waiting for a reply...";
  replyElement.hidden = true;
  replyCount.hidden = true;

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input.value }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "The request failed. Please try again.");
    }

    replyElement.textContent = data.reply;
    replyElement.hidden = false;
    replyCount.textContent = `${data.reply.length} characters · ${lineCount(data.reply)} lines`;
    replyCount.hidden = false;
    status.hidden = true;
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : "Something went wrong. Please try again.";
  } finally {
    sendButton.disabled = false;
    result.setAttribute("aria-busy", "false");
  }
});

updateInputDetails();
