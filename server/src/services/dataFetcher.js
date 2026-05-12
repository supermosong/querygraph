// dataFetcher.js — searches Tavily for real data, uses Groq to structure it as JSON
const axios = require('axios');
const Groq  = require('groq-sdk');
const { getCached, setCached } = require('./cache');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TAVILY_URL = 'https://api.tavily.com/search';

// Trusted domains for statistical data
const INCLUDE_DOMAINS = [
  'fred.stlouisfed.org',
  'bls.gov',
  'data.worldbank.org',
  'tradingeconomics.com',
  'statista.com',
  'census.gov',
  'imf.org',
];

const SYSTEM_PROMPT = `Return JSON only. No explanation. No markdown.
Extract real time-series data from the text below.
Format: {"title":"","unit":"","labels":[],"values":[],"source":"","sourceUrl":""}
If no numeric data: {"notFound":true,"reason":""}
Rules: sort oldest→newest, labels = time periods only (years or months, NEVER column names), labels and values same length.`;

// Searches Tavily for the query and returns the top result content joined into one string
async function searchTavily(query) {
  const response = await axios.post(
    TAVILY_URL,
    {
      api_key:        process.env.TAVILY_API_KEY,
      query,
      search_depth:   'basic',
      max_results:    3,
      include_domains: INCLUDE_DOMAINS,
    },
    { headers: { 'Content-Type': 'application/json' } }
  );

  const results = response.data.results || [];
  if (results.length === 0) return null;

  // Join result snippets, cap at 2000 chars to control Groq token cost
  const combined = results
    .map((r) => `${r.title}\n${r.content}`)
    .join('\n\n')
    .slice(0, 2000);

  return combined;
}

// Sends search content to Groq and extracts structured graph data
async function parseWithGroq(searchContent, userQuery) {
  const response = await groq.chat.completions.create({
    model:       'llama-3.3-70b-versatile',
    temperature: 0,
    max_tokens:  400,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user',   content: `Query: ${userQuery}\n\nSearch results:\n${searchContent}` },
    ],
  });

  const raw     = response.choices[0].message.content.trim();
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { notFound: true, reason: 'Could not parse response. Try rephrasing your query.' };

  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return { notFound: true, reason: 'Could not parse response. Try rephrasing your query.' };
  }
}

// Main export — check cache, search Tavily, parse with Groq, return graph data
async function fetchGraphData(userQuery) {
  const cached = getCached(userQuery);
  if (cached) return cached;

  const searchContent = await searchTavily(userQuery);
  if (!searchContent) {
    return { notFound: true, reason: 'No results found for this query. Try a different topic.' };
  }

  const result = await parseWithGroq(searchContent, userQuery);

  if (!result.notFound) setCached(userQuery, result);
  return result;
}

module.exports = { fetchGraphData };
