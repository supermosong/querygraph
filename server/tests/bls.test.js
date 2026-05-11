jest.mock('node-fetch');
const fetch = require('node-fetch');
const { fetchBLSData } = require('../src/services/apis/bls');

function mockBLSResponse(data) {
  fetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({
      status: 'REQUEST_SUCCEEDED',
      Results: {
        series: [{ seriesID: 'UNRATE', data }],
      },
    }),
  });
}

beforeEach(() => jest.clearAllMocks());

describe('fetchBLSData', () => {
  test('averages monthly values into annual data points', async () => {
    mockBLSResponse([
      { year: '2022', period: 'M12', periodName: 'December', value: '3.5' },
      { year: '2022', period: 'M11', periodName: 'November', value: '3.7' },
      { year: '2021', period: 'M12', periodName: 'December', value: '4.2' },
    ]);

    const result = await fetchBLSData('UNRATE', 2021, 2022);
    expect(result.labels).toEqual(['2021', '2022']);
    expect(result.values[0]).toBe(4.2);
    expect(result.values[1]).toBe(3.6);
  });

  test('returns labels sorted chronologically', async () => {
    mockBLSResponse([
      { year: '2023', period: 'M01', periodName: 'January', value: '3.4' },
      { year: '2021', period: 'M01', periodName: 'January', value: '6.4' },
      { year: '2022', period: 'M01', periodName: 'January', value: '4.0' },
    ]);

    const result = await fetchBLSData('UNRATE', 2021, 2023);
    expect(result.labels).toEqual(['2021', '2022', '2023']);
  });

  test('throws on non-OK HTTP response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 503 });
    await expect(fetchBLSData('UNRATE', 2020, 2022)).rejects.toThrow('BLS API returned HTTP 503');
  });

  test('throws when status is not REQUEST_SUCCEEDED', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ status: 'REQUEST_FAILED', message: ['Invalid series'] }),
    });
    await expect(fetchBLSData('INVALID', 2020, 2022)).rejects.toThrow('BLS API error');
  });

  test('throws when no data is returned', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        status: 'REQUEST_SUCCEEDED',
        Results: { series: [{ seriesID: 'UNRATE', data: [] }] },
      }),
    });
    await expect(fetchBLSData('UNRATE', 2020, 2022)).rejects.toThrow('no data');
  });
});
