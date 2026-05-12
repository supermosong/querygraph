const express = require('express');
const router = express.Router();
const { fetchGraphData } = require('../services/dataFetcher');

router.post('/graph', async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty "query" string is required.' });
  }

  try {
    const data = await fetchGraphData(query.trim());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
