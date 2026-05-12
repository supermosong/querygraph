// index.js — Express server entry point

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const graphRouter = require('./routes/graph');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow Vite dev server in development; use FRONTEND_URL env var in production
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  methods: ['GET', 'POST'],
}));

// Parse JSON request bodies
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', endpoint: 'POST /api/graph' }));

// API routes — all mounted under /api
app.use('/api', graphRouter);

// Centralized error handler — must be registered last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`QueryGraph server running at http://localhost:${PORT}`);
});

module.exports = app;
