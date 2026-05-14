// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QG_PAL } from '../theme';
import { usePins, readHistory } from '../hooks/usePins';
import Sparkline from '../components/charts/Sparkline';
import Footer from '../components/Footer';
import { IconSearch, IconPlus, IconUnpin, IconArrowRight } from '../components/icons/Icons';

/* ── helper: relative time from a Date.now() timestamp ── */
function relTime(ts) {
  const s = (Date.now() - ts) / 1000;
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`;
  return 'yesterday';
}

/* ── Pinned chart card ── */
function PinnedChartCard({ entry, light, onOpen, onUnpin }) {
  const p     = QG_PAL[light ? 'light' : 'dark'];
  const { data } = entry;
  if (!data?.values?.length) return null;
  const first = data.values[0];
  const last  = data.values[data.values.length - 1];
  const delta = last - first;
  const pct   = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up    = delta >= 0;

  return (
    <div className={`group relative rounded-xl border ${p.border} ${p.surface}
                     overflow-hidden shadow-card hover:border-indigo-500/40
                     transition-colors cursor-pointer`}
         onClick={() => onOpen(entry.query)}>
      <div className="px-4 pt-4 pb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className={`text-[10px] uppercase tracking-[0.14em] ${p.muted} mb-1`}>
            {entry.tag}
          </div>
          <h3 className={`text-sm font-medium leading-snug truncate
                          ${light ? 'text-gray-900' : 'text-white'}`}>
            {data.title}
          </h3>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onUnpin(entry.query); }}
                aria-label="Unpin"
                className={`opacity-0 group-hover:opacity-100 transition-opacity
                            ${p.muted} hover:text-white rounded-md p-1
                            hover:bg-gray-800/50`}>
          <IconUnpin size={14} />
        </button>
      </div>

      <div className="px-4 flex items-baseline gap-2">
        <span className={`text-2xl font-semibold tracking-tight tnum
                          ${light ? 'text-gray-900' : 'text-white'}`}>
          {last}{data.unit ? ' ' + data.unit : ''}
        </span>
        <span className={`tnum text-xs font-medium px-1.5 py-0.5 rounded
                          ${up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
          {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
        </span>
      </div>

      <div className="mt-1">
        <Sparkline values={data.values} up={up} height={68} />
      </div>

      <div className={`px-4 py-2.5 border-t ${p.border} flex items-center
                       justify-between text-[11px]`}>
        <span className={p.muted}>
          {data.labels?.[0]} → {data.labels?.[data.labels.length - 1]}
        </span>
        <span className={`${p.muted} truncate ml-2 max-w-[140px]`}>
          {(data.source || '').split('—')[0].trim()}
        </span>
      </div>
    </div>
  );
}

/* ── "+ Pin a new chart" tile ── */
function AddChartTile({ light, onAdd }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  return (
    <button onClick={onAdd}
            className={`rounded-xl border border-dashed ${p.border}
                        ${light ? 'bg-white/40 hover:bg-white' : 'bg-gray-900/40 hover:bg-gray-900'}
                        min-h-[212px] grid place-items-center transition-colors group`}>
      <div className="text-center">
        <div className={`mx-auto w-9 h-9 rounded-lg grid place-items-center
                         ${light ? 'bg-gray-100 group-hover:bg-indigo-50' : 'bg-gray-800 group-hover:bg-indigo-500/15'}
                         ${p.dim} group-hover:text-indigo-400 transition-colors`}>
          <IconPlus size={18} />
        </div>
        <p className={`mt-2 text-sm font-medium ${light ? 'text-gray-700' : 'text-gray-300'}`}>
          Pin a new chart
        </p>
        <p className={`text-xs ${p.muted} mt-0.5`}>Search to add one</p>
      </div>
    </button>
  );
}

/* ── KPI stat card ── */
function KPI({ label, value, sub, tone, light }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  const toneColor =
    tone === 'up'     ? 'text-green-400'  :
    tone === 'down'   ? 'text-red-400'    :
    tone === 'accent' ? 'text-indigo-400' : p.dim;
  return (
    <div className={`rounded-xl border ${p.border} ${p.surface} px-5 py-4`}>
      <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted}`}>{label}</p>
      <p className={`mt-2 text-2xl font-semibold tracking-tight tnum
                     ${light ? 'text-gray-900' : 'text-white'}`}>{value}</p>
      {sub && <p className={`mt-1 text-xs ${toneColor}`}>{sub}</p>}
    </div>
  );
}

/* ── Dashboard page ── */
export default function Dashboard({ light }) {
  const p        = QG_PAL[light ? 'light' : 'dark'];
  const navigate = useNavigate();
  const { pins, removePin } = usePins();
  const history  = readHistory();
  const [collection, setCollection] = useState('All');

  function openQuery(query) {
    navigate('/', { state: { autoQuery: query } });
  }

  const tags = [...new Set(pins.map((p) => p.tag).filter(Boolean))];
  const collections = [
    { name: 'All', count: pins.length },
    ...tags.map((t) => ({ name: t, count: pins.filter((p) => p.tag === t).length })),
  ];
  const filtered = collection === 'All' ? pins : pins.filter((p) => p.tag === collection);

  const queriesToday = history.filter((h) => {
    const d = new Date(h.when);
    const n = new Date();
    return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
  }).length;

  const SUGGESTED = [
    'Germany inflation 2019-2024',
    'S&P 500 last 5 years',
    'Japan population 2000-2024',
    '10-year treasury yield',
  ];

  return (
    <main className={`${p.bg} min-h-screen relative`}>
      <div className="hero-glow absolute inset-x-0 top-0 h-[300px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-24">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <h1 className={`mt-1 text-3xl sm:text-4xl font-semibold tracking-tight
                            ${light ? 'text-gray-900' : 'text-white'}`}
                style={{ letterSpacing: '-0.02em' }}>
              Your dashboard
            </h1>
            <p className={`mt-1.5 text-sm ${p.dim}`}>
              Pinned charts update automatically as new data is released.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate('/')}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                                text-sm border ${p.border} ${p.dim}
                                hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
              <IconSearch size={14} /> Search
            </button>
            <button onClick={() => navigate('/')}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg
                               text-sm font-medium bg-indigo-600 hover:bg-indigo-500
                               text-white transition-colors">
              <IconPlus size={14} /> New chart
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          <KPI label="Queries today" value={`${queriesToday}`}
               sub="tracked in session" tone="accent" light={light} />
          <KPI label="Pinned charts" value={`${pins.length}`}
               sub={`across ${Math.max(1, tags.length)} collection${tags.length !== 1 ? 's' : ''}`}
               light={light} />
          <KPI label="Data freshness" value="Live" sub="via public APIs" light={light} />
          <KPI label="Chart types"    value="3"    sub="Line · Bar · Pie" light={light} />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-8">

          {/* Main column */}
          <div>
            {/* Collection tabs */}
            <div className="flex items-end justify-between gap-3 mb-4">
              <div className="flex items-center gap-1 overflow-x-auto -mx-1 px-1">
                {collections.map((c) => {
                  const active = collection === c.name;
                  return (
                    <button key={c.name} onClick={() => setCollection(c.name)}
                            className={`shrink-0 inline-flex items-center gap-1.5
                                        text-sm px-3 py-1.5 rounded-lg transition-colors
                                        ${active
                                          ? (light
                                              ? 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                                              : 'bg-gray-900 text-white border border-gray-800')
                                          : `${p.dim} hover:${light ? 'text-gray-900' : 'text-white'}`}`}>
                      {c.name}
                      <span className={`tnum text-[11px] px-1.5 py-0.5 rounded
                                        ${active
                                          ? (light ? 'bg-gray-100 text-gray-600' : 'bg-gray-800 text-gray-400')
                                          : (light ? 'bg-gray-100 text-gray-500' : 'bg-gray-900 text-gray-500')}`}>
                        {c.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pinned chart grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((entry) => (
                <PinnedChartCard key={entry.query} entry={entry} light={light}
                                 onOpen={openQuery} onUnpin={removePin} />
              ))}
              <AddChartTile light={light} onAdd={() => navigate('/')} />
            </div>

            {pins.length === 0 && (
              <div className={`mt-4 rounded-xl border border-dashed ${p.border}
                               ${p.surface} px-8 py-14 text-center`}>
                <p className={`text-sm font-medium ${light ? 'text-gray-700' : 'text-gray-300'}`}>
                  No pinned charts yet
                </p>
                <p className={`text-xs ${p.muted} mt-1`}>
                  Search a query then click the pin icon to save it here.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            {/* Recent activity */}
            <div className={`rounded-xl border ${p.border} ${p.surface} p-5`}>
              <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted} mb-3`}>
                Recent searches
              </p>
              {history.length === 0 ? (
                <p className={`text-sm ${p.dim}`}>No searches yet.</p>
              ) : (
                <ul className="space-y-3">
                  {history.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 bg-amber-500" />
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm truncate ${light ? 'text-gray-800' : 'text-gray-200'}`}>
                          {h.q}
                        </p>
                        <p className={`text-[11px] ${p.muted}`}>{relTime(h.when)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Suggested queries */}
            <div className={`rounded-xl border ${p.border} ${p.surface} p-5`}>
              <p className={`text-[11px] uppercase tracking-[0.14em] ${p.muted} mb-3`}>
                Suggested for you
              </p>
              <ul className="space-y-2">
                {SUGGESTED.map((q) => (
                  <li key={q}>
                    <button onClick={() => openQuery(q)}
                            className={`w-full flex items-center justify-between gap-2
                                        text-left text-sm ${p.dim}
                                        hover:${light ? 'text-gray-900' : 'text-white'}
                                        py-1 transition-colors group`}>
                      <span className="truncate">{q}</span>
                      <IconArrowRight size={13}
                        className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <Footer light={light} />
    </main>
  );
}
