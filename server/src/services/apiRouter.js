// apiRouter.js — dispatches a parsed query to the correct API and returns normalized data

const { fetchBLSData } = require('./apis/bls');
const { fetchFREDData } = require('./apis/fred');
const { normalizeBLS, normalizeFRED } = require('./dataNormalizer');

// Routes the parsed query to the correct data source and returns normalized chart data
// Throws a human-readable error if topic is unknown or API call fails
async function routeQuery(parsedQuery) {
  const { topic, api, startYear, endYear } = parsedQuery;

  if (!topic) {
    throw new Error(
      'Query not recognized. Try topics like "unemployment rate", "inflation", "GDP", or "CPI".'
    );
  }

  if (api === 'BLS') {
    const raw = await fetchBLSData(startYear, endYear);
    return normalizeBLS(raw, startYear, endYear);
  }

  if (api === 'FRED') {
    const raw = await fetchFREDData(startYear, endYear);
    return normalizeFRED(raw, startYear, endYear);
  }

  // This branch only triggers if a new topic was added to queryParser without updating apiRouter
  throw new Error(`Unsupported API target: "${api}". This is a bug — please report it.`);
}

module.exports = { routeQuery };
