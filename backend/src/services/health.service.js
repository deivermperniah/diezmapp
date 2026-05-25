import { query } from '../db/query.js';

export const getServerHealth = () => ({
  status: 'ok',
  service: 'diezmapp-api',
  timestamp: new Date().toISOString(),
});

export const getDatabaseHealth = async () => {
  const result = await query('SELECT NOW() AS current_time');

  return {
    status: 'ok',
    database: 'connected',
    currentTime: result.rows[0].current_time,
  };
};
