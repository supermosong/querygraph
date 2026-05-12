const express = require('express');
const router = express.Router();
const { fetchGraphData } = require('../services/dataFetcher');

router.post('/graph', async (req, res, next) => {
  const { query } = req.body;

  const trimmed = typeof query === 'string' ? query.trim() : '';
  if (!trimmed) {
    return res.status(400).json({ error: 'A non-empty "query" string is required.' });
  }
  if (trimmed.length > 500) {
    return res.status(400).json({ error: 'Query must be 500 characters or fewer.' });
  }

  try {
    const data = await fetchGraphData(trimmed);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
