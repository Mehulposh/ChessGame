/**
 * Centralised Express error handler.
 * Must be registered LAST (after all routes) with app.use(errorHandler).
 *
 * Catches errors thrown inside asyncHandler-wrapped controllers and returns
 * a consistent JSON error envelope.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message    = err.message    || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error(`❌ [${statusCode}] ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    error:   message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

export default errorHandler;