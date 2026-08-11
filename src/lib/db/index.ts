import '../env';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import Database from 'better-sqlite3';
import { drizzle, type BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as observabilitySchema from './schema/observability';
import * as shopSchema from './schema/shop';

export type ObservabilityDB = BetterSQLite3Database<typeof observabilitySchema>;
export type ShopDB = BetterSQLite3Database<typeof shopSchema>;

const OBSERVABILITY_MIGRATIONS = resolve(process.cwd(), 'drizzle/observability');
const SHOP_MIGRATIONS = resolve(process.cwd(), 'drizzle/shop');

// Reuse connections across HMR reloads.
const g = globalThis as unknown as {
  __observabilityDb?: ObservabilityDB;
  __shopDb?: ShopDB;
};

function openDb<S extends Record<string, unknown>>(
  envVar: string,
  defaultPath: string,
  schema: S,
  migrationsFolder: string,
): BetterSQLite3Database<S> {
  const dbPath = resolve(process.cwd(), process.env[envVar] ?? defaultPath);

  const dir = dirname(dbPath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');

  const db = drizzle(sqlite, { schema });

  if (existsSync(migrationsFolder)) {
    migrate(db, { migrationsFolder });
  }

  return db;
}

export const observabilityDb: ObservabilityDB =
  g.__observabilityDb ??
  openDb('OBSERVABILITY_DB_PATH', './data/observability.db', observabilitySchema, OBSERVABILITY_MIGRATIONS);

export const shopDb: ShopDB =
  g.__shopDb ??
  openDb('SHOP_DB_PATH', './data/shop.db', shopSchema, SHOP_MIGRATIONS);

if (!g.__observabilityDb) g.__observabilityDb = observabilityDb;
if (!g.__shopDb) g.__shopDb = shopDb;

export { observabilitySchema, shopSchema };
