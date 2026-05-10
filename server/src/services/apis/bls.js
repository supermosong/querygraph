// bls.js — fetches unemployment rate data from the Bureau of Labor Statistics API
// Docs: https://www.bls.gov/developers/api_signature_v2.htm

const fetch = require('node-fetch');

// BLS series ID for the national unemployment rate (seasonally adjusted)
const UNEMPLOYMENT_SERIES = 'LNS14000000';
const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Fetches annual unemployment rate data for the given year range
// Returns { labels: string[], values: number[] } — one entry per year
async function fetchBLSData(startYear, endYear) {
  const payload = {
    seriesid: [UNEMPLOYMENT_SERIES],
    startyear: String(startYear),
    endyear: String(endYear),
  };

  // API key increases daily limit from 500 to 2500 requests
  if (process.env.BLS_API_KEY) {
    payload.registrationkey = process.env.BLS_API_KEY;
  }

  const response = await fetch(BLS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`BLS API returned HTTP ${response.status}. Try again later.`);
  }

  const json = await response.json();

  if (json.status !== 'REQUEST_SUCCEEDED') {
    const msg = Array.isArray(json.message) ? json.message.join(', ') : 'Unknown BLS error';
    throw new Error(`BLS API error: ${msg}`);
  }

  const rawData = json.Results.series[0].data;

  if (!rawData || rawData.length === 0) {
    throw new Error('BLS returned no data for this date range.');
  }

  // BLS returns data newest-first — reverse to chronological order
  const chronological = [...rawData].reverse();

  // Group monthly values by year and compute the annual average
  const yearMap = {};
  for (const item of chronological) {
    const year = item.year;
    if (!yearMap[year]) yearMap[year] = [];
    yearMap[year].push(parseFloat(item.value));
  }

  const years = Object.keys(yearMap).sort();
  const labels = years;
  const values = years.map((year) => {
    const monthly = yearMap[year];
    const avg = monthly.reduce((a, b) => a + b, 0) / monthly.length;
    return Math.round(avg * 10) / 10; // One decimal place
  });

  return { labels, values };
}

module.exports = { fetchBLSData };
