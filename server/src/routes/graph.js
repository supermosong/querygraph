const express = require('express');
const router = express.Router();
const { routeQuery } = require('../services/apiRouter');

router.post('/graph', async (req, res, next) => {
  const { query } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'A non-empty "query" string is required in the request body.' });
  }

  try {
    const data = await routeQuery(query.trim());
    res.json(data);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
