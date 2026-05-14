// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QG_PAL } from '../theme';
import SearchBar from '../components/SearchBar';
import GraphDisplay from '../components/GraphDisplay';
import SuggestionChips from '../components/SuggestionChips';
import Footer from '../components/Footer';
import useGraphData from '../hooks/useGraphData';
import { usePins } from '../hooks/usePins';

const CATEGORIES = [
  { k: 'Economics',    items: ['GDP', 'CPI inflation', 'Unemployment'] },
  { k: 'Markets',      items: ['Stocks & ETFs', 'Treasury yields', 'FX rates'] },
  { k: 'Demographics', items: ['Population', 'Housing', 'Migration'] },
];

export default function Home({ light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const { data, isLoading, error, fetchGraph } = useGraphData();
  const [chartType, setChartType]  = useState('line');
  const [query, setQuery]          = useState('');
  const [submitted, setSubmitted]  = useState(null);
  const { pins, addPin, removePin } = usePins();
  const location  = useLocation();
  const navigate  = useNavigate();

  // Auto-run query when navigated from Dashboard with state.autoQuery
  useEffect(() => {
    const auto = location.state?.autoQuery;
    if (auto) {
      window.history.replaceState({}, '');
      runSearch(auto);
    }
  }, []);

  function runSearch(q) {
    const trimmed = (q || '').trim();
    if (!trimmed) return;
    setQuery(trimmed);
    setSubmitted(trimmed);
    setChartType('line');
    fetchGraph(trimmed);
  }

  function clearAll() {
    setQuery('');
    setSubmitted(null);
  }

  function handlePin(d) {
    const tag = d.source?.split(' — ')[0]?.trim() || 'Other';
    if (isPinned) removePin(submitted);
    else           addPin(submitted, tag, d);
  }

  const isPinned  = Boolean(submitted && pins.some((p) => p.query === submitted));
  const showGraph = isLoading || error || data;

  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[480px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-24">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className={`inline-flex items-center gap-1.5 text-[11px] uppercase
                            tracking-[0.14em] ${p.dim} px-2.5 py-1 rounded-full
                            border ${p.border} ${p.surfaceAlt}`}>
            Beta · 5 free queries / day
          </div>
          <h1 className={`mt-5 text-4xl sm:text-5xl font-semibold tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}
              style={{ letterSpacing: '-0.025em' }}>
            Search anything.{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">
              See it as a graph.
            </span>
          </h1>
          <p className={`mt-4 text-base sm:text-lg ${p.dim} max-w-xl mx-auto`}>
            Type any question about economics, markets, or global data.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <SearchBar value={query} onChange={setQuery}
                     onSubmit={runSearch} isLoading={isLoading} light={light} />
        </div>

        {/* Suggestion chips */}
        <div className="mt-6 max-w-3xl mx-auto">
          <SuggestionChips onPick={runSearch} disabled={isLoading}
                           activeQuery={submitted} light={light} />
        </div>

        {/* Graph */}
        {showGraph && (
          <div className="mt-10">
            <GraphDisplay data={data} isLoading={isLoading} error={error}
                          chartType={chartType} setChartType={setChartType}
                          light={light} onRetry={clearAll}
                          onPin={handlePin} isPinned={isPinned} />
          </div>
        )}

        {/* Idle category cards */}
        {!showGraph && (
          <div className="mt-12 grid sm:grid-cols-3 gap-3">
            {CATEGORIES.map((cat) => (
              <div key={cat.k} className={`rounded-xl border ${p.border} ${p.surface} p-4`}>
                <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted}`}>{cat.k}</p>
                <ul className="mt-3 space-y-1.5">
                  {cat.items.map((it) => (
                    <li key={it} className={`text-sm ${p.dim} flex items-center gap-2`}>
                      <span className="w-1 h-1 rounded-full bg-indigo-500/70" />
                      {it}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer light={light} />
    </main>
  );
}
