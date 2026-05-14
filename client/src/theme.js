// src/theme.js
export const QG_PAL = {
  dark: {
    bg: 'bg-gray-950', surface: 'bg-gray-900', surfaceAlt: 'bg-gray-900/60',
    border: 'border-gray-800', borderStrong: 'border-gray-700',
    text: 'text-white', dim: 'text-gray-400', muted: 'text-gray-500',
    chip: 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800 hover:border-gray-700 hover:text-white',
    inputBg: 'bg-gray-900', navBg: 'bg-gray-950/70',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    neutralBtn: 'bg-gray-800 hover:bg-gray-700 text-white',
  },
  light: {
    bg: 'bg-gray-50', surface: 'bg-white', surfaceAlt: 'bg-white/80',
    border: 'border-gray-200', borderStrong: 'border-gray-300',
    text: 'text-gray-900', dim: 'text-gray-500', muted: 'text-gray-400',
    chip: 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900',
    inputBg: 'bg-white', navBg: 'bg-white/70',
    accentBtn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    neutralBtn: 'bg-gray-100 hover:bg-gray-200 text-gray-900',
  },
};

export const QG_THEME = {
  dark: {
    grid: '#1f2937', axis: '#374151', tick: '#6b7280', label: '#9ca3af',
    line: '#818cf8', lineFill: 'rgba(129,140,248,0.18)',
    bar: '#6366f1', barTop: '#818cf8', dot: '#a5b4fc',
    tooltipBg: '#1f2937', tooltipBorder: '#374151', tooltipText: '#ffffff',
    crosshair: 'rgba(129,140,248,0.5)',
  },
  light: {
    grid: '#e5e7eb', axis: '#d1d5db', tick: '#6b7280', label: '#4b5563',
    line: '#4f46e5', lineFill: 'rgba(79,70,229,0.12)',
    bar: '#6366f1', barTop: '#4f46e5', dot: '#4f46e5',
    tooltipBg: '#ffffff', tooltipBorder: '#e5e7eb', tooltipText: '#0f172a',
    crosshair: 'rgba(79,70,229,0.45)',
  },
};
