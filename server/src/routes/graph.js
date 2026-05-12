// graph.js — POST /api/graph endpoint with input validation and rate limiting
const express = require('express');
const router  = express.Router();
const { fetchGraphData } = require('../services/dataFetcher');
const { checkLimit }     = require('../middleware/rateLimit');

router.post('/graph', async (req, res, next) => {
  const { query, userId = 'anonymous', tier = 'free' } = req.body;

  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) {
    return res.status(400).json({ error: 'A non-empty "query" string is required.' });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'Query must be 500 characters or fewer.' });
  }

  const limit = checkLimit(userId, tier);
  if (!limit.allowed) {
    return res.status(429).json({
      error: `Daily limit reached (${limit.limit} queries/day). Upgrade to Pro for more.`,
      code:  'RATE_LIMIT_EXCEEDED',
      used:  limit.used,
      limit: limit.limit,
    });
  }

  try {
    const data = await fetchGraphData(trimmed);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
