import { getDatabaseHealth, getServerHealth } from '../services/health.service.js';

export const healthCheck = async (_req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: getServerHealth(),
    });
  } catch (error) {
    next(error);
  }
};

export const databaseHealthCheck = async (_req, res, next) => {
  try {
    const databaseHealth = await getDatabaseHealth();

    res.status(200).json({
      success: true,
      data: databaseHealth,
    });
  } catch (error) {
    next(error);
  }
};
