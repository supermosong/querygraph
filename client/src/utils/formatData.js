// formatData.js — utility functions for formatting chart values

// Formats a raw number into a readable string based on its magnitude and unit
export function formatValue(value, unit = '') {
  if (unit.includes('%')) return `${value}%`;
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9)  return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3)  return `${(value / 1e3).toFixed(1)}K`;
  return String(value);
}

// Formats a Y-axis tick value compactly (no unit suffix)
export function formatTick(value) {
  const abs = Math.abs(value);
  if (abs >= 1e12) return `${(value / 1e12).toFixed(1)}T`;
  if (abs >= 1e9)  return `${(value / 1e9).toFixed(1)}B`;
  if (abs >= 1e6)  return `${(value / 1e6).toFixed(1)}M`;
  if (abs >= 1e3)  return `${(value / 1e3).toFixed(1)}K`;
  return String(value);
}
