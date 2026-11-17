import { getChatReply } from "../chat-handler.js";

export default async function handler(request, response) {
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.setHeader("Cache-Control", "no-store");

  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed." });
  }

  if (!request.headers["content-type"]?.toLowerCase().startsWith("application/json")) {
    return response.status(415).json({ error: "Content-Type must be application/json." });
  }

  const { statusCode, body } = await getChatReply(request.body?.message);
  return response.status(statusCode).json(body);
}
