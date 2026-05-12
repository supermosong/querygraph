// Home.jsx — main page combining search, suggestion chips, chart type selector, and graph
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import GraphDisplay from '../components/GraphDisplay';
import SuggestionChips from '../components/SuggestionChips';
import ChartTypeSelector from '../components/ChartTypeSelector';
import ExportButton from '../components/ExportButton';
import useGraphData from '../hooks/useGraphData';

function Home() {
  const { data, isLoading, error, fetchGraph } = useGraphData();
  const [chartType, setChartType] = useState('line');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12 sm:py-16 flex flex-col items-center gap-6 sm:gap-8">

        {/* Hero */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Ask any data question
          </h1>
          <p className="text-gray-500 text-base sm:text-lg">
            Type a plain-English query and get an instant interactive graph.
          </p>
        </div>

        {/* Search bar — full width on mobile */}
        <div className="w-full max-w-2xl px-0 sm:px-0">
          <SearchBar onSubmit={fetchGraph} isLoading={isLoading} />
        </div>

        {/* Suggestion chips */}
        <SuggestionChips onSelect={fetchGraph} disabled={isLoading} />

        {/* Chart controls — only shown when data is loaded */}
        {data && !data.notFound && (
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <ChartTypeSelector chartType={chartType} onChange={setChartType} />
            <ExportButton title={data.title} />
          </div>
        )}

        {/* Graph */}
        <GraphDisplay data={data} isLoading={isLoading} error={error} chartType={chartType} />

      </div>
    </main>
  );
}

export default Home;
