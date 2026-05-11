import React from 'react';

const SUGGESTIONS = [
  {
    label: 'Jobs & Employment',
    queries: ['unemployment rate', 'job openings last 5 years', 'average wages 2018 2023', 'labor force participation'],
  },
  {
    label: 'Economy',
    queries: ['US GDP growth', 'inflation last 5 years', 'federal funds rate', 'US national debt'],
  },
  {
    label: 'Global Data',
    queries: ['China GDP 2010 2023', 'world population', 'India GDP per capita', 'CO2 emissions 2000 2020'],
  },
  {
    label: 'Stocks',
    queries: ['Apple stock price 2018 2023', 'Tesla 2020 2024', 'Microsoft last 5 years', 'NVDA 2019 2024'],
  },
];

// Shown when the user's query is not recognized
// Props:
//   onSelect(query: string) — called when user clicks a suggestion
function HelpPanel({ onSelect }) {
  return (
    <div className="w-full max-w-2xl bg-white border border-amber-200 rounded-xl shadow-sm p-6">
      <div className="flex items-start gap-3 mb-5">
        <span className="text-2xl">🤔</span>
        <div>
          <p className="font-semibold text-gray-800">Not sure what you're looking for?</p>
          <p className="text-sm text-gray-500 mt-0.5">Pick a topic below to get started.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {SUGGESTIONS.map(({ label, queries }) => (
          <div key={label}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex flex-wrap gap-2">
              {queries.map((q) => (
                <button
                  key={q}
                  onClick={() => onSelect(q)}
                  className="px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 text-gray-700
                             rounded-full hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50
                             transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HelpPanel;
