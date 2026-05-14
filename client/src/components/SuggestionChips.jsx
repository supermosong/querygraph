// src/components/SuggestionChips.jsx
import React from 'react';
import { QG_PAL } from '../theme';

const SUGGESTIONS = [
  'US unemployment rate 2020-2024',
  'Inflation last 10 years',
  'China GDP growth',
  'AAPL stock 2023',
  'US home prices 2018-2024',
];

export default function SuggestionChips({ onPick, disabled, activeQuery, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {SUGGESTIONS.map((q) => {
        const active = activeQuery === q;
        return (
          <button key={q} onClick={() => onPick(q)} disabled={disabled}
                  className={`text-sm rounded-full px-3 py-1 border transition-colors
                              disabled:opacity-50 disabled:cursor-not-allowed
                              ${active
                                ? (light
                                    ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                    : 'bg-indigo-500/15 border-indigo-500/50 text-indigo-300')
                                : p.chip}`}>
            {q}
          </button>
        );
      })}
    </div>
  );
}
