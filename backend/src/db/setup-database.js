import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, '../..');
const projectRoot = path.resolve(backendRoot, '..');

dotenv.config({ path: path.resolve(backendRoot, '.env'), quiet: true });

const { Client } = pg;

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const quoteIdentifier = (identifier) => `"${identifier.replaceAll('"', '""')}"`;

const databaseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const targetDatabase = process.env.DB_NAME;
const adminDatabase = process.env.DB_ADMIN_DATABASE || 'postgres';
const schemaPath = path.resolve(projectRoot, 'database/diezmos_db.sql');

const createDatabaseIfNotExists = async () => {
  const client = new Client({
    ...databaseConfig,
    database: adminDatabase,
  });

  await client.connect();

  try {
    const result = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [targetDatabase]);

    if (result.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(targetDatabase)}`);
      console.log(`Database "${targetDatabase}" created.`);
    } else {
      console.log(`Database "${targetDatabase}" already exists.`);
    }
  } finally {
    await client.end();
  }
};

const getSchemaSql = async () => {
  const sql = await fs.readFile(schemaPath, 'utf8');

  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('CREATE DATABASE'))
    .filter((line) => !line.trim().startsWith('-- \\c'))
    .join('\n');
};

const runSchema = async () => {
  const client = new Client({
    ...databaseConfig,
    database: targetDatabase,
  });

  await client.connect();

  try {
    const schemaSql = await getSchemaSql();
    await client.query(schemaSql);
    console.log(`Schema applied to "${targetDatabase}".`);
  } finally {
    await client.end();
  }
};

const setupDatabase = async () => {
  await createDatabaseIfNotExists();
  await runSchema();
  console.log('Database setup completed.');
};

setupDatabase().catch((error) => {
  console.error('Database setup failed:', error.message);
  process.exit(1);
});
