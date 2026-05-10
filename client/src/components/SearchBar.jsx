import React, { useState } from 'react';

// Query input field with a submit button
// Props:
//   onSubmit(query: string) — called when user submits
//   isLoading: boolean — disables the button while data is being fetched
function SearchBar({ onSubmit, isLoading }) {
  const [query, setQuery] = useState('');

  // Prevents the default form reload and fires onSubmit with the trimmed query
  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      onSubmit(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 w-full max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try "US unemployment rate 2020-2024" or "inflation last 5 years"'
        autoFocus
        aria-label="Data query"
        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-800
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400 text-sm"
      />
      <button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg text-sm
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors whitespace-nowrap"
      >
        {isLoading ? 'Loading…' : 'Search'}
      </button>
    </form>
  );
}

export default SearchBar;
