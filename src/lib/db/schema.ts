import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/**
 * Registered test pages. The source-of-truth manifest lives in
 * `src/lib/pages/registry.ts`; this table stores runtime state such as
 * whether a page is currently enabled.
 */
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  path: text('path').notNull().unique(),
  description: text('description'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Request- and interaction-level events captured for observability.
 */
export const events = sqliteTable(
  'events',
  {
    id: text('id').primaryKey(),
    timestamp: text('timestamp').notNull(),
    eventType: text('event_type').notNull(),
    pageId: text('page_id').references(() => pages.id),
    url: text('url'),
    path: text('path'),
    method: text('method'),
    statusCode: integer('status_code'),
    responseTimeMs: integer('response_time_ms'),
    userAgent: text('user_agent'),
    referrer: text('referrer'),
    ipAddress: text('ip_address'),
    requestId: text('request_id'),
    sessionId: text('session_id'),
    agentHint: text('agent_hint'),
    headersJson: text('headers_json'),
    metadataJson: text('metadata_json'),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    index('idx_events_timestamp').on(table.timestamp),
    index('idx_events_page_id').on(table.pageId),
    index('idx_events_event_type').on(table.eventType),
    index('idx_events_request_id').on(table.requestId),
  ],
);

/**
 * Audit log of admin actions (enable/disable, etc.).
 */
export const adminActions = sqliteTable('admin_actions', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actionType: text('action_type').notNull(),
  targetPageId: text('target_page_id'),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
});

/**
 * Server-side shopping carts for the demo shop. Identified by an opaque
 * `cart_id` stored in an httpOnly cookie on the client.
 */
export const carts = sqliteTable('carts', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Line items belonging to a cart. `product_id` references the in-code catalog
 * (see `src/lib/webshop/catalog.ts`), so it is stored as plain text.
 */
export const cartItems = sqliteTable(
  'cart_items',
  {
    id: text('id').primaryKey(),
    cartId: text('cart_id')
      .notNull()
      .references(() => carts.id, { onDelete: 'cascade' }),
    productId: text('product_id').notNull(),
    qty: integer('qty').notNull().default(1),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('idx_cart_items_cart_id').on(table.cartId),
    uniqueIndex('uniq_cart_items_cart_product').on(table.cartId, table.productId),
  ],
);

/**
 * Completed demo orders. Stores only a non-sensitive snapshot of the purchased
 * items and shipping summary — never raw payment card data.
 */
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  cartId: text('cart_id'),
  itemsJson: text('items_json').notNull(),
  subtotalInCents: integer('subtotal_in_cents').notNull(),
  shippingInCents: integer('shipping_in_cents').notNull(),
  totalInCents: integer('total_in_cents').notNull(),
  contactEmail: text('contact_email'),
  shippingName: text('shipping_name'),
  shippingCity: text('shipping_city'),
  shippingCountry: text('shipping_country'),
  createdAt: text('created_at').notNull(),
});

export type PageRow = typeof pages.$inferSelect;
export type NewPageRow = typeof pages.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type AdminActionRow = typeof adminActions.$inferSelect;
export type NewAdminActionRow = typeof adminActions.$inferInsert;
export type CartRow = typeof carts.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
