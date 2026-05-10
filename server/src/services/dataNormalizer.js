// dataNormalizer.js — converts raw API data into the standard chart format

// Converts BLS raw data into the standard { title, xLabel, yLabel, labels, values, source, sourceUrl } format
function normalizeBLS(blsData, startYear, endYear) {
  return {
    title: `US Unemployment Rate (${startYear}–${endYear})`,
    xLabel: 'Year',
    yLabel: 'Unemployment Rate (%)',
    labels: blsData.labels,
    values: blsData.values,
    source: 'Bureau of Labor Statistics',
    sourceUrl: 'https://www.bls.gov',
  };
}

// Converts FRED raw data into the standard chart format
function normalizeFRED(fredData, startYear, endYear) {
  return {
    title: `US Inflation Rate — CPI (${startYear}–${endYear})`,
    xLabel: 'Year',
    yLabel: 'Inflation Rate (% year over year)',
    labels: fredData.labels,
    values: fredData.values,
    source: 'Federal Reserve Economic Data (FRED)',
    sourceUrl: 'https://fred.stlouisfed.org',
  };
}

module.exports = { normalizeBLS, normalizeFRED };
