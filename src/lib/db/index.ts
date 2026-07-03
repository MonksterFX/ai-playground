import '../env';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

export type DB = BetterSQLite3Database<typeof schema>;

const DEFAULT_DB_PATH = './data/playground.db';
const MIGRATIONS_FOLDER = resolve(process.cwd(), 'drizzle');

// Reuse a single connection across HMR reloads and requests.
const globalForDb = globalThis as unknown as {
  __agentPlaygroundDb?: DB;
};

function createDb(): DB {
  const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? DEFAULT_DB_PATH);

  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  if (existsSync(MIGRATIONS_FOLDER)) {
    migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  }

  return db;
}

export const db: DB = globalForDb.__agentPlaygroundDb ?? createDb();

if (!globalForDb.__agentPlaygroundDb) {
  globalForDb.__agentPlaygroundDb = db;
}

export { schema };
