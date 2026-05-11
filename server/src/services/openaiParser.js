const OpenAI = require('openai').default;

const SYSTEM_PROMPT = `You are an economic data assistant. Given a plain-English query, return a JSON object identifying the best FRED series to display.

Available FRED series:
- UNRATE: US Unemployment Rate (%)
- PAYEMS: Total Nonfarm Payroll (thousands of jobs)
- CPIAUCSL: Consumer Price Index — inflation index
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
