// src/components/ChartTypeSelector.jsx
import React from 'react';
import { QG_PAL } from '../theme';

const TYPES = ['Line', 'Bar', 'Pie'];

export default function ChartTypeSelector({ chartType, onChange, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <div className={`inline-flex p-1 rounded-lg border ${p.border}
                     ${light ? 'bg-gray-100' : 'bg-gray-900'}`}>
      {TYPES.map((t) => {
        const v      = t.toLowerCase();
        const active = chartType === v;
        return (
          <button key={t} onClick={() => onChange(v)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors
                              ${active
                                ? 'bg-indigo-600 text-white shadow-[0_2px_8px_-2px_rgba(99,102,241,0.6)]'
                                : light ? 'text-gray-500 hover:text-gray-900' : 'text-gray-400 hover:text-white'}`}>
            {t}
          </button>
        );
      })}
    </div>
  );
}
