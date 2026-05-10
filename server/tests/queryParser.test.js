const { parseQuery } = require('../src/services/queryParser');

describe('parseQuery — topic detection', () => {
  test('detects employment topic from "unemployment"', () => {
    const result = parseQuery('US unemployment rate');
    expect(result.topic).toBe('employment');
    expect(result.api).toBe('BLS');
  });

  test('detects employment topic from "job"', () => {
    const result = parseQuery('job growth 2020-2024');
    expect(result.topic).toBe('employment');
    expect(result.api).toBe('BLS');
  });

  test('detects employment topic from "workforce"', () => {
    const result = parseQuery('workforce trends');
    expect(result.topic).toBe('employment');
    expect(result.api).toBe('BLS');
  });

  test('detects economics topic from "inflation"', () => {
    const result = parseQuery('US inflation rate');
    expect(result.topic).toBe('economics');
    expect(result.api).toBe('FRED');
  });

  test('detects economics topic from "gdp"', () => {
    const result = parseQuery('GDP growth last 5 years');
    expect(result.topic).toBe('economics');
    expect(result.api).toBe('FRED');
  });

  test('detects economics topic from "cpi"', () => {
    const result = parseQuery('cpi data 2019-2023');
    expect(result.topic).toBe('economics');
    expect(result.api).toBe('FRED');
  });

  test('returns null topic for unrecognized query', () => {
    const result = parseQuery('purple elephant dancing');
    expect(result.topic).toBeNull();
    expect(result.api).toBeNull();
  });
});

describe('parseQuery — date range extraction', () => {
  test('extracts explicit year range "2020-2024"', () => {
    const result = parseQuery('unemployment 2020-2024');
    expect(result.startYear).toBe(2020);
    expect(result.endYear).toBe(2024);
  });

  test('extracts explicit year range with space "2020 2024"', () => {
    const result = parseQuery('inflation 2018 2023');
    expect(result.startYear).toBe(2018);
    expect(result.endYear).toBe(2023);
  });

  test('extracts "last N years"', () => {
    const result = parseQuery('inflation last 3 years');
    const currentYear = new Date().getFullYear();
    expect(result.startYear).toBe(currentYear - 3);
    expect(result.endYear).toBe(currentYear);
  });

  test('defaults to last 5 years when no date given', () => {
    const result = parseQuery('unemployment rate');
    const currentYear = new Date().getFullYear();
    expect(result.startYear).toBe(currentYear - 5);
    expect(result.endYear).toBe(currentYear);
  });
});
