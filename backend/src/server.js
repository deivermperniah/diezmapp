import app from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';

const server = app.listen(env.port, () => {
  console.log(`DIEZMAPP API running on port ${env.port}`);
});

server.on('error', (error) => {
  console.error('Failed to start DIEZMAPP API:', error.message);
  process.exit(1);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing server...`);

  server.close(async () => {
    await pool.end();
    console.log('Server and database pool closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
