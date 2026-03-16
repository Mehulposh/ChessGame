/**
 * Global async error handler.
 * Wrap async route handlers with this to avoid try/catch boilerplate.
 *
 * Usage:
 *   router.post('/rooms', asyncHandler(roomController.createRoom));
 */
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;