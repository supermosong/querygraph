const { normalizeData } = require('../src/services/dataNormalizer');

describe('normalizeData', () => {
  const raw = { labels: ['2020', '2021', '2022'], values: [8.1, 5.4, 3.7] };

  test('builds chart object with provided title and yLabel', () => {
    const result = normalizeData(raw, 'US Unemployment Rate (2020–2022)', 'Unemployment Rate (%)');
    expect(result.title).toBe('US Unemployment Rate (2020–2022)');
    expect(result.yLabel).toBe('Unemployment Rate (%)');
  });

  test('sets xLabel to "Year"', () => {
    const result = normalizeData(raw, 'Any Title', 'Any Label');
    expect(result.xLabel).toBe('Year');
  });

  test('passes through labels and values unchanged', () => {
    const result = normalizeData(raw, 'T', 'L');
    expect(result.labels).toEqual(['2020', '2021', '2022']);
    expect(result.values).toEqual([8.1, 5.4, 3.7]);
  });

  test('sets FRED source and URL', () => {
    const result = normalizeData(raw, 'T', 'L');
    expect(result.source).toBe('Federal Reserve Economic Data (FRED)');
    expect(result.sourceUrl).toBe('https://fred.stlouisfed.org');
  });
});
