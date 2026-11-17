# Simple Chatbot

A plain, responsive chatbot page that sends messages to the Groq chat completions API through a small Node.js backend. The page shows the character and line counts for both the message and the reply.

## Run locally

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env` and set `GROQ_API_KEY` to a new Groq API key. You can optionally change `GROQ_MODEL` and `PORT`.
3. In PowerShell, set the variables for the current process and start the server:

   ```powershell
   $env:GROQ_API_KEY = "your-new-groq-api-key"
   $env:GROQ_MODEL = "openai/gpt-oss-120b"
   npm start
   ```

4. Open http://localhost:3000.

The API key is used only by the backend and must not be added to client-side files or committed to Git. For a hosted deployment, configure `GROQ_API_KEY` as a server environment variable.

## Test

```powershell
npm test
```
