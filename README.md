# QueryGraph

Type a plain-English question and get an instant interactive graph, powered by free public APIs.

**Example queries:**
- `US unemployment rate 2020-2024`
- `inflation last 5 years`
- `US inflation rate 2018-2023`

## How It Works

1. You type a query in the search bar
2. The backend parses it (keyword matching) and picks the right data source
3. Real data is fetched from BLS or FRED
4. A line chart renders in the browser

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Recharts, TailwindCSS |
| Backend | Node.js, Express |
| APIs | BLS (employment), FRED (economics) |
| Tests | Jest (backend), Vitest (frontend) |

## Prerequisites

- Node.js 18+
- Free API keys (see below)

## Setup

**1. Clone and enter the project**

```bash
cd querygraph
```

**2. Install all dependencies**

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

**3. Add your API keys**

```bash
cp server/.env.example server/.env
# Edit server/.env and add your keys
```

## API Keys

Both are free and take under a minute to get.

| Key | Required? | Get it at |
|---|---|---|
| `FRED_API_KEY` | Yes (for inflation/economics queries) | https://fred.stlouisfed.org/docs/api/api_key.html |
| `BLS_API_KEY` | No (optional — raises rate limit from 500 to 2500 req/day) | https://data.bls.gov/registrationEngine/ |

Add them to `server/.env`:

```
FRED_API_KEY=your_key_here
BLS_API_KEY=your_key_here
PORT=3001
```

## Running Locally

From the `querygraph/` root, one command starts both the backend and frontend:

```bash
npm run dev
```

Then open http://localhost:5173.

- Backend runs on http://localhost:3001
- Frontend runs on http://localhost:5173

## Running Tests

```bash
cd server
npm test
```

19 unit tests covering query parsing and data normalization.

## Supported Query Topics

| Keywords | Data Source | Example |
|---|---|---|
| job, employment, unemployment, workforce, labor | BLS | `US unemployment rate 2020-2024` |
| inflation, gdp, cpi, interest rate, federal reserve, recession | FRED | `inflation last 5 years` |

**Date formats understood:**
- Explicit range: `2020-2024`
- Last N years: `last 3 years`
- No date: defaults to last 5 years

## Project Structure

```
querygraph/
├── server/
│   ├── src/
│   │   ├── services/
│   │   │   ├── queryParser.js      # Keyword → topic + date range
│   │   │   ├── apiRouter.js        # Dispatch to correct API
│   │   │   ├── dataNormalizer.js   # Normalize to { labels, values }
│   │   │   └── apis/
│   │   │       ├── bls.js          # Bureau of Labor Statistics
│   │   │       └── fred.js         # Federal Reserve Economic Data
│   │   ├── routes/graph.js         # POST /api/graph
│   │   ├── middleware/
│   │   │   └── errorHandler.js
│   │   └── index.js
│   └── tests/
└── client/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   ├── SearchBar.jsx
        │   └── GraphDisplay.jsx
        ├── hooks/useGraphData.js
        └── pages/Home.jsx
```

## API Endpoint

```
POST /api/graph
Content-Type: application/json

{ "query": "US unemployment rate 2021-2023" }
```

Response:
```json
{
  "title": "US Unemployment Rate (2021–2023)",
  "xLabel": "Year",
  "yLabel": "Unemployment Rate (%)",
  "labels": ["2021", "2022", "2023"],
  "values": [5.4, 3.7, 3.6],
  "source": "Bureau of Labor Statistics",
  "sourceUrl": "https://www.bls.gov"
}
```
