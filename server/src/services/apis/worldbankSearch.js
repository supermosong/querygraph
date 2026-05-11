const fetch = require('node-fetch');

const WB_INDICATOR_URL = 'https://api.worldbank.org/v2/indicator';

// Searches World Bank indicators by keyword, returns the best match
// Returns { id, title } or null
async function searchWorldBankIndicator(searchTerm) {
  const params = new URLSearchParams({
    format: 'json',
    per_page: '5',
    q: searchTerm,
  });

  const response = await fetch(`${WB_INDICATOR_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`World Bank indicator search returned HTTP ${response.status}.`);
  }

  const json = await response.json();
  const indicators = json[1];

  if (!indicators || indicators.length === 0) return null;

  const top = indicators[0];
  return {
    id:    top.id,
    title: top.name,
  };
}

module.exports = { searchWorldBankIndicator };
