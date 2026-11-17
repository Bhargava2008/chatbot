const maxMessageLength = 12_000;
const requestTimeoutMs = 30_000;

export async function getChatReply(message, { env = process.env, fetchImpl = fetch } = {}) {
  if (typeof message !== "string" || message.trim().length === 0) {
    return { statusCode: 400, body: { error: "Enter a message before sending." } };
  }

  if (message.length > maxMessageLength) {
    return { statusCode: 400, body: { error: `Messages must be ${maxMessageLength} characters or fewer.` } };
  }

  if (!env.GROQ_API_KEY) {
    return { statusCode: 503, body: { error: "The chatbot is not configured. Set GROQ_API_KEY on the server." } };
  }

  try {
    const upstreamResponse = await fetchImpl("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL || "openai/gpt-oss-120b",
        messages: [{ role: "user", content: message }],
      }),
      signal: AbortSignal.timeout(requestTimeoutMs),
    });

    if (!upstreamResponse.ok) {
      console.error(`Groq API returned HTTP ${upstreamResponse.status}.`);
      return { statusCode: 502, body: { error: "The AI service could not complete the request. Please try again." } };
    }

    const result = await upstreamResponse.json();
    const reply = result?.choices?.[0]?.message?.content;
    if (typeof reply !== "string") {
      console.error("Groq API returned an unexpected response shape.");
      return { statusCode: 502, body: { error: "The AI service returned an unexpected response. Please try again." } };
    }

    return { statusCode: 200, body: { reply } };
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") {
      console.error("Groq API request timed out.");
      return { statusCode: 504, body: { error: "The AI service took too long to respond. Please try again." } };
    }
    console.error("Groq API request failed:", error);
    return { statusCode: 502, body: { error: "Could not reach the AI service. Check the server connection and try again." } };
  }
}
