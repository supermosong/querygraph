# Claude-Powered Query Parser Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the keyword-matching `queryParser.js` with a Claude API call that understands any natural language query and returns the correct FRED series ID, so queries like "US job market" or "cost of living trends" work without hardcoded keywords.

**Architecture:** Claude receives the raw user query and returns structured JSON `{ series_id, title, yLabel, startYear, endYear }`. The Express server passes this directly to FRED's `series/observations` endpoint with a dynamic `series_id`. BLS is removed entirely — FRED already mirrors all BLS employment data (e.g. `UNRATE`).

**Tech Stack:** Node.js, Express, `@anthropic-ai/sdk`, FRED REST API, Jest (tests with mocked Anthropic SDK)

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `server/src/services/claudeParser.js` | Call Claude API → return `{ series_id, title, yLabel, startYear, endYear }` |
| Modify | `server/src/services/fred.js` | Accept dynamic `series_id` param instead of hardcoded `CPIAUCSL` |
| Modify | `server/src/services/dataNormalizer.js` | Single `normalizeFRED(data, title, yLabel)` — title/yLabel come from Claude |
| Modify | `server/src/services/apiRouter.js` | Use `claudeParser`, remove BLS branch, call FRED only |
| Delete | `server/src/services/queryParser.js` | Replaced by `claudeParser.js` |
| Delete | `server/src/services/apis/bls.js` | BLS removed — FRED has all the same data |
| Modify | `server/src/routes/graph.js` | Import `claudeParser` instead of `queryParser` |
| Modify | `server/.env` | Add `ANTHROPIC_API_KEY` |
| Modify | `server/.env.example` | Add `ANTHROPIC_API_KEY` placeholder |
| Modify | `server/package.json` | Add `@anthropic-ai/sdk` dependency |
| Replace | `server/tests/queryParser.test.js` → `server/tests/claudeParser.test.js` | Mock Anthropic SDK, test structured output |
| Modify | `server/tests/dataNormalizer.test.js` | Update for new single `normalizeFRED(data, title, yLabel)` signature |

---

## Task 1: Install Anthropic SDK and add API key

**Files:**
- Modify: `server/package.json`
- Modify: `server/.env`
- Modify: `server/.env.example`

- [ ] **Step 1: Install the SDK**

```bash
cd server
npm install @anthropic-ai/sdk
```

Expected output: `added 1 package` (or similar)

- [ ] **Step 2: Add API key to `.env`**

Open `server/.env` and add this line (get key from https://console.anthropic.com):

```
ANTHROPIC_API_KEY=your_key_here
```

Full `.env` should now look like:
```
FRED_API_KEY=your_fred_key
BLS_API_KEY=
ANTHROPIC_API_KEY=your_anthropic_key
PORT=3001
```

- [ ] **Step 3: Update `.env.example`**

Open `server/.env.example` and add:

```
# Register at https://console.anthropic.com
ANTHROPIC_API_KEY=
```

- [ ] **Step 4: Commit**

```bash
git add server/package.json server/package-lock.json server/.env.example
git commit -m "feat: add @anthropic-ai/sdk dependency"
```

(Do NOT commit `.env` — it contains secrets.)

---

## Task 2: Create `claudeParser.js`

**Files:**
- Create: `server/src/services/claudeParser.js`
- Create: `server/tests/claudeParser.test.js`

### What Claude must return

Claude returns JSON with this exact shape:
```json
{
  "series_id": "UNRATE",
  "title": "US Unemployment Rate (2020–2024)",
  "yLabel": "Unemployment Rate (%)",
  "startYear": 2020,
  "endYear": 2024
}
```

If the query is unrecognizable, Claude returns:
```json
{ "error": "Query not recognized. Try topics like unemployment, inflation, GDP, or interest rates." }
```

### Common FRED series Claude should know (include in the prompt)

| Series ID | Topic |
|---|---|
| `UNRATE` | Unemployment rate (%) |
| `PAYEMS` | Total nonfarm payroll (thousands) |
| `CPIAUCSL` | CPI — inflation index |
| `A191RL1A225NBEA` | Real GDP growth rate (%) |
| `FEDFUNDS` | Federal funds interest rate (%) |
| `MORTGAGE30US` | 30-year fixed mortgage rate (%) |
| `HOUST` | Housing starts (thousands) |
| `UMCSENT` | Consumer sentiment index |

- [ ] **Step 1: Write the failing test**

Create `server/tests/claudeParser.test.js`:

```js
// Mock must be declared before any require() calls
jest.mock('@anthropic-ai/sdk', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

const Anthropic = require('@anthropic-ai/sdk').default;
const { parseQueryWithClaude } = require('../src/services/claudeParser');

describe('parseQueryWithClaude', () => {
  let mockCreate;

  beforeEach(() => {
    mockCreate = Anthropic.mock.results[0]?.value.messages.create;
    if (!mockCreate) {
      // Re-instantiate if needed
      const instance = new Anthropic();
      mockCreate = instance.messages.create;
    }
    jest.clearAllMocks();
    // Re-grab after clear
    mockCreate = Anthropic.mock.instances[0]?.messages.create ?? (() => {});
  });

  function mockClaudeResponse(jsonPayload) {
    Anthropic.mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: JSON.stringify(jsonPayload) }],
        }),
      },
    }));
  }

  test('returns structured result for "unemployment rate 2020 2024"', async () => {
    mockClaudeResponse({
      series_id: 'UNRATE',
      title: 'US Unemployment Rate (2020–2024)',
      yLabel: 'Unemployment Rate (%)',
      startYear: 2020,
      endYear: 2024,
    });

    const result = await parseQueryWithClaude('unemployment rate 2020 2024');
    expect(result.series_id).toBe('UNRATE');
    expect(result.startYear).toBe(2020);
    expect(result.endYear).toBe(2024);
    expect(result.title).toContain('Unemployment');
    expect(result.yLabel).toBeTruthy();
  });

  test('returns structured result for vague query "US job market"', async () => {
    mockClaudeResponse({
      series_id: 'UNRATE',
      title: 'US Unemployment Rate (2020–2025)',
      yLabel: 'Unemployment Rate (%)',
      startYear: 2020,
      endYear: 2025,
    });

    const result = await parseQueryWithClaude('US job market');
    expect(result.series_id).toBe('UNRATE');
    expect(result.error).toBeUndefined();
  });

  test('returns error for completely unrecognizable query', async () => {
    mockClaudeResponse({
      error: 'Query not recognized. Try topics like unemployment, inflation, GDP, or interest rates.',
    });

    const result = await parseQueryWithClaude('purple elephant dancing');
    expect(result.error).toBeTruthy();
    expect(result.series_id).toBeUndefined();
  });

  test('throws if Claude returns malformed JSON', async () => {
    Anthropic.mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ type: 'text', text: 'not json at all' }],
        }),
      },
    }));

    await expect(parseQueryWithClaude('unemployment')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd server
npm test -- --testPathPattern=claudeParser
```

Expected: FAIL — `Cannot find module '../src/services/claudeParser'`

- [ ] **Step 3: Implement `claudeParser.js`**

Create `server/src/services/claudeParser.js`:

```js
const Anthropic = require('@anthropic-ai/sdk').default;

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are an economic data assistant. Given a plain-English query, return a JSON object identifying the best FRED series to display.

Available FRED series:
- UNRATE: US Unemployment Rate (%)
- PAYEMS: Total Nonfarm Payroll (thousands of jobs)
- CPIAUCSL: Consumer Price Index — inflation
- A191RL1A225NBEA: Real GDP Growth Rate (%)
- FEDFUNDS: Federal Funds Interest Rate (%)
- MORTGAGE30US: 30-Year Fixed Mortgage Rate (%)
- HOUST: Housing Starts (thousands of units)
- UMCSENT: Consumer Sentiment Index

Return ONLY valid JSON, no markdown, no explanation.

If the query maps to a known topic, return:
{
  "series_id": "<FRED series ID>",
  "title": "<descriptive title including year range, e.g. 'US Unemployment Rate (2020–2024)'>",
  "yLabel": "<y-axis label, e.g. 'Unemployment Rate (%)'>",
  "startYear": <number>,
  "endYear": <number>
}

If no date range is mentioned, default startYear to (current year - 5) and endYear to current year.

If the query is completely unrecognizable, return:
{ "error": "Query not recognized. Try topics like unemployment, inflation, GDP, or interest rates." }`;

async function parseQueryWithClaude(query) {
  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 256,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: query }],
  });

  const text = response.content[0].text.trim();
  return JSON.parse(text);
}

module.exports = { parseQueryWithClaude };
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm test -- --testPathPattern=claudeParser
```

Expected: PASS (all 4 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/services/claudeParser.js server/tests/claudeParser.test.js
git commit -m "feat: add Claude-powered query parser"
```

---

## Task 3: Update `fred.js` to accept a dynamic `series_id`

**Files:**
- Modify: `server/src/services/apis/fred.js`

Currently `fred.js` hardcodes `series_id: 'CPIAUCSL'`. It needs to accept any series ID.

- [ ] **Step 1: Replace `fred.js` with the dynamic version**

Open `server/src/services/apis/fred.js` and replace the entire file with:

```js
const fetch = require('node-fetch');

const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Fetches annual observations for any FRED series ID
// Returns { labels: string[], values: number[] }
async function fetchFREDData(seriesId, startYear, endYear) {
  if (!process.env.FRED_API_KEY) {
    throw new Error('FRED_API_KEY is missing. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html');
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: process.env.FRED_API_KEY,
    file_type: 'json',
    observation_start: `${startYear}-01-01`,
    observation_end: `${endYear}-12-31`,
    frequency: 'a',
    units: 'lin',
  });

  const response = await fetch(`${FRED_API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`FRED API returned HTTP ${response.status}. Check your API key.`);
  }

  const json = await response.json();

  if (json.error_code) {
    throw new Error(`FRED API error: ${json.error_message}`);
  }

  if (!json.observations || json.observations.length === 0) {
    throw new Error('FRED returned no data for this date range.');
  }

  const valid = json.observations.filter((obs) => obs.value !== '.');

  if (valid.length === 0) {
    throw new Error('FRED returned data but all values were missing for this date range.');
  }

  const labels = valid.map((obs) => obs.date.substring(0, 4));
  const values = valid.map((obs) => Math.round(parseFloat(obs.value) * 10) / 10);

  return { labels, values };
}

module.exports = { fetchFREDData };
```

Key change: signature is now `fetchFREDData(seriesId, startYear, endYear)` — `seriesId` is the first argument and is dynamic. `units` changed from `'pc1'` (percent change) to `'lin'` (raw values) because Claude will pick the right series for percent-change topics (e.g. `A191RL1A225NBEA` is already a growth rate).

- [ ] **Step 2: Run all existing tests to make sure nothing is broken**

```bash
npm test
```

Expected: existing `dataNormalizer.test.js` still passes (it doesn't touch `fred.js`). `queryParser.test.js` still passes (not deleted yet).

- [ ] **Step 3: Commit**

```bash
git add server/src/services/apis/fred.js
git commit -m "feat: make fetchFREDData accept dynamic series_id"
```

---

## Task 4: Simplify `dataNormalizer.js` to a single function

**Files:**
- Modify: `server/src/services/dataNormalizer.js`
- Modify: `server/tests/dataNormalizer.test.js`

Claude now provides the title and yLabel, so the normalizer no longer needs hardcoded BLS/FRED variants.

- [ ] **Step 1: Write the updated test first**

Replace the entire contents of `server/tests/dataNormalizer.test.js`:

```js
const { normalizeData } = require('../src/services/dataNormalizer');

describe('normalizeData', () => {
  const raw = { labels: ['2020', '2021', '2022'], values: [8.1, 5.4, 3.7] };

  test('builds chart object with provided title and yLabel', () => {
    const result = normalizeData(raw, 'US Unemployment Rate (2020–2022)', 'Unemployment Rate (%)');
    expect(result.title).toBe('US Unemployment Rate (2020–2022)');
    expect(result.yLabel).toBe('Unemployment Rate (%)');
  });

  test('sets xLabel to "Year"', () => {
    const result = normalizeData(raw, 'Any Title', 'Any Label');
    expect(result.xLabel).toBe('Year');
  });

  test('passes through labels and values unchanged', () => {
    const result = normalizeData(raw, 'T', 'L');
    expect(result.labels).toEqual(['2020', '2021', '2022']);
    expect(result.values).toEqual([8.1, 5.4, 3.7]);
  });

  test('sets FRED source and URL', () => {
    const result = normalizeData(raw, 'T', 'L');
    expect(result.source).toBe('Federal Reserve Economic Data (FRED)');
    expect(result.sourceUrl).toBe('https://fred.stlouisfed.org');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm test -- --testPathPattern=dataNormalizer
```

Expected: FAIL — `normalizeData is not a function`

- [ ] **Step 3: Replace `dataNormalizer.js`**

Replace the entire contents of `server/src/services/dataNormalizer.js`:

```js
function normalizeData(fredData, title, yLabel) {
  return {
    title,
    xLabel: 'Year',
    yLabel,
    labels: fredData.labels,
    values: fredData.values,
    source: 'Federal Reserve Economic Data (FRED)',
    sourceUrl: 'https://fred.stlouisfed.org',
  };
}

module.exports = { normalizeData };
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm test -- --testPathPattern=dataNormalizer
```

Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add server/src/services/dataNormalizer.js server/tests/dataNormalizer.test.js
git commit -m "refactor: simplify dataNormalizer to single normalizeData function"
```

---

## Task 5: Update `apiRouter.js` to use Claude + FRED only

**Files:**
- Modify: `server/src/services/apiRouter.js`

Remove the BLS branch. Call `parseQueryWithClaude` then `fetchFREDData` with the dynamic `series_id`.

- [ ] **Step 1: Replace `apiRouter.js`**

Replace the entire contents of `server/src/services/apiRouter.js`:

```js
const { parseQueryWithClaude } = require('./claudeParser');
const { fetchFREDData } = require('./apis/fred');
const { normalizeData } = require('./dataNormalizer');

async function routeQuery(rawQuery) {
  const parsed = await parseQueryWithClaude(rawQuery);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  const { series_id, title, yLabel, startYear, endYear } = parsed;

  const raw = await fetchFREDData(series_id, startYear, endYear);
  return normalizeData(raw, title, yLabel);
}

module.exports = { routeQuery };
```

- [ ] **Step 2: Run all tests**

```bash
npm test
```

Expected: all tests pass. `apiRouter` has no dedicated test file — it's covered by integration.

- [ ] **Step 3: Commit**

```bash
git add server/src/services/apiRouter.js
git commit -m "refactor: apiRouter now uses Claude + FRED only, removes BLS"
```

---

## Task 6: Update `graph.js` route and delete unused files

**Files:**
- Modify: `server/src/routes/graph.js`
- Delete: `server/src/services/queryParser.js`
- Delete: `server/src/services/apis/bls.js`
- Delete: `server/tests/queryParser.test.js`

- [ ] **Step 1: Update `graph.js` to remove `parseQuery` import**

Replace the entire contents of `server/src/routes/graph.js`:

```js
const express = require('express');
const router = express.Router();
const { routeQuery } = require('../services/apiRouter');

router.post('/graph', async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty "query" string is required in the request body.' });
  }

  try {
    const data = await routeQuery(query.trim());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
```

- [ ] **Step 2: Delete unused files**

```bash
rm server/src/services/queryParser.js
rm server/src/services/apis/bls.js
rm server/tests/queryParser.test.js
```

- [ ] **Step 3: Run all tests to confirm nothing broke**

```bash
npm test
```

Expected: PASS — only `claudeParser.test.js` and `dataNormalizer.test.js` run now.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: remove BLS and keyword queryParser, wire up Claude end-to-end"
```

---

## Task 7: Manual end-to-end verification

No code changes. Verify the full stack works with real queries.

- [ ] **Step 1: Start the server**

```bash
cd server
npm run dev
```

Expected: `QueryGraph server running at http://localhost:3001`

- [ ] **Step 2: Test a vague employment query (the old failure case)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/graph" -Method POST -ContentType "application/json" -Body '{"query": "US job market"}'
```

Expected: response with `series_id`-driven data, `title` set by Claude, `labels` and `values` from FRED.

- [ ] **Step 3: Test a GDP query (new topic — impossible with old parser)**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/graph" -Method POST -ContentType "application/json" -Body '{"query": "GDP growth last 10 years"}'
```

Expected: response with FRED data for `A191RL1A225NBEA`.

- [ ] **Step 4: Test an unrecognizable query returns a clean error**

```powershell
Invoke-RestMethod -Uri "http://localhost:3001/api/graph" -Method POST -ContentType "application/json" -Body '{"query": "purple elephant"}'
```

Expected: HTTP 500 with `{ "error": "Query not recognized..." }` — not a raw crash.

- [ ] **Step 5: Start the frontend and test via UI**

```bash
cd ../client
npm run dev
```

Open http://localhost:5173, type "US job market" in the search bar — chart should render.

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: Claude-powered query parser fully wired end-to-end"
```

---

## Summary of What Changed

| Before | After |
|---|---|
| Keyword matching (brittle) | Claude understands any natural language |
| 2 hardcoded series (UNRATE via BLS, CPIAUCSL via FRED) | Any FRED series — hundreds of topics |
| Two separate APIs (BLS + FRED) | One API (FRED only) |
| `normalizeBLS` + `normalizeFRED` | Single `normalizeData(data, title, yLabel)` |
| Fails on "US job" | Works on "US job market", "jobless claims", etc. |
