// Централизованные обработчики ошибок и 404

export function notFoundHandler(req, res, _next) {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
}

export function errorHandler(err, _req, res, _next) {
  const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
  const code = err?.code || (status === 500 ? 'INTERNAL_SERVER_ERROR' : 'UNKNOWN_ERROR');
  const message = err?.message || 'Unexpected error';
  const details = err?.details;

  if (res.headersSent) {
    return;
  }

  res.status(status).json({
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  });
}
