// src/__tests__/usePins.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePins, addToHistory, readHistory } from '../hooks/usePins';

const MOCK_DATA = {
  title: 'US Unemployment', labels: ['Jan'], values: [3.6],
  format: 'percent', unit: '%', source: 'FRED — Federal Reserve', sourceUrl: '',
};

beforeEach(() => localStorage.clear());

describe('usePins', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => usePins());
    expect(result.current.pins).toEqual([]);
  });

  it('addPin prepends a pin', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('query a', 'FRED', MOCK_DATA));
    expect(result.current.pins).toHaveLength(1);
    expect(result.current.pins[0].query).toBe('query a');
  });

  it('addPin deduplicates — re-adding moves to front with new tag', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED',  MOCK_DATA));
    act(() => result.current.addPin('q', 'BLS',   MOCK_DATA));
    expect(result.current.pins).toHaveLength(1);
    expect(result.current.pins[0].tag).toBe('BLS');
  });

  it('removePin removes by query', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED', MOCK_DATA));
    act(() => result.current.removePin('q'));
    expect(result.current.pins).toHaveLength(0);
  });

  it('persists pins to localStorage', () => {
    const { result } = renderHook(() => usePins());
    act(() => result.current.addPin('q', 'FRED', MOCK_DATA));
    const stored = JSON.parse(localStorage.getItem('qg_pins'));
    expect(stored).toHaveLength(1);
    expect(stored[0].query).toBe('q');
  });

  it('loads existing pins from localStorage on mount', () => {
    localStorage.setItem('qg_pins', JSON.stringify([{ query: 'q', tag: 'FRED', data: MOCK_DATA }]));
    const { result } = renderHook(() => usePins());
    expect(result.current.pins).toHaveLength(1);
  });
});

describe('addToHistory / readHistory', () => {
  it('adds a query', () => {
    addToHistory('test query');
    expect(readHistory()[0].q).toBe('test query');
  });

  it('keeps only last 5', () => {
    for (let i = 0; i < 7; i++) addToHistory(`q${i}`);
    expect(readHistory()).toHaveLength(5);
  });

  it('deduplicates — same query refreshes timestamp', () => {
    addToHistory('same');
    addToHistory('same');
    expect(readHistory()).toHaveLength(1);
  });
});
