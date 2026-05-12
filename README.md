# QueryGraph

Type any plain-English question and instantly see real data as an interactive chart.
Powered by Tavily web search and Groq (Llama 3.3 70B) — no hardcoded APIs, no series IDs.

## How to run locally

1. **Get free API keys** (no credit card needed):
   - Tavily: https://app.tavily.com
   - Groq: https://console.groq.com

2. **Set up the backend:**
   ```bash
   cd server
   cp .env.example .env
   # Add your TAVILY_API_KEY and GROQ_API_KEY to .env
   npm install
   npm run dev
   ```

3. **Set up the frontend:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

4. Open http://localhost:5174

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `TAVILY_API_KEY` | Yes | Web search — get free at app.tavily.com |
| `GROQ_API_KEY` | Yes | AI parsing — get free at console.groq.com |
| `PORT` | No | Backend port (default: 3001) |
| `FRONTEND_URL` | No | Allowed CORS origin in production |

## Tech stack

- **Frontend:** React 18 + Vite + Recharts + TailwindCSS
- **Backend:** Node.js + Express
- **Search:** Tavily API
- **AI:** Groq — llama-3.3-70b-versatile

## Deploy

- Backend → [Railway](https://railway.app) or [Render](https://render.com) (free tier)
- Frontend → [Vercel](https://vercel.com) (free tier)

Set `FRONTEND_URL` on the backend to your Vercel domain after deploying.
