jest.mock('openai', () => {
  return { default: jest.fn() };
});

const OpenAI = require('openai').default;
const { parseQueryWithOpenAI } = require('../src/services/openaiParser');

function mockOpenAIResponse(jsonPayload) {
  OpenAI.mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(jsonPayload) } }],
        }),
      },
    },
  }));
}

beforeEach(() => jest.clearAllMocks());

describe('parseQueryWithOpenAI', () => {
  test('routes FRED query with searchTerm and years', async () => {
    mockOpenAIResponse({ api: 'FRED', searchTerm: 'mortgage rates', ticker: null, countryCode: null, startYear: 2018, endYear: 2023 });
    const result = await parseQueryWithOpenAI('mortgage rates 2018 2023');
    expect(result.api).toBe('FRED');
    expect(result.searchTerm).toBe('mortgage rates');
    expect(result.startYear).toBe(2018);
    expect(result.endYear).toBe(2023);
  });

  test('routes WORLDBANK query with countryCode', async () => {
    mockOpenAIResponse({ api: 'WORLDBANK', searchTerm: 'GDP', ticker: null, countryCode: 'CN', startYear: 2010, endYear: 2023 });
    const result = await parseQueryWithOpenAI('China GDP 2010 2023');
    expect(result.api).toBe('WORLDBANK');
    expect(result.countryCode).toBe('CN');
  });

  test('routes ALPHAVANTAGE with ticker', async () => {
    mockOpenAIResponse({ api: 'ALPHAVANTAGE', searchTerm: 'AAPL', ticker: 'AAPL', countryCode: null, startYear: 2020, endYear: 2024 });
    const result = await parseQueryWithOpenAI('Apple stock 2020 2024');
    expect(result.api).toBe('ALPHAVANTAGE');
    expect(result.ticker).toBe('AAPL');
  });

  test('returns NONE for unrecognizable query', async () => {
    mockOpenAIResponse({ api: 'NONE', searchTerm: null, ticker: null, countryCode: null, startYear: null, endYear: null });
    const result = await parseQueryWithOpenAI('purple elephant dancing');
    expect(result.api).toBe('NONE');
  });

  test('throws if OpenAI returns malformed JSON', async () => {
    OpenAI.mockImplementation(() => ({
      chat: { completions: { create: jest.fn().mockResolvedValue({ choices: [{ message: { content: 'not json' } }] }) } },
    }));
    await expect(parseQueryWithOpenAI('test')).rejects.toThrow();
  });
});
