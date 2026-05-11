const { keywordMatch }           = require('./queryParser');
const { parseQueryWithOpenAI }   = require('./openaiParser');
const { searchFREDSeries }       = require('./apis/fredSearch');
const { searchWorldBankIndicator } = require('./apis/worldbankSearch');
const { fetchFREDData }          = require('./apis/fred');
const { fetchBLSData }           = require('./apis/bls');
const { fetchAlphaVantageData }  = require('./apis/alphavantage');
const { fetchWorldBankData }     = require('./apis/worldbank');
const { normalizeData }          = require('./dataNormalizer');

const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_START = CURRENT_YEAR - 5;

const NOT_FOUND = {
  status: 'not_found',
  message: "We couldn't find data for that query.",
  suggestions: [
    "Try: 'US unemployment rate 2020-2024'",
    "Try: 'inflation last 10 years'",
    "Try: 'US GDP growth'",
    "Try: 'China population 2000 2020'",
    "Try: a stock ticker like 'AAPL 2020 2024'",
  ],
};

async function routeQuery(rawQuery) {
  // ── Layer 1: Keyword match (free, instant) ──────────────────────────────
  const keyword = keywordMatch(rawQuery);
  if (keyword) {
    const { api, seriesId, title, unit, startYear, endYear } = keyword;
    return await fetchAndNormalize(api, seriesId, title, unit, startYear, endYear);
  }

  // ── Layer 2: OpenAI classifies → dynamic API search ────────────────────
  try {
    const parsed = await parseQueryWithOpenAI(rawQuery);

    if (!parsed || parsed.api === 'NONE') return NOT_FOUND;

    const startYear = parsed.startYear ?? DEFAULT_START;
    const endYear   = parsed.endYear   ?? CURRENT_YEAR;

    if (parsed.api === 'FRED') {
      const series = await searchFREDSeries(parsed.searchTerm);
      if (!series) return NOT_FOUND;
      const raw = await fetchFREDData(series.id, startYear, endYear);
      return normalizeData(raw, series.title, series.unit, 'FRED');
    }

    if (parsed.api === 'BLS') {
      // FRED mirrors BLS data and has a search API — use it for unknown BLS queries
      const series = await searchFREDSeries(parsed.searchTerm);
      if (!series) return NOT_FOUND;
      const raw = await fetchFREDData(series.id, startYear, endYear);
      return normalizeData(raw, series.title, series.unit, 'FRED');
    }

    if (parsed.api === 'WORLDBANK') {
      const countryCode = parsed.countryCode || 'WLD';
      const indicator = await searchWorldBankIndicator(parsed.searchTerm);
      if (!indicator) return NOT_FOUND;
      const seriesId = `${countryCode}/${indicator.id}`;
      const raw = await fetchWorldBankData(seriesId, startYear, endYear);
      return normalizeData(raw, `${indicator.title} — ${countryCode}`, 'Value', 'WORLDBANK');
    }

    if (parsed.api === 'ALPHAVANTAGE') {
      const ticker = parsed.ticker || parsed.searchTerm;
      const raw = await fetchAlphaVantageData(ticker.toUpperCase(), startYear, endYear);
      return normalizeData(raw, `${ticker.toUpperCase()} Stock Price`, 'USD', 'ALPHAVANTAGE');
    }

    return NOT_FOUND;
  } catch {
    // ── Layer 3: Graceful fallback — never crash ────────────────────────
    return NOT_FOUND;
  }
}

async function fetchAndNormalize(api, seriesId, title, unit, startYear, endYear) {
  if (api === 'FRED')         return normalizeData(await fetchFREDData(seriesId, startYear, endYear),         title, unit, 'FRED');
  if (api === 'BLS')          return normalizeData(await fetchBLSData(seriesId, startYear, endYear),          title, unit, 'BLS');
  if (api === 'WORLDBANK')    return normalizeData(await fetchWorldBankData(seriesId, startYear, endYear),    title, unit, 'WORLDBANK');
  if (api === 'ALPHAVANTAGE') return normalizeData(await fetchAlphaVantageData(seriesId, startYear, endYear), title, unit, 'ALPHAVANTAGE');
  return NOT_FOUND;
}

module.exports = { routeQuery };
