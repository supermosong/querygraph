jest.mock('node-fetch');
const fetch = require('node-fetch');
const { fetchWorldBankData } = require('../src/services/apis/worldbank');

function mockWBResponse(dataArray) {
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve([{ page: 1, total: dataArray.length }, dataArray]),
  });
}

beforeEach(() => jest.clearAllMocks());

describe('fetchWorldBankData', () => {
  test('returns sorted labels and values filtering nulls', async () => {
    mockWBResponse([
      { date: '2022', value: '25000000000000', indicator: { id: 'NY.GDP.MKTP.CD' }, country: { value: 'United States' } },
      { date: '2021', value: null,              indicator: { id: 'NY.GDP.MKTP.CD' }, country: { value: 'United States' } },
      { date: '2020', value: '21000000000000', indicator: { id: 'NY.GDP.MKTP.CD' }, country: { value: 'United States' } },
    ]);

    const result = await fetchWorldBankData('US/NY.GDP.MKTP.CD', 2020, 2022);
    expect(result.labels).toEqual(['2020', '2022']);
    expect(result.values).toEqual([21000000000000, 25000000000000]);
  });

  test('returns data sorted chronologically', async () => {
    mockWBResponse([
      { date: '2023', value: '100', indicator: {}, country: {} },
      { date: '2021', value: '80',  indicator: {}, country: {} },
      { date: '2022', value: '90',  indicator: {}, country: {} },
    ]);

    const result = await fetchWorldBankData('US/NY.GDP.MKTP.CD', 2021, 2023);
    expect(result.labels).toEqual(['2021', '2022', '2023']);
    expect(result.values).toEqual([80, 90, 100]);
  });

  test('throws on HTTP error', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchWorldBankData('US/NY.GDP.MKTP.CD', 2020, 2023)).rejects.toThrow('HTTP 503');
  });

  test('throws on missing data array', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ page: 1 }, null]),
    });
    await expect(fetchWorldBankData('US/NY.GDP.MKTP.CD', 2020, 2023)).rejects.toThrow('no data');
  });

  test('throws on invalid seriesId format', async () => {
    fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([{}, []]) });
    await expect(fetchWorldBankData('INVALID', 2020, 2023)).rejects.toThrow('Invalid World Bank seriesId');
  });

  test('throws when all values are null', async () => {
    mockWBResponse([
      { date: '2021', value: null, indicator: {}, country: {} },
      { date: '2022', value: null, indicator: {}, country: {} },
    ]);
    await expect(fetchWorldBankData('US/NY.GDP.MKTP.CD', 2021, 2022)).rejects.toThrow('all values were null');
  });
});
