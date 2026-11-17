# Simple Chatbot

A plain, responsive chatbot page that sends messages to the Groq chat completions API through a small Node.js backend. The page shows the character and line counts for both the message and the reply.

## Run locally

1. Install Node.js 20 or newer.
2. In PowerShell, set the server environment variables and start the server. Use a new Groq API key for `GROQ_API_KEY`; `.env.example` lists the available settings.

   ```powershell
   $env:GROQ_API_KEY = "your-new-groq-api-key"
   $env:GROQ_MODEL = "openai/gpt-oss-120b"
   npm start
   ```

3. Open http://localhost:3000.

The API key is used only by the backend and must not be added to client-side files or committed to Git. For a hosted deployment, configure `GROQ_API_KEY` as a server environment variable.

## Test

```powershell
npm test
```
