// graph.js — defines the POST /api/graph endpoint

const express = require('express');
const router = express.Router();
const { parseQuery } = require('../services/queryParser');
const { routeQuery } = require('../services/apiRouter');

// POST /api/graph
// Body: { query: string }
// Returns: normalized chart data object, or { error: string }
router.post('/graph', async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty "query" string is required in the request body.' });
  }

  try {
    const parsed = parseQuery(query.trim());
    const data = await routeQuery(parsed);
    res.json(data);
  } catch (err) {
    next(err); // Forward to errorHandler middleware
  }
});

module.exports = router;
