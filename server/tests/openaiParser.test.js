jest.mock('openai', () => {
  return {
    default: jest.fn(),
  };
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('parseQueryWithOpenAI', () => {
  test('returns structured result for "unemployment rate 2020 2024"', async () => {
    mockOpenAIResponse({
      api: 'BLS',
      seriesId: 'LNS14000000',
      startYear: 2020,
      endYear: 2024,
      title: 'US Unemployment Rate',
      unit: 'Unemployment Rate (%)',
    });

    const result = await parseQueryWithOpenAI('unemployment rate 2020 2024');
    expect(result.api).toBe('BLS');
    expect(result.seriesId).toBeTruthy();
    expect(result.startYear).toBe(2020);
    expect(result.endYear).toBe(2024);
    expect(result.title).toBeTruthy();
    expect(result.unit).toBeTruthy();
  });

  test('returns null dates when no date range is mentioned', async () => {
    mockOpenAIResponse({
      api: 'FRED',
      seriesId: 'CPIAUCSL',
      startYear: null,
      endYear: null,
      title: 'US CPI Inflation',
      unit: 'Index 1982-84=100',
    });

    const result = await parseQueryWithOpenAI('inflation');
    expect(result.startYear).toBeNull();
    expect(result.endYear).toBeNull();
  });

  test('returns error for completely unrecognizable query', async () => {
    mockOpenAIResponse({ error: 'unrecognized query' });

    const result = await parseQueryWithOpenAI('purple elephant dancing');
    expect(result.error).toBeTruthy();
    expect(result.seriesId).toBeUndefined();
  });

  test('throws if OpenAI returns malformed JSON', async () => {
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{ message: { content: 'not json at all' } }],
          }),
        },
      },
    }));

    await expect(parseQueryWithOpenAI('unemployment')).rejects.toThrow();
  });
});
