const OpenAI = require('openai').default;

const SYSTEM_PROMPT = `You are a data API router. Given a user query, return JSON only. No explanation. No extra text.

Output this exact format:
{
  "api": "FRED" | "BLS" | "WORLDBANK" | "ALPHAVANTAGE" | "NONE",
  "searchTerm": "<best search term to find this data in that API>",
  "ticker": "<stock ticker symbol, only for ALPHAVANTAGE, else null>",
  "countryCode": "<ISO 2-letter country code, only for WORLDBANK, else null>",
  "startYear": <number or null>,
  "endYear": <number or null>
}

API routing rules:
- FRED: US economic data — inflation, interest rates, housing, money supply, debt, wages, manufacturing
- BLS: US jobs and labor — employment levels, unemployment by sector, labor statistics
- WORLDBANK: Global/country data — GDP, population, health, energy, CO2, trade (any country)
- ALPHAVANTAGE: Stock prices and crypto — use ticker symbol as searchTerm AND ticker field
- NONE: Query cannot be answered with economic/financial data

For WORLDBANK, set countryCode to the ISO 2-letter code (US, CN, IN, GB, DE, JP, etc.) or "WLD" for world totals.

If startYear or endYear is not mentioned, set both to null.
If the query is about something with no matching data source, set api to "NONE".`;

async function parseQueryWithOpenAI(query) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    max_tokens: 200,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query },
    ],
  });

  const text = response.choices[0].message.content.trim();
  return JSON.parse(text);
}

module.exports = { parseQueryWithOpenAI };
