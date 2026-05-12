const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
You are a data visualization assistant with live web search access.
When given a query, search the web for real statistical data and return JSON only.
No explanation. No markdown. No extra text. Raw JSON only.

Return this exact format:
{
  "title": "<clear chart title>",
  "unit": "<y-axis label e.g. 'Percentage (%)', 'Billions USD', 'Thousands'>",
  "labels": ["2019", "2020", "2021", "2022", "2023"],
  "values": [3.7, 8.1, 5.4, 3.6, 3.4],
  "source": "<name of data source e.g. 'Bureau of Labor Statistics'>",
  "sourceUrl": "<direct URL to the data>"
}

Rules:
- ALWAYS search the web before answering — never guess numbers
- Prefer data from: bls.gov, fred.stlouisfed.org, data.worldbank.org, census.gov, imf.org
- Use yearly data for multi-year queries, monthly for single-year queries
- Sort data oldest to newest
- labels and values must have the same length
- If truly no numeric time-series data exists anywhere, return:
  { "notFound": true, "reason": "<specific reason why>" }
`.trim();

async function fetchGraphData(userQuery) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini-search-preview',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userQuery },
    ],
    web_search_options: {
      search_context_size: 'medium',
    },
  });

  const raw = response.choices[0].message.content.trim();
  const cleaned = raw.replace(/^```json|^```|```$/gm, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return { notFound: true, reason: 'Could not parse response. Try rephrasing your query.' };
  }
}

module.exports = { fetchGraphData };
