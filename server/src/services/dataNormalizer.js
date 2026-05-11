const SOURCE_INFO = {
  FRED:         { source: 'Federal Reserve Economic Data (FRED)', sourceUrl: 'https://fred.stlouisfed.org' },
  BLS:          { source: 'Bureau of Labor Statistics (BLS)',     sourceUrl: 'https://www.bls.gov' },
  ALPHAVANTAGE: { source: 'Alpha Vantage',                        sourceUrl: 'https://www.alphavantage.co' },
  WORLDBANK:    { source: 'World Bank',                           sourceUrl: 'https://data.worldbank.org' },
};

function normalizeData(rawData, title, yLabel, api = 'FRED') {
  const { source, sourceUrl } = SOURCE_INFO[api] ?? SOURCE_INFO.FRED;
  return {
    title,
    xLabel: 'Year',
    yLabel,
    labels: rawData.labels,
    values: rawData.values,
    source,
    sourceUrl,
  };
}

module.exports = { normalizeData };
