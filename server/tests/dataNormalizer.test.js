const { normalizeBLS, normalizeFRED } = require('../src/services/dataNormalizer');

describe('normalizeBLS', () => {
  const raw = { labels: ['2020', '2021', '2022'], values: [8.1, 5.4, 3.7] };

  test('sets the correct title with year range', () => {
    const result = normalizeBLS(raw, 2020, 2022);
    expect(result.title).toBe('US Unemployment Rate (2020–2022)');
  });

  test('sets correct axis labels', () => {
    const result = normalizeBLS(raw, 2020, 2022);
    expect(result.xLabel).toBe('Year');
    expect(result.yLabel).toBe('Unemployment Rate (%)');
  });

  test('passes through labels and values unchanged', () => {
    const result = normalizeBLS(raw, 2020, 2022);
    expect(result.labels).toEqual(['2020', '2021', '2022']);
    expect(result.values).toEqual([8.1, 5.4, 3.7]);
  });

  test('sets BLS source info', () => {
    const result = normalizeBLS(raw, 2020, 2022);
    expect(result.source).toBe('Bureau of Labor Statistics');
    expect(result.sourceUrl).toBe('https://www.bls.gov');
  });
});

describe('normalizeFRED', () => {
  const raw = { labels: ['2020', '2021', '2022'], values: [1.2, 4.7, 8.0] };

  test('sets the correct title with year range', () => {
    const result = normalizeFRED(raw, 2020, 2022);
    expect(result.title).toBe('US Inflation Rate — CPI (2020–2022)');
  });

  test('sets correct axis labels', () => {
    const result = normalizeFRED(raw, 2020, 2022);
    expect(result.xLabel).toBe('Year');
    expect(result.yLabel).toBe('Inflation Rate (% year over year)');
  });

  test('passes through labels and values unchanged', () => {
    const result = normalizeFRED(raw, 2020, 2022);
    expect(result.labels).toEqual(['2020', '2021', '2022']);
    expect(result.values).toEqual([1.2, 4.7, 8.0]);
  });

  test('sets FRED source info', () => {
    const result = normalizeFRED(raw, 2020, 2022);
    expect(result.source).toBe('Federal Reserve Economic Data (FRED)');
    expect(result.sourceUrl).toBe('https://fred.stlouisfed.org');
  });
});
