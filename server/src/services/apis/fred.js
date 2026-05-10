// fred.js — fetches CPI inflation data from the Federal Reserve Economic Data API
// Docs: https://fred.stlouisfed.org/docs/api/fred/

const fetch = require('node-fetch');

// CPI series ID — "Consumer Price Index for All Urban Consumers: All Items"
const CPI_SERIES = 'CPIAUCSL';
const FRED_API_URL = 'https://api.stlouisfed.org/fred/series/observations';

// Fetches annual CPI inflation rate (% change year over year) for the given year range
// Returns { labels: string[], values: number[] }
async function fetchFREDData(startYear, endYear) {
  if (!process.env.FRED_API_KEY) {
    throw new Error('FRED_API_KEY is missing from environment variables. Get a free key at https://fred.stlouisfed.org/docs/api/api_key.html');
  }

  const params = new URLSearchParams({
    series_id: CPI_SERIES,
    api_key: process.env.FRED_API_KEY,
    file_type: 'json',
    observation_start: `${startYear}-01-01`,
    observation_end: `${endYear}-12-31`,
    frequency: 'a',   // Annual frequency
    units: 'pc1',     // Percent change from a year ago (= inflation rate)
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

  // Filter out missing values (FRED uses "." for missing data points)
  const valid = json.observations.filter((obs) => obs.value !== '.');

  if (valid.length === 0) {
    throw new Error('FRED returned data but all values were missing for this date range.');
  }

  // Extract 4-digit year from "YYYY-01-01" date strings
  const labels = valid.map((obs) => obs.date.substring(0, 4));
  const values = valid.map((obs) => Math.round(parseFloat(obs.value) * 10) / 10);

  return { labels, values };
}

module.exports = { fetchFREDData };
