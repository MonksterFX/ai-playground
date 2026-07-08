import { randomUUID } from 'node:crypto';
import { and, count, desc, eq, gte, isNotNull, sql } from 'drizzle-orm';
import { db } from './index';
import {
  adminActions,
  cartItems,
  carts,
  events,
  orders,
  pages,
  type CartItemRow,
  type CartRow,
  type EventRow,
  type NewOrderRow,
  type OrderRow,
  type PageRow,
} from './schema';

export type EventType =
  | 'page_view'
  | 'page_disabled'
  | 'page_enabled'
  | 'admin_login_attempt'
  | 'admin_view'
  | 'form_submit'
  | 'button_click'
  | 'link_click'
  | 'cart_update'
  | 'checkout_submit'
  | 'error';

export interface RecordEventInput {
  eventType: EventType;
  pageId?: string | null;
  url?: string | null;
  path?: string | null;
  method?: string | null;
  statusCode?: number | null;
  responseTimeMs?: number | null;
  userAgent?: string | null;
  referrer?: string | null;
  ipAddress?: string | null;
  requestId?: string | null;
  sessionId?: string | null;
  agentHint?: string | null;
  headers?: Record<string, string> | null;
  metadata?: Record<string, unknown> | null;
}

/** Insert a tracking event. Never throws to the caller's critical path. */
export function recordEvent(input: RecordEventInput): void {
  const nowIso = new Date().toISOString();
  db.insert(events)
    .values({
      id: randomUUID(),
      timestamp: nowIso,
      eventType: input.eventType,
      pageId: input.pageId ?? null,
      url: input.url ?? null,
      path: input.path ?? null,
      method: input.method ?? null,
      statusCode: input.statusCode ?? null,
      responseTimeMs: input.responseTimeMs ?? null,
      userAgent: input.userAgent ?? null,
      referrer: input.referrer ?? null,
      ipAddress: input.ipAddress ?? null,
      requestId: input.requestId ?? null,
      sessionId: input.sessionId ?? null,
      agentHint: input.agentHint ?? null,
      headersJson: input.headers ? JSON.stringify(input.headers) : null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: nowIso,
    })
    .run();
}

export interface RecordAdminActionInput {
  actionType: string;
  targetPageId?: string | null;
  metadata?: Record<string, unknown> | null;
}

export function recordAdminAction(input: RecordAdminActionInput): void {
  const nowIso = new Date().toISOString();
  db.insert(adminActions)
    .values({
      id: randomUUID(),
      timestamp: nowIso,
      actionType: input.actionType,
      targetPageId: input.targetPageId ?? null,
      metadataJson: input.metadata ? JSON.stringify(input.metadata) : null,
      createdAt: nowIso,
    })
    .run();
}

/** All registered pages, ordered by title. */
export function listPages(): PageRow[] {
  return db.select().from(pages).orderBy(pages.title).all();
}

export function getPageByPath(path: string): PageRow | undefined {
  return db.select().from(pages).where(eq(pages.path, path)).get();
}

export function getPageById(id: string): PageRow | undefined {
  return db.select().from(pages).where(eq(pages.id, id)).get();
}

/** Toggle a page's enabled state. Returns the updated row (or undefined). */
export function setPageEnabled(id: string, enabled: boolean): PageRow | undefined {
  return db
    .update(pages)
    .set({ enabled, updatedAt: new Date().toISOString() })
    .where(eq(pages.id, id))
    .returning()
    .get();
}

/** Recent events, newest first. */
export function listRecentEvents(limit = 200): EventRow[] {
  return db.select().from(events).orderBy(desc(events.timestamp)).limit(limit).all();
}

export function getEventById(id: string): EventRow | undefined {
  return db.select().from(events).where(eq(events.id, id)).get();
}

export interface DashboardStats {
  totalPages: number;
  enabledPages: number;
  disabledPages: number;
  recentEventCount: number;
  recentErrorCount: number;
  slowestResponses: EventRow[];
}

/** Aggregate figures for the admin dashboard (last 24h for "recent"). */
export function getDashboardStats(): DashboardStats {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const totalPages = db.select({ value: count() }).from(pages).get()?.value ?? 0;
  const enabledPages =
    db.select({ value: count() }).from(pages).where(eq(pages.enabled, true)).get()?.value ?? 0;

  const recentEventCount =
    db.select({ value: count() }).from(events).where(gte(events.timestamp, since)).get()?.value ??
    0;

  const recentErrorCount =
    db
      .select({ value: count() })
      .from(events)
      .where(and(eq(events.eventType, 'error'), gte(events.timestamp, since)))
      .get()?.value ?? 0;

  const slowestResponses = db
    .select()
    .from(events)
    .where(and(gte(events.timestamp, since), isNotNull(events.responseTimeMs)))
    .orderBy(desc(events.responseTimeMs))
    .limit(5)
    .all();

  return {
    totalPages,
    enabledPages,
    disabledPages: totalPages - enabledPages,
    recentEventCount,
    recentErrorCount,
    slowestResponses,
  };
}

// --- Demo shop: carts & orders ---------------------------------------------

/** Fetch a cart by id, or create it with the given id if it does not exist. */
export function getOrCreateCart(cartId: string): CartRow {
  const existing = db.select().from(carts).where(eq(carts.id, cartId)).get();
  if (existing) return existing;

  const nowIso = new Date().toISOString();
  return db
    .insert(carts)
    .values({ id: cartId, createdAt: nowIso, updatedAt: nowIso })
    .returning()
    .get();
}

/** All line items for a cart, oldest first. */
export function getCartItems(cartId: string): CartItemRow[] {
  return db
    .select()
    .from(cartItems)
    .where(eq(cartItems.cartId, cartId))
    .orderBy(cartItems.createdAt)
    .all();
}

/** Add `qty` of a product to a cart, incrementing any existing line item. */
export function addCartItem(cartId: string, productId: string, qty = 1): void {
  const nowIso = new Date().toISOString();
  getOrCreateCart(cartId);
  db.insert(cartItems)
    .values({
      id: randomUUID(),
      cartId,
      productId,
      qty,
      createdAt: nowIso,
      updatedAt: nowIso,
    })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: { qty: sql`${cartItems.qty} + ${qty}`, updatedAt: nowIso },
    })
    .run();
  touchCart(cartId, nowIso);
}

/** Set an exact quantity for a line item; removes it when `qty <= 0`. */
export function setCartItemQty(cartId: string, productId: string, qty: number): void {
  if (qty <= 0) {
    removeCartItem(cartId, productId);
    return;
  }
  const nowIso = new Date().toISOString();
  db.update(cartItems)
    .set({ qty, updatedAt: nowIso })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .run();
  touchCart(cartId, nowIso);
}

/** Remove a single line item from a cart. */
export function removeCartItem(cartId: string, productId: string): void {
  db.delete(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .run();
  touchCart(cartId, new Date().toISOString());
}

/** Remove all line items from a cart. */
export function clearCart(cartId: string): void {
  db.delete(cartItems).where(eq(cartItems.cartId, cartId)).run();
  touchCart(cartId, new Date().toISOString());
}

function touchCart(cartId: string, nowIso: string): void {
  db.update(carts).set({ updatedAt: nowIso }).where(eq(carts.id, cartId)).run();
}

/** Persist a completed order and return the stored row. */
export function createOrder(input: Omit<NewOrderRow, 'id' | 'createdAt'>): OrderRow {
  const nowIso = new Date().toISOString();
  return db
    .insert(orders)
    .values({ ...input, id: randomUUID(), createdAt: nowIso })
    .returning()
    .get();
}

export function getOrderById(id: string): OrderRow | undefined {
  return db.select().from(orders).where(eq(orders.id, id)).get();
}
