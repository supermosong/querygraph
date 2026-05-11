const fetch = require('node-fetch');

const BLS_API_URL = 'https://api.bls.gov/publicAPI/v2/timeseries/data/';

// Fetches annual average data for any BLS series ID
// Returns { labels: string[], values: number[] }
async function fetchBLSData(seriesId, startYear, endYear) {
  const body = {
    seriesid: [seriesId],
    startyear: String(startYear),
    endyear: String(endYear),
  };

  if (process.env.BLS_API_KEY) {
    body.registrationKey = process.env.BLS_API_KEY;
  }

  const response = await fetch(BLS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`BLS API returned HTTP ${response.status}. Try again later.`);
  }

  const json = await response.json();

  if (json.status !== 'REQUEST_SUCCEEDED') {
    const msg = Array.isArray(json.message) ? json.message.join(', ') : 'Unknown BLS error';
    throw new Error(`BLS API error: ${msg}`);
  }

  const series = json.Results?.series?.[0];
  if (!series?.data?.length) {
    throw new Error('BLS returned no data for this date range.');
  }

  // BLS returns newest-first monthly data — group by year and average
  const yearMap = {};
  for (const item of series.data) {
    if (!yearMap[item.year]) yearMap[item.year] = [];
    yearMap[item.year].push(parseFloat(item.value));
  }

  const years = Object.keys(yearMap).sort();
  return {
    labels: years,
    values: years.map((year) => {
      const monthly = yearMap[year];
      const avg = monthly.reduce((a, b) => a + b, 0) / monthly.length;
      return Math.round(avg * 10) / 10;
    }),
  };
}

module.exports = { fetchBLSData };
