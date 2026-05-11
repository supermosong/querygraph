const fetch = require('node-fetch');

const AV_API_URL = 'https://www.alphavantage.co/query';

// Fetches monthly prices and picks the last close of each year for the chart
// Returns { labels: string[], values: number[] }
async function fetchAlphaVantageData(ticker, startYear, endYear) {
  if (!process.env.ALPHAVANTAGE_API_KEY) {
    throw new Error('ALPHAVANTAGE_API_KEY is missing. Get a free key at https://www.alphavantage.co/support/#api-key');
  }

  const params = new URLSearchParams({
    function: 'TIME_SERIES_MONTHLY',
    symbol: ticker,
    apikey: process.env.ALPHAVANTAGE_API_KEY,
  });

  const response = await fetch(`${AV_API_URL}?${params}`);

  if (!response.ok) {
    throw new Error(`Alpha Vantage API returned HTTP ${response.status}.`);
  }

  const json = await response.json();

  if (json['Error Message']) {
    throw new Error(`Alpha Vantage error: ticker "${ticker}" not found.`);
  }

  if (json['Note'] || json['Information']) {
    throw new Error('Alpha Vantage rate limit reached. Please wait and try again.');
  }

  const timeSeries = json['Monthly Time Series'];
  if (!timeSeries) {
    throw new Error(`No data returned for ticker "${ticker}".`);
  }

  // Group all monthly closes by year, keep last entry per year (highest date = latest month)
  const yearMap = {};
  for (const [date, values] of Object.entries(timeSeries)) {
    const year = date.substring(0, 4);
    const yr = parseInt(year);
    if (yr < startYear || yr > endYear) continue;
    // Keep whichever entry we see last (entries are newest-first, so first seen = latest month)
    if (!yearMap[year]) {
      yearMap[year] = Math.round(parseFloat(values['4. close']) * 100) / 100;
    }
  }

  const years = Object.keys(yearMap).sort();

  if (years.length === 0) {
    throw new Error(`No data for "${ticker}" in the range ${startYear}–${endYear}.`);
  }

  return {
    labels: years,
    values: years.map((y) => yearMap[y]),
  };
}

module.exports = { fetchAlphaVantageData };
