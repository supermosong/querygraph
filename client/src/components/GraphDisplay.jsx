// GraphDisplay.jsx — renders a line, bar, or pie chart from backend data
import React from 'react';
import {
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatTick, formatValue } from '../utils/formatData';

const COLORS = ['#2563eb','#16a34a','#dc2626','#d97706','#7c3aed','#0891b2','#be185d'];

// Spinner shown while data is loading
function Spinner() {
  return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
        <p className="text-sm">Fetching data…</p>
      </div>
    </div>
  );
}

// Error card shown when the API returns an error string
function ErrorCard({ message }) {
  const isRateLimit = message?.includes('Daily limit');
  return (
    <div className="flex items-center justify-center h-48">
      <div className={`text-center border rounded-lg px-8 py-6 max-w-md
        ${isRateLimit ? 'bg-orange-50 border-orange-200' : 'bg-red-50 border-red-200'}`}>
        <p className={`font-semibold mb-1 ${isRateLimit ? 'text-orange-700' : 'text-red-700'}`}>
          {isRateLimit ? 'Daily limit reached' : 'Could not load data'}
        </p>
        <p className={`text-sm ${isRateLimit ? 'text-orange-600' : 'text-red-600'}`}>{message}</p>
      </div>
    </div>
  );
}

// Not-found card when the model finds no usable data
function NotFoundCard({ reason }) {
  return (
    <div className="flex items-center justify-center h-48">
      <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg px-8 py-6 max-w-md">
        <p className="font-semibold text-yellow-700 mb-1">No data found</p>
        <p className="text-sm text-yellow-600">{reason}</p>
      </div>
    </div>
  );
}

// Converts parallel labels/values arrays into Recharts-compatible [{x, y}] format
function toChartData(labels, values) {
  return labels.map((label, i) => ({ x: label, y: values[i] }));
}

// Detects whether labels are months (contain letters) or years
function xAxisLabel(labels) {
  return labels.some((l) => /[a-zA-Z]/.test(l)) ? 'Month' : 'Year';
}

// Renders a line chart
function LineGraph({ chartData, data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="x" label={{ value: xAxisLabel(data.labels), position: 'insideBottom', offset: -10 }} />
        <YAxis tickFormatter={formatTick} label={{ value: data.unit, angle: -90, position: 'insideLeft', offset: 15 }} width={80} />
        <Tooltip formatter={(v) => [formatValue(v, data.unit), data.unit]} labelFormatter={(l) => l} />
        <Line type="monotone" dataKey="y" stroke="#2563eb" strokeWidth={2} dot={{ r: 4, fill: '#2563eb' }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// Renders a bar chart
function BarGraph({ chartData, data }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="x" label={{ value: xAxisLabel(data.labels), position: 'insideBottom', offset: -10 }} />
        <YAxis tickFormatter={formatTick} label={{ value: data.unit, angle: -90, position: 'insideLeft', offset: 15 }} width={80} />
        <Tooltip formatter={(v) => [formatValue(v, data.unit), data.unit]} labelFormatter={(l) => l} />
        <Bar dataKey="y" fill="#2563eb" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Renders a pie chart
function PieGraph({ data }) {
  const pieData = data.labels.map((label, i) => ({ name: label, value: data.values[i] }));
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={130} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}>
          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip formatter={(v) => [formatValue(v, data.unit), data.unit]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Main component — shows spinner, error, not-found, or the appropriate chart type
function GraphDisplay({ data, isLoading, error, chartType = 'line' }) {
  if (isLoading) return <Spinner />;
  if (error)     return <ErrorCard message={error} />;
  if (!data)     return null;
  if (data.notFound) return <NotFoundCard reason={data.reason} />;

  const chartData = toChartData(data.labels, data.values);
  const isFRED = data.source?.toLowerCase().includes('fred') || data.source?.toLowerCase().includes('federal reserve');

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">{data.title}</h2>

      {chartType === 'pie'  && <PieGraph data={data} />}
      {chartType === 'bar'  && <BarGraph chartData={chartData} data={data} />}
      {chartType === 'line' && <LineGraph chartData={chartData} data={data} />}

      <p className="text-center text-xs text-gray-400 mt-4">
        Source:{' '}
        <a href={data.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">
          {data.source}
        </a>
      </p>

      {isFRED && (
        <p className="text-center text-xs text-gray-400 mt-1 italic">
          This product uses the FRED® API but is not endorsed or certified by the Federal Reserve Bank of St. Louis.
        </p>
      )}
    </div>
  );
}

export default GraphDisplay;
