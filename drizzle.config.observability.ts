import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema/observability.ts',
  out: './drizzle/observability',
  dbCredentials: {
    url: process.env.OBSERVABILITY_DB_PATH ?? './data/observability.db',
  },
});
