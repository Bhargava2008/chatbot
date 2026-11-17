import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { getChatReply } from "./chat-handler.js";

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDirectory = path.join(root, "public");
const maxRequestBytes = 64 * 1024;
const staticFiles = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
]);

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  response.end(JSON.stringify(data));
}

async function readJsonBody(request) {
  let bytes = 0;
  const chunks = [];

  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > maxRequestBytes) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

export function createServer({ env = process.env, fetchImpl = fetch } = {}) {
  return createHttpServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("X-Frame-Options", "DENY");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Content-Security-Policy", "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; base-uri 'none'; frame-ancestors 'none'");

    const requestUrl = new URL(request.url, "http://localhost");

    if (request.method === "GET" && staticFiles.has(requestUrl.pathname)) {
      const [fileName, contentType] = staticFiles.get(requestUrl.pathname);
      try {
        const content = await readFile(path.join(publicDirectory, fileName));
        response.writeHead(200, {
          "Content-Type": contentType,
          "Cache-Control": "no-cache",
        });
        response.end(content);
      } catch (error) {
        console.error("Failed to read a public asset:", error);
        sendJson(response, 500, { error: "The website could not be served." });
      }
      return;
    }

    if (requestUrl.pathname !== "/api/chat") {
      sendJson(response, 404, { error: "Not found." });
      return;
    }

    if (request.method !== "POST") {
      response.setHeader("Allow", "POST");
      sendJson(response, 405, { error: "Method not allowed." });
      return;
    }

    if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
      sendJson(response, 415, { error: "Content-Type must be application/json." });
      return;
    }

    let body;
    try {
      body = await readJsonBody(request);
    } catch (error) {
      sendJson(response, error.statusCode ?? 400, { error: error.message });
      return;
    }

    const result = await getChatReply(body?.message, { env, fetchImpl });
    sendJson(response, result.statusCode, result.body);
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number.parseInt(process.env.PORT || "3000", 10);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    console.error("PORT must be a valid TCP port between 1 and 65535.");
    process.exitCode = 1;
  } else {
    createServer().listen(port, () => {
      console.log(`Chatbot server listening on http://localhost:${port}`);
    });
  }
}
