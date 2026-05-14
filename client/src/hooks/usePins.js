// src/hooks/usePins.js
import { useState } from 'react';

const PINS_KEY    = 'qg_pins';
const HISTORY_KEY = 'qg_history';

function readStored(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
}

export function usePins() {
  const [pins, setPins] = useState(() => readStored(PINS_KEY));

  function addPin(query, tag, data) {
    setPins((prev) => {
      const filtered = prev.filter((p) => p.query !== query);
      const next = [{ query, tag, data }, ...filtered];
      localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  }

  function removePin(query) {
    setPins((prev) => {
      const next = prev.filter((p) => p.query !== query);
      localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  }

  return { pins, addPin, removePin };
}

export function addToHistory(query) {
  const history = readStored(HISTORY_KEY);
  const filtered = history.filter((h) => h.q !== query);
  const next = [{ q: query, when: Date.now() }, ...filtered].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

export function readHistory() {
  return readStored(HISTORY_KEY);
}
