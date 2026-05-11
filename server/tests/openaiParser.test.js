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
      series_id: 'UNRATE',
      title: 'US Unemployment Rate (2020–2024)',
      yLabel: 'Unemployment Rate (%)',
      startYear: 2020,
      endYear: 2024,
    });

    const result = await parseQueryWithOpenAI('unemployment rate 2020 2024');
    expect(result.series_id).toBe('UNRATE');
    expect(result.startYear).toBe(2020);
    expect(result.endYear).toBe(2024);
    expect(result.title).toContain('Unemployment');
    expect(result.yLabel).toBeTruthy();
  });

  test('returns structured result for vague query "US job market"', async () => {
    mockOpenAIResponse({
      series_id: 'UNRATE',
      title: 'US Unemployment Rate (2020–2025)',
      yLabel: 'Unemployment Rate (%)',
      startYear: 2020,
      endYear: 2025,
    });

    const result = await parseQueryWithOpenAI('US job market');
    expect(result.series_id).toBe('UNRATE');
    expect(result.error).toBeUndefined();
  });

  test('returns error for completely unrecognizable query', async () => {
    mockOpenAIResponse({
      error: 'Query not recognized. Try topics like unemployment, inflation, GDP, or interest rates.',
    });

    const result = await parseQueryWithOpenAI('purple elephant dancing');
    expect(result.error).toBeTruthy();
    expect(result.series_id).toBeUndefined();
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
