// src/__tests__/chartUtils.test.js
import { describe, it, expect } from 'vitest';
import { qgScales, qgFormatValue, qgFormatTick, qgSmoothPath, QG_WIDTH } from '../components/charts/chartUtils';

const PAD = { t: 18, r: 24, b: 36, l: 56 };

describe('qgScales', () => {
  it('maps index 0 to left padding', () => {
    const s = qgScales([0, 10, 20], PAD);
    expect(s.x(0, 3)).toBe(56);
  });

  it('maps last index to right edge', () => {
    const s = qgScales([0, 10, 20], PAD);
    expect(s.x(2, 3)).toBe(QG_WIDTH - PAD.r);
  });

  it('y value is finite for flat series', () => {
    const s = qgScales([5, 5, 5], PAD);
    expect(isFinite(s.y(5))).toBe(true);
  });

  it('exposes yMin and yMax', () => {
    const s = qgScales([0, 100], PAD);
    expect(s.yMin).toBeLessThan(0);
    expect(s.yMax).toBeGreaterThan(100);
  });
});

describe('qgFormatValue', () => {
  it('formats percent to 1dp', () => {
    expect(qgFormatValue(3.567, 'percent', '%')).toBe('3.6%');
  });
  it('formats currency thousands', () => {
    expect(qgFormatValue(331800, 'currency', 'USD')).toBe('$331.8K');
  });
  it('formats currency millions', () => {
    expect(qgFormatValue(1500000, 'currency', 'USD')).toBe('$1.50M');
  });
  it('returns dash for null', () => {
    expect(qgFormatValue(null, 'percent', '%')).toBe('—');
  });
  it('returns dash for NaN', () => {
    expect(qgFormatValue(NaN, 'percent', '%')).toBe('—');
  });
});

describe('qgFormatTick', () => {
  it('formats percent tick as integer', () => {
    expect(qgFormatTick(3.7, 'percent')).toBe('4%');
  });
  it('formats currency tick in thousands', () => {
    expect(qgFormatTick(280000, 'currency')).toBe('$280K');
  });
  it('returns empty for null', () => {
    expect(qgFormatTick(null, 'percent')).toBe('');
  });
});

describe('qgSmoothPath', () => {
  it('returns empty string for empty array', () => {
    expect(qgSmoothPath([])).toBe('');
  });
  it('returns M point for single point', () => {
    expect(qgSmoothPath([[10, 20]])).toBe('M 10 20');
  });
  it('starts with M for multiple points', () => {
    const path = qgSmoothPath([[0, 0], [100, 50], [200, 25]]);
    expect(path).toMatch(/^M /);
  });
});
