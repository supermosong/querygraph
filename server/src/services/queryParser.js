// Layer 1: instant keyword match — no AI cost, covers the most common queries

const CURRENT_YEAR = new Date().getFullYear();

const KEYWORD_MAP = [
  { keywords: ['unemployment', 'jobless'],              api: 'FRED', seriesId: 'UNRATE',              title: 'US Unemployment Rate',          unit: '%' },
  { keywords: ['inflation', 'cpi'],                    api: 'FRED', seriesId: 'CPIAUCSL',             title: 'US CPI Inflation',              unit: 'Index' },
  { keywords: ['gdp growth', 'economic growth'],       api: 'FRED', seriesId: 'A191RL1A225NBEA',      title: 'US Real GDP Growth Rate',       unit: '%' },
  { keywords: ['gdp', 'economy', 'economic output'],   api: 'FRED', seriesId: 'GDP',                  title: 'US GDP',                        unit: 'Billion USD' },
  { keywords: ['interest rate', 'federal funds', 'fed rate'], api: 'FRED', seriesId: 'FEDFUNDS',      title: 'Federal Funds Rate',            unit: '%' },
  { keywords: ['mortgage'],                            api: 'FRED', seriesId: 'MORTGAGE30US',          title: '30-Year Fixed Mortgage Rate',   unit: '%' },
  { keywords: ['national debt', 'us debt', 'federal debt'], api: 'FRED', seriesId: 'GFDEBTN',        title: 'US National Debt',              unit: 'Million USD' },
  { keywords: ['money supply', 'm2'],                  api: 'FRED', seriesId: 'M2SL',                 title: 'M2 Money Supply',               unit: 'Billion USD' },
  { keywords: ['pce', 'core inflation'],               api: 'FRED', seriesId: 'PCEPILFE',             title: 'Core PCE Inflation',            unit: '%' },
  { keywords: ['nonfarm', 'payroll', 'total jobs'],    api: 'BLS',  seriesId: 'CES0000000001',        title: 'Total Nonfarm Payroll',         unit: 'Thousands' },
  { keywords: ['job openings', 'jolts'],               api: 'BLS',  seriesId: 'JTS000000000000000JOL', title: 'Job Openings',                unit: 'Thousands' },
  { keywords: ['wages', 'hourly earnings', 'salary'],  api: 'BLS',  seriesId: 'CES0500000003',        title: 'Average Hourly Earnings',       unit: 'USD/Hour' },
  { keywords: ['labor force', 'participation rate'],   api: 'BLS',  seriesId: 'LNS11300000',          title: 'Labor Force Participation',     unit: '%' },
  { keywords: ['world population', 'global population'], api: 'WORLDBANK', seriesId: 'WLD/SP.POP.TOTL', title: 'World Population',           unit: 'People' },
];

function extractYears(query) {
  const rangeMatch = query.match(/(\d{4})\s*[-–]\s*(\d{4})/);
  if (rangeMatch) return { startYear: +rangeMatch[1], endYear: +rangeMatch[2] };

  const lastNMatch = query.match(/last\s+(\d+)\s+years?/);
  if (lastNMatch) {
    const n = +lastNMatch[1];
    return { startYear: CURRENT_YEAR - n, endYear: CURRENT_YEAR };
  }

  const spaceMatch = query.match(/(\d{4})\s+(\d{4})/);
  if (spaceMatch) return { startYear: +spaceMatch[1], endYear: +spaceMatch[2] };

  return { startYear: null, endYear: null };
}

function keywordMatch(query) {
  const lower = query.toLowerCase();
  const entry = KEYWORD_MAP.find((e) => e.keywords.some((kw) => lower.includes(kw)));
  if (!entry) return null;

  const { startYear, endYear } = extractYears(lower);
  return {
    api: entry.api,
    seriesId: entry.seriesId,
    title: entry.title,
    unit: entry.unit,
    startYear: startYear ?? CURRENT_YEAR - 5,
    endYear: endYear ?? CURRENT_YEAR,
  };
}

module.exports = { keywordMatch };
