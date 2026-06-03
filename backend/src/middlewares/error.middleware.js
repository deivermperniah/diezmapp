import { env } from '../config/env.js';

const postgresErrorMessages = {
  '23503': 'No se encontro el registro relacionado.',
  '23505': 'Ya existe un registro con esos datos. Revise valores unicos como email por iglesia o numero de sobre mensual.',
};

const getPostgresErrorMessage = (error, req) => {
  if (error.code === '23503' && req.method === 'DELETE' && req.originalUrl.includes('/miembros/')) {
    return 'No se puede eliminar el miembro porque tiene sobres registrados.';
  }

  return postgresErrorMessages[error.code];
};

export const errorMiddleware = (error, req, res, _next) => {
  const isPostgresKnownError = Boolean(postgresErrorMessages[error.code]);
  const statusCode = error.statusCode || (isPostgresKnownError ? 400 : 500);
  const message = getPostgresErrorMessage(error, req) || error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
};
