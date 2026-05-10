import React from 'react';
import SearchBar from '../components/SearchBar';
import GraphDisplay from '../components/GraphDisplay';
import useGraphData from '../hooks/useGraphData';

// Three clickable example queries shown below the search bar
const EXAMPLE_QUERIES = [
  'US unemployment rate 2020-2024',
  'inflation last 5 years',
  'US inflation rate 2018-2023',
];

// Main page — hero text, search bar, example chips, and the graph
function Home() {
  const { data, isLoading, error, fetchGraph } = useGraphData();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center gap-8">

        {/* Hero text */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Ask any data question
          </h1>
          <p className="text-gray-500 text-lg">
            Type a plain-English query and get an instant interactive graph.
          </p>
        </div>

        {/* Search input */}
        <SearchBar onSubmit={fetchGraph} isLoading={isLoading} />

        {/* Example query chip buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => fetchGraph(q)}
              disabled={isLoading}
              className="px-4 py-1.5 text-sm bg-white border border-gray-300 text-gray-600
                         rounded-full hover:border-blue-400 hover:text-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chart area — shows spinner, error, or the graph */}
        <GraphDisplay data={data} isLoading={isLoading} error={error} />

      </div>
    </main>
  );
}

export default Home;
