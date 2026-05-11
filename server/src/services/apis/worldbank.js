const fetch = require('node-fetch');

const WB_BASE = 'https://api.worldbank.org/v2/country';

// seriesId format: "{countryCode}/{indicatorCode}" e.g. "US/NY.GDP.MKTP.CD"
// Returns { labels: string[], values: number[] }
async function fetchWorldBankData(seriesId, startYear, endYear) {
  const [countryCode, indicatorCode] = seriesId.split('/');

  if (!countryCode || !indicatorCode) {
    throw new Error(`Invalid World Bank seriesId "${seriesId}". Expected format: "US/NY.GDP.MKTP.CD"`);
  }

  const params = new URLSearchParams({
    format: 'json',
    date: `${startYear}:${endYear}`,
    per_page: '100',
  });

  const url = `${WB_BASE}/${countryCode}/indicator/${indicatorCode}?${params}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`World Bank API returned HTTP ${response.status}.`);
  }

  const json = await response.json();

  // Response is [metadata, data[]] — index 0 is metadata, index 1 is the data array
  const data = json[1];

  if (!data || data.length === 0) {
    throw new Error(`World Bank returned no data for "${indicatorCode}" in ${countryCode}.`);
  }

  const cleaned = data
    .filter((item) => item.value !== null)
    .sort((a, b) => parseInt(a.date) - parseInt(b.date));

  if (cleaned.length === 0) {
    throw new Error(`World Bank returned data but all values were null for this range.`);
  }

  return {
    labels: cleaned.map((item) => item.date),
    values: cleaned.map((item) => Math.round(parseFloat(item.value) * 100) / 100),
  };
}

module.exports = { fetchWorldBankData };
