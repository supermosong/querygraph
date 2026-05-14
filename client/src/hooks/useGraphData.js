import { useState } from 'react';
import { addToHistory } from './usePins';

// Manages the full lifecycle of a graph data fetch
// Returns: { data, isLoading, error, fetchGraph }
//   data: normalized chart object from the backend, or null
//   isLoading: true while the request is in flight
//   error: human-readable error string, or null
//   fetchGraph(query): call this to trigger a new fetch
function useGraphData() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sends the query to the backend and updates state based on the result
  async function fetchGraph(query) {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      let json;
      try {
        json = await response.json();
      } catch {
        throw new Error('Could not reach the server. Make sure the backend is running on port 3001.');
      }

      if (!response.ok) {
        throw new Error(json.error || 'Something went wrong. Please try a different query.');
      }

      addToHistory(query);
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return { data, isLoading, error, fetchGraph };
}

export default useGraphData;
