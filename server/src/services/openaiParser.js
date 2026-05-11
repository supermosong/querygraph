const OpenAI = require('openai').default;

const SYSTEM_PROMPT = `You are a data query parser. Convert the user's search query into a JSON object only. No explanation. No extra text.

Output this exact format:
{
  "api": "FRED" | "BLS" | "WORLDBANK" | "ALPHAVANTAGE",
  "seriesId": "<exact series ID>",
  "startYear": <number or null>,
  "endYear": <number or null>,
  "title": "<clean chart title>",
  "unit": "<unit label for y-axis>"
}

API routing rules:
- Inflation, CPI, GDP, interest rates, federal reserve → FRED
- Jobs, unemployment, employment, workforce, labor → BLS
- Global, country GDP, population, world data → WORLDBANK
- Stock, share price, ticker symbols (AAPL, TSLA) → ALPHAVANTAGE

Common FRED series IDs (use these exactly):
- Unemployment rate → UNRATE
- CPI inflation → CPIAUCSL
- US GDP → GDP
- Federal funds rate → FEDFUNDS
- 30-year mortgage rate → MORTGAGE30US
- Core PCE inflation → PCEPILFE
- US national debt → GFDEBTN
- M2 money supply → M2SL

If startYear or endYear is not mentioned, set both to null.
If the query is unrecognizable, return: { "error": "unrecognized query" }`;

async function parseQueryWithOpenAI(query) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 256,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
  });

  const text = response.choices[0].message.content.trim();
  return JSON.parse(text);
}

module.exports = { parseQueryWithOpenAI };
