import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Renders a line chart from normalized backend data
// Shows a spinner while loading, an error message on failure, and nothing before first query
// Props:
//   data: { title, unit, labels, values, source, sourceUrl } | null
//   isLoading: boolean
//   error: string | null
function GraphDisplay({ data, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
          <p className="text-sm">Fetching data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center bg-red-50 border border-red-200 rounded-lg px-8 py-6 max-w-md">
          <p className="font-semibold text-red-700 mb-1">Could not load data</p>
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Not-found fallback from Layer 3
  if (data.notFound) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg px-8 py-6 max-w-md">
          <p className="font-semibold text-yellow-700 mb-1">No data found</p>
          <p className="text-sm text-yellow-600">{data.reason}</p>
        </div>
      </div>
    );
  }

  // Convert { labels: [...], values: [...] } into [{ x, y }, ...] for Recharts
  const chartData = data.labels.map((label, i) => ({
    x: label,
    y: data.values[i],
  }));

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">{data.title}</h2>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="x"
            label={{ value: data.labels.some(l => /[a-zA-Z]{3}/.test(l)) ? 'Month' : 'Year', position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            tickFormatter={(v) => {
              if (Math.abs(v) >= 1e12) return `${(v / 1e12).toFixed(1)}T`;
              if (Math.abs(v) >= 1e9)  return `${(v / 1e9).toFixed(1)}B`;
              if (Math.abs(v) >= 1e6)  return `${(v / 1e6).toFixed(1)}M`;
              if (Math.abs(v) >= 1e3)  return `${(v / 1e3).toFixed(1)}K`;
              return v;
            }}
            label={{ value: data.unit, angle: -90, position: 'insideLeft', offset: 15 }}
            width={80}
          />
          <Tooltip
            formatter={(value) => [value.toLocaleString(), data.unit]}
            labelFormatter={(label) => label}
          />
          <Line
            type="monotone"
            dataKey="y"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 4, fill: '#2563eb' }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <p className="text-center text-xs text-gray-400 mt-4">
        Source:{' '}
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-600"
        >
          {data.source}
        </a>
      </p>
    </div>
  );
}

export default GraphDisplay;
