const fetch = require('node-fetch');

const FRED_SEARCH_URL = 'https://api.stlouisfed.org/fred/series/search';

// Searches FRED's 800k+ series by keyword, returns the most popular match
// Returns { id, title, unit } or null
async function searchFREDSeries(searchTerm) {
  if (!process.env.FRED_API_KEY) {
    throw new Error('FRED_API_KEY is missing.');
  }

  const params = new URLSearchParams({
    search_text: searchTerm,
    api_key: process.env.FRED_API_KEY,
    file_type: 'json',
    limit: '5',
    order_by: 'popularity',
    sort_order: 'desc',
  });

  const response = await fetch(`${FRED_SEARCH_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`FRED search returned HTTP ${response.status}.`);
  }

  const json = await response.json();
  const series = json.seriess;

  if (!series || series.length === 0) return null;

  const top = series[0];
  return {
    id:    top.id,
    title: top.title,
    unit:  top.units_short || top.units || 'Value',
  };
}

module.exports = { searchFREDSeries };
