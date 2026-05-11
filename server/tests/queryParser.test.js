const { keywordMatch } = require('../src/services/queryParser');

describe('keywordMatch — topic detection', () => {
  test('matches "unemployment" → FRED UNRATE', () => {
    const r = keywordMatch('US unemployment rate');
    expect(r.api).toBe('FRED');
    expect(r.seriesId).toBe('UNRATE');
  });

  test('matches "inflation" → FRED CPIAUCSL', () => {
    const r = keywordMatch('inflation last 5 years');
    expect(r.api).toBe('FRED');
    expect(r.seriesId).toBe('CPIAUCSL');
  });

  test('matches "gdp growth" before generic "gdp"', () => {
    const r = keywordMatch('US gdp growth 2015 2024');
    expect(r.seriesId).toBe('A191RL1A225NBEA');
  });

  test('matches "mortgage" → FRED MORTGAGE30US', () => {
    const r = keywordMatch('mortgage rates last 10 years');
    expect(r.seriesId).toBe('MORTGAGE30US');
  });

  test('matches "wages" → BLS CES0500000003', () => {
    const r = keywordMatch('average wages 2018 2023');
    expect(r.api).toBe('BLS');
    expect(r.seriesId).toBe('CES0500000003');
  });

  test('returns null for unrecognized query', () => {
    expect(keywordMatch('purple elephant')).toBeNull();
  });
});

describe('keywordMatch — year extraction', () => {
  test('extracts explicit range "2020-2024"', () => {
    const r = keywordMatch('unemployment 2020-2024');
    expect(r.startYear).toBe(2020);
    expect(r.endYear).toBe(2024);
  });

  test('extracts "last N years"', () => {
    const r = keywordMatch('inflation last 3 years');
    const currentYear = new Date().getFullYear();
    expect(r.startYear).toBe(currentYear - 3);
    expect(r.endYear).toBe(currentYear);
  });

  test('defaults to last 5 years when no date given', () => {
    const r = keywordMatch('unemployment rate');
    const currentYear = new Date().getFullYear();
    expect(r.startYear).toBe(currentYear - 5);
    expect(r.endYear).toBe(currentYear);
  });
});
