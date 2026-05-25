import { env } from '../config/env.js';

const postgresErrorMessages = {
  '23503': 'No se encontro el registro relacionado.',
  '23505': 'Ya existe un registro con esos datos. Revise valores unicos como email o numero de sobre mensual.',
};

export const errorMiddleware = (error, _req, res, _next) => {
  const isPostgresKnownError = Boolean(postgresErrorMessages[error.code]);
  const statusCode = error.statusCode || (isPostgresKnownError ? 400 : 500);
  const message = postgresErrorMessages[error.code] || error.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && { stack: error.stack }),
  });
};
