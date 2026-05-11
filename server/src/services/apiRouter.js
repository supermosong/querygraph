const { parseQueryWithOpenAI } = require('./openaiParser');
const { fetchFREDData } = require('./apis/fred');
const { normalizeData } = require('./dataNormalizer');

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_START = CURRENT_YEAR - 5;

async function routeQuery(rawQuery) {
  const parsed = await parseQueryWithOpenAI(rawQuery);

  if (parsed.error) {
    throw new Error('Query not recognized. Try topics like unemployment, inflation, GDP, or interest rates.');
  }

  const { api, seriesId, title, unit } = parsed;
  const startYear = parsed.startYear ?? DEFAULT_START;
  const endYear = parsed.endYear ?? CURRENT_YEAR;

  if (api === 'FRED') {
    const raw = await fetchFREDData(seriesId, startYear, endYear);
    return normalizeData(raw, title, unit);
  }

  throw new Error(`"${api}" data is not supported yet. Try asking about inflation, GDP, or interest rates.`);
}

module.exports = { routeQuery };
