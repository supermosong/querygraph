// SuggestionChips.jsx — clickable example query buttons
import React from 'react';

const SUGGESTIONS = [
  'US unemployment rate 2020-2024',
  'Inflation last 10 years',
  'China GDP growth',
  'AAPL stock 2023',
  'US home prices 2018-2024',
];

// Renders suggestion chips; clicking one fires onSelect with that query string
function SuggestionChips({ onSelect, disabled }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          disabled={disabled}
          className="px-4 py-1.5 text-sm bg-white border border-gray-300 text-gray-600
                     rounded-full hover:border-blue-400 hover:text-blue-600
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}

export default SuggestionChips;
