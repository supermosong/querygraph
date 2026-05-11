function normalizeData(fredData, title, yLabel) {
  return {
    title,
    xLabel: 'Year',
    yLabel,
    labels: fredData.labels,
    values: fredData.values,
    source: 'Federal Reserve Economic Data (FRED)',
    sourceUrl: 'https://fred.stlouisfed.org',
  };
}

module.exports = { normalizeData };
