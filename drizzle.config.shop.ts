import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema/shop.ts',
  out: './drizzle/shop',
  dbCredentials: {
    url: process.env.SHOP_DB_PATH ?? './data/shop.db',
  },
});
