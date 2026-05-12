const cache = new Map();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

function getCached(query) {
  const key = query.toLowerCase().trim();
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(query, data) {
  cache.set(query.toLowerCase().trim(), { data, timestamp: Date.now() });
}

module.exports = { getCached, setCached };
