const { parseQueryWithOpenAI } = require('./openaiParser');
const { fetchFREDData } = require('./apis/fred');
const { normalizeData } = require('./dataNormalizer');

async function routeQuery(rawQuery) {
  const parsed = await parseQueryWithOpenAI(rawQuery);

  if (parsed.error) {
    throw new Error(parsed.error);
  }

  const { series_id, title, yLabel, startYear, endYear } = parsed;

  const raw = await fetchFREDData(series_id, startYear, endYear);
  return normalizeData(raw, title, yLabel);
}

module.exports = { routeQuery };
