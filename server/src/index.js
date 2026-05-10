// index.js — Express server entry point

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const graphRouter = require('./routes/graph');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow requests from the Vite dev server (http://localhost:5173)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// API routes — all mounted under /api
app.use('/api', graphRouter);

// Centralized error handler — must be registered last
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`QueryGraph server running at http://localhost:${PORT}`);
});

module.exports = app;
