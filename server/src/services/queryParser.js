// queryParser.js — reads a plain-English query, extracts topic + date range

const EMPLOYMENT_KEYWORDS = ['job', 'jobs', 'employment', 'unemployment', 'workforce', 'labor', 'labour'];
const ECONOMICS_KEYWORDS = ['inflation', 'gdp', 'cpi', 'interest rate', 'federal reserve', 'recession'];

// Extracts start/end year from the query string
function extractDateRange(lower) {
  // Match "2020-2024" or "2020–2024"
  const rangeMatch = lower.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) {
    return { startYear: parseInt(rangeMatch[1]), endYear: parseInt(rangeMatch[2]) };
  }

  // Match "last N years"
  const lastNMatch = lower.match(/last\s+(\d+)\s+years?/);
  if (lastNMatch) {
    const n = parseInt(lastNMatch[1]);
    const endYear = new Date().getFullYear();
    return { startYear: endYear - n, endYear };
  }

  // Match two space-separated 4-digit years e.g. "2018 2023"
  const spaceRangeMatch = lower.match(/(\d{4})\s+(\d{4})/);
  if (spaceRangeMatch) {
    return { startYear: parseInt(spaceRangeMatch[1]), endYear: parseInt(spaceRangeMatch[2]) };
  }

  // Default: last 5 years
  const endYear = new Date().getFullYear();
  return { startYear: endYear - 5, endYear };
}

// Parses a query and returns { topic, api, startYear, endYear }
function parseQuery(query) {
  const lower = query.toLowerCase();
  const { startYear, endYear } = extractDateRange(lower);

  if (EMPLOYMENT_KEYWORDS.some((k) => lower.includes(k))) {
    return { topic: 'employment', api: 'BLS', startYear, endYear };
  }

  if (ECONOMICS_KEYWORDS.some((k) => lower.includes(k))) {
    return { topic: 'economics', api: 'FRED', startYear, endYear };
  }

  return { topic: null, api: null, startYear, endYear };
}

module.exports = { parseQuery };
