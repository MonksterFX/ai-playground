import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

// product_id references the in-code catalog (src/lib/webshop/catalog.ts), not a DB table
export const carts = sqliteTable('carts', {
  id: text('id').primaryKey(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

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

// Stores a non-sensitive snapshot only — never raw payment data
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

export type CartRow = typeof carts.$inferSelect;
export type CartItemRow = typeof cartItems.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type NewOrderRow = typeof orders.$inferInsert;
