jest.mock('node-fetch');
const fetch = require('node-fetch');
const { fetchAlphaVantageData } = require('../src/services/apis/alphavantage');

function mockAVResponse(monthlyTimeSeries) {
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ 'Monthly Time Series': monthlyTimeSeries }),
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  process.env.ALPHAVANTAGE_API_KEY = 'test-key';
});

describe('fetchAlphaVantageData', () => {
  test('picks the most recent monthly close per year', async () => {
    mockAVResponse({
      '2023-12-29': { '4. close': '192.53' },
      '2023-11-30': { '4. close': '189.97' },
      '2022-12-30': { '4. close': '129.93' },
      '2022-11-30': { '4. close': '148.11' },
    });

    const result = await fetchAlphaVantageData('AAPL', 2022, 2023);
    expect(result.labels).toEqual(['2022', '2023']);
    expect(result.values[0]).toBe(129.93);
    expect(result.values[1]).toBe(192.53);
  });

  test('filters to requested year range', async () => {
    mockAVResponse({
      '2024-12-31': { '4. close': '250.00' },
      '2023-12-29': { '4. close': '192.53' },
      '2020-12-31': { '4. close': '132.69' },
    });

    const result = await fetchAlphaVantageData('AAPL', 2023, 2023);
    expect(result.labels).toEqual(['2023']);
  });

  test('returns labels sorted chronologically', async () => {
    mockAVResponse({
      '2022-12-30': { '4. close': '129.93' },
      '2020-12-31': { '4. close': '132.69' },
      '2021-12-31': { '4. close': '177.57' },
    });

    const result = await fetchAlphaVantageData('AAPL', 2020, 2022);
    expect(result.labels).toEqual(['2020', '2021', '2022']);
  });

  test('throws on HTTP error', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchAlphaVantageData('AAPL', 2020, 2023)).rejects.toThrow('HTTP 503');
  });

  test('throws on invalid ticker', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ 'Error Message': 'Invalid API call' }),
    });
    await expect(fetchAlphaVantageData('FAKE', 2020, 2023)).rejects.toThrow('not found');
  });

  test('throws when no data in year range', async () => {
    mockAVResponse({ '2010-12-31': { '4. close': '50.00' } });
    await expect(fetchAlphaVantageData('AAPL', 2020, 2023)).rejects.toThrow('No data');
  });
});
