// errorHandler.js — centralized Express error handler
// All unhandled errors in routes bubble up here via next(err)

function errorHandler(err, req, res, next) {
  console.error('[QueryGraph Error]', err.message);

  res.status(err.statusCode || 500).json({
    error: err.message || 'An unexpected error occurred. Please try again.',
  });
}

module.exports = errorHandler;
