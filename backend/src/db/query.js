import { pool } from './pool.js';

export const query = async (text, params = []) => {
  const result = await pool.query(text, params);
  return result;
};
