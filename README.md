# Simple Chatbot

A plain, responsive chatbot page that sends messages to the Groq chat completions API through a small Node.js backend. The page shows the character and line counts for both the message and the reply.

## Run locally

1. Install Node.js 22.
2. Copy `.env.example` to `.env`, then replace the placeholder with a new Groq API key. In PowerShell:

   ```powershell
   Copy-Item .env.example .env
   notepad .env
   npm start
   ```

3. Open http://localhost:3000.

The start command loads `.env` into the backend process. The API key must not be added to client-side files or committed to Git; `.env` is ignored by Git.

## Deploy to Vercel

The static page is served from `public/`, and `api/chat.js` is the Vercel serverless API function. In the Vercel project settings, add `GROQ_API_KEY` as an environment variable for the Production environment (and Preview if needed), then redeploy. Do not put the key in frontend code or commit it.

## Test

```powershell
npm test
```
