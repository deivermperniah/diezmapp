import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env');

dotenv.config({ path: envPath, quiet: true });

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];

const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const isProduction = process.env.NODE_ENV === 'production';
const useDatabaseSsl = process.env.DB_SSL
  ? process.env.DB_SSL === 'true'
  : isProduction;

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 3000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: useDatabaseSsl,
  },
};
