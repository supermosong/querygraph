// src/components/GraphDisplay.jsx
import React, { useState, useEffect } from 'react';
import { QG_PAL, QG_THEME } from '../theme';
import { qgFormatValue } from './charts/chartUtils';
import LineChart from './charts/LineChart';
import BarChart from './charts/BarChart';
import PieChart from './charts/PieChart';
import ChartTypeSelector from './ChartTypeSelector';
import { IconAlert, IconPin } from './icons/Icons';

export default function GraphDisplay({ data, isLoading, error, chartType, setChartType, light, onRetry, onPin, isPinned }) {
  const p = QG_PAL[light ? 'light' : 'dark'];
  if (!data && !isLoading && !error) return null;

  return (
    <section className={`qg-rise w-full rounded-xl border ${p.border} ${p.surface} shadow-card overflow-hidden`}>
      {isLoading && <LoadingState p={p} light={light} />}
      {error && !isLoading && <ErrorState error={error} onRetry={onRetry} p={p} light={light} />}
      {data && !isLoading && !error && (
        <GraphSuccess data={data} chartType={chartType} setChartType={setChartType}
                      light={light} onPin={onPin} isPinned={isPinned} />
      )}
    </section>
  );
}

function LoadingState({ p, light }) {
  return (
    <div className="grid place-items-center px-6 py-24 text-center">
      <div className="qg-ring w-10 h-10 mx-auto mb-5" />
      <p className={`text-sm font-medium ${light ? 'text-gray-800' : 'text-white'}`}>
        Searching the web…
      </p>
      <p className={`text-xs ${p.dim} mt-1.5 max-w-sm`}>
        Reading FRED, BLS, World Bank, and other sources for your query.
      </p>
    </div>
  );
}

function ErrorState({ error, onRetry, p, light }) {
  return (
    <div className="grid place-items-center px-6 py-20 text-center">
      <div className="w-12 h-12 rounded-full grid place-items-center bg-red-500/10 text-red-400 mb-4">
        <IconAlert size={22} />
      </div>
      <p className={`text-base font-semibold ${light ? 'text-gray-900' : 'text-white'}`}>No data found</p>
      <p className={`text-sm ${p.dim} mt-1 max-w-md`}>{error}</p>
      <button onClick={onRetry}
              className={`mt-5 text-xs font-medium px-3 py-1.5 rounded-lg
                          border ${p.border} ${p.dim} hover:${p.text} transition-colors`}>
        Clear and try again
      </button>
    </div>
  );
}

function GraphSuccess({ data, chartType, setChartType, light, onPin, isPinned }) {
  const p     = QG_PAL[light ? 'light' : 'dark'];
  const theme = QG_THEME[light ? 'light' : 'dark'];
  const [focus, setFocus] = useState(null);
  useEffect(() => { setFocus(null); }, [data, chartType]);

  const first = data.values[0];
  const last  = data.values[data.values.length - 1];
  const delta = last - first;
  const pct   = first !== 0 ? (delta / Math.abs(first)) * 100 : 0;
  const up    = delta >= 0;
  const isFRED = /fred|federal reserve/i.test(data.source || '');

  return (
    <div className="p-6 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <h2 className={`text-xl sm:text-2xl font-semibold leading-tight tracking-tight
                          ${light ? 'text-gray-900' : 'text-white'}`}>
            {data.title}
          </h2>
          {data.description && (
            <p className={`text-sm ${p.dim} mt-1.5`}>{data.description}</p>
          )}
          <div className="flex items-baseline gap-3 mt-4">
            <span className={`text-3xl sm:text-4xl font-semibold tracking-tight tnum
                              ${light ? 'text-gray-900' : 'text-white'}`}>
              {qgFormatValue(last, data.format, data.unit)}
            </span>
            <span className={`text-xs ${p.muted}`}>latest</span>
            <span className={`tnum text-sm font-medium px-2 py-0.5 rounded
                              ${up ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'}`}>
              {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
              <span className={`${p.muted} font-normal ml-1.5`}>vs. start</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ChartTypeSelector chartType={chartType} onChange={setChartType} light={light} />
          {onPin && (
            <button onClick={() => onPin(data)}
                    aria-label={isPinned ? 'Unpin chart' : 'Pin chart'}
                    className={`p-2 rounded-lg border transition-colors
                                ${isPinned
                                  ? 'border-indigo-500/50 text-indigo-400 bg-indigo-500/10'
                                  : `${p.border} ${p.dim} hover:text-indigo-400 hover:border-indigo-500/40`}`}>
              <IconPin size={15} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 w-full" style={{ height: 320 }}>
        {chartType === 'line' && <LineChart data={data} theme={theme} />}
        {chartType === 'bar'  && <BarChart  data={data} theme={theme} />}
        {chartType === 'pie'  && <PieChart  data={data} theme={theme} />}
      </div>

      <div className={`mt-6 pt-4 border-t ${p.border} flex flex-col gap-1.5`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer"
             className={`text-sm ${p.dim} hover:${light ? 'text-gray-900' : 'text-white'} transition-colors`}>
            Source: <span className="underline underline-offset-4 decoration-dotted">{data.source}</span>
          </a>
          <span className={`text-xs ${p.muted}`}>Updated just now</span>
        </div>
        {isFRED && (
          <p className={`text-xs italic ${p.muted}`}>
            This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.
          </p>
        )}
      </div>
    </div>
  );
}
