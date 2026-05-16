# QueryGraph

Type a plain-English question and get an instant interactive graph. No hardcoded data sources — every answer is pulled live from the web and structured by an LLM.

**Example queries:**
- `US unemployment rate 2020-2024`
- `inflation last 5 years`
- `Tesla stock price 2023`

## How It Works

1. You type a query in the search bar
2. The backend asks **Tavily** to search the web for relevant sources
3. Raw page content is fed to **Groq (Llama 3.3 70B)**, which extracts structured `{ labels, values }` data
4. The frontend renders the result as an interactive chart

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, TailwindCSS, custom SVG charts |
| Backend | Node.js, Express |
| Search | Tavily API |
| AI | Groq — `llama-3.3-70b-versatile` |
| Tests | Vitest (frontend) |

## Prerequisites

- Node.js 18+
- Free API keys (see below)

## Setup

**1. Enter the project**

```bash
cd querygraph
```

**2. Backend**

```bash
cd server
npm install
cp .env.example .env
# Add your API keys to .env
```

**3. Frontend**

```bash
cd ../client
npm install
```

## API Keys

Both are free, no credit card required.

| Key | Required? | Get it at |
|---|---|---|
| `TAVILY_API_KEY` | Yes | https://app.tavily.com |
| `GROQ_API_KEY` | Yes | https://console.groq.com |

`server/.env`:

```
TAVILY_API_KEY=your_tavily_key_here
GROQ_API_KEY=your_groq_key_here
PORT=3001
# FRONTEND_URL=https://your-vercel-domain.vercel.app   # set in production for CORS
```

## Running Locally

From the project root, one command starts both servers (via `concurrently`):

```bash
npm install
npm run dev
```

- Backend → http://localhost:3001
- Frontend → http://localhost:5173

Or run them separately:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

## Running Tests

```bash
cd client
npm test
```

24 frontend tests covering chart utilities and the `usePins` hook. (Backend has no tests yet.)

## Project Structure

```
querygraph/
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── dataFetcher.js      # Tavily search → Groq → structured JSON
│   │   │   └── cache.js            # In-memory query cache
│   │   ├── routes/graph.js         # POST /api/graph
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── rateLimit.js        # Per-user daily quotas by tier
│   │   └── index.js
│   └── .env.example
└── client/
    └── src/
        ├── components/             # Navbar, SearchBar, GraphDisplay, charts/, etc.
        ├── hooks/
        │   ├── useGraphData.js     # Fetch + history tracking
        │   └── usePins.js          # Dashboard pin storage
        ├── pages/
        │   ├── Home.jsx
        │   ├── Dashboard.jsx
        │   └── Pricing.jsx
        └── __tests__/
```

## API Endpoint

```
POST /api/graph
Content-Type: application/json

{
  "query":  "US unemployment rate 2021-2023",
  "userId": "anonymous",           // optional, for rate limiting
  "tier":   "free"                  // optional: free | pro
}
```

**Success response:**

```json
{
  "title":     "US Unemployment Rate (2021–2023)",
  "unit":      "%",
  "labels":    ["2021", "2022", "2023"],
  "values":    [5.4, 3.7, 3.6],
  "source":    "Bureau of Labor Statistics",
  "sourceUrl": "https://www.bls.gov"
}
```

**No-data response:**

```json
{ "notFound": true, "reason": "No results found for this query. Try a different topic." }
```

**Errors:** `400` (empty/oversized query), `429` (daily rate limit hit), `5xx` (upstream failure).

## Deploy

- Backend → [Railway](https://railway.app) or [Render](https://render.com) (free tier)
- Frontend → [Vercel](https://vercel.com) (free tier)

After deploying the frontend, set `FRONTEND_URL` on the backend to its domain so CORS allows it.
