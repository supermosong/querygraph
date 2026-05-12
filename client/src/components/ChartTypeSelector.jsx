// ChartTypeSelector.jsx — Line / Bar / Pie toggle buttons
import React from 'react';

const TYPES = ['Line', 'Bar', 'Pie'];

// Renders three buttons that switch the active chart type
function ChartTypeSelector({ chartType, onChange }) {
  return (
    <div className="flex gap-2">
      {TYPES.map((type) => (
        <button
          key={type}
          onClick={() => onChange(type.toLowerCase())}
          className={`px-4 py-1.5 text-sm rounded-full border font-medium transition-colors
            ${chartType === type.toLowerCase()
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
}

export default ChartTypeSelector;
