const fetch = require('node-fetch');

const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Fetches annual observations for any FRED series ID
// Returns { labels: string[], values: number[] }
async function fetchFREDData(seriesId, startYear, endYear) {
  if (!process.env.FRED_API_KEY) {
    throw new Error('FRED_API_KEY is missing. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html');
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: process.env.FRED_API_KEY,
    file_type: 'json',
    observation_start: `${startYear}-01-01`,
    observation_end: `${endYear}-12-31`,
    frequency: 'a',
    units: 'lin',
  });

  const response = await fetch(`${FRED_API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`FRED API returned HTTP ${response.status}. Check your API key.`);
  }

  const json = await response.json();

  if (json.error_code) {
    throw new Error(`FRED API error: ${json.error_message}`);
  }

  if (!json.observations || json.observations.length === 0) {
    throw new Error('FRED returned no data for this date range.');
  }

  const valid = json.observations.filter((obs) => obs.value !== '.');

  if (valid.length === 0) {
    throw new Error('FRED returned data but all values were missing for this date range.');
  }

  const labels = valid.map((obs) => obs.date.substring(0, 4));
  const values = valid.map((obs) => Math.round(parseFloat(obs.value) * 10) / 10);

  return { labels, values };
}

module.exports = { fetchFREDData };
