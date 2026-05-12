const { OpenAI } = require('openai');
const { getCached, setCached } = require('./cache');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Return JSON only. No explanation.
Search the web for real time-series data. Use gov/official sources.
Format: {"title":"","unit":"","labels":[],"values":[],"source":"","sourceUrl":""}
Rules:
- labels = time periods only (years like "2020", or months like "Jan 2024"). NEVER column names.
- values = one number per label. Same length as labels.
- Sort oldest→newest.
If no time-series data exists: {"notFound":true,"reason":""}`;

async function fetchGraphData(userQuery) {
  const cached = getCached(userQuery);
  if (cached) return cached;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini-search-preview',
    max_tokens: 500,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: userQuery },
    ],
    web_search_options: {
      search_context_size: 'low',
    },
  });

  const raw = response.choices[0].message.content.trim();

  // Model sometimes prepends search snippets before the JSON — extract the object directly
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { notFound: true, reason: 'Could not parse response. Try rephrasing your query.' };
  }

  let result;
  try {
    result = JSON.parse(jsonMatch[0]);
  } catch {
    return { notFound: true, reason: 'Could not parse response. Try rephrasing your query.' };
  }

  if (!result.notFound) setCached(userQuery, result);
  return result;
}

module.exports = { fetchGraphData };
