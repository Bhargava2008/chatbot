import assert from "node:assert/strict";
import { once } from "node:events";
import test from "node:test";
import { createServer } from "../server.js";

async function withServer(options, run) {
  const server = createServer(options);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    server.close();
    await once(server, "close");
  }
}

test("serves the page and security headers", async () => {
  await withServer({}, async (baseUrl) => {
    const response = await fetch(baseUrl);
    assert.equal(response.status, 200);
    assert.match(await response.text(), /Simple Chatbot/);
    assert.equal(response.headers.get("x-frame-options"), "DENY");
  });
});

test("rejects malformed or empty messages", async () => {
  await withServer({}, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "  " }),
    });
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /Enter a message/);
  });
});

test("reports missing server API configuration", async () => {
  await withServer({ env: {} }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /GROQ_API_KEY/);
  });
});

test("forwards the message securely and returns the reply", async () => {
  let capturedRequest;
  await withServer({
    env: { GROQ_API_KEY: "test-secret", GROQ_MODEL: "test-model" },
    fetchImpl: async (url, options) => {
      capturedRequest = { url, options };
      return new Response(JSON.stringify({
        choices: [{ message: { content: "Hello back\nHow are you?" } }],
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    },
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { reply: "Hello back\nHow are you?" });
  });

  assert.equal(capturedRequest.url, "https://api.groq.com/openai/v1/chat/completions");
  assert.equal(capturedRequest.options.headers.Authorization, "Bearer test-secret");
  assert.deepEqual(JSON.parse(capturedRequest.options.body), {
    model: "test-model",
    messages: [{ role: "user", content: "Hello" }],
  });
});

test("does not expose upstream error details", async () => {
  await withServer({
    env: { GROQ_API_KEY: "test-secret" },
    fetchImpl: async () => new Response("private upstream details", { status: 401 }),
  }, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Hello" }),
    });
    assert.equal(response.status, 502);
    const data = await response.json();
    assert.doesNotMatch(JSON.stringify(data), /private upstream details|test-secret/);
  });
});
