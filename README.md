# Simple Chatbot

A plain, responsive chatbot page that sends messages to the Groq chat completions API through a small Node.js backend. The page shows the character and line counts for both the message and the reply.

## Run locally

1. Install Node.js 20.6 or newer.
2. Copy `.env.example` to `.env`, then replace the placeholder with a new Groq API key. In PowerShell:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   npm start
   ```

3. Open http://localhost:3000.

The start command loads `.env` into the backend process. The API key must not be added to client-side files or committed to Git; `.env` is ignored by Git. For a hosted deployment, configure `GROQ_API_KEY` as a server environment variable instead.

## Test

```powershell
npm test
```
