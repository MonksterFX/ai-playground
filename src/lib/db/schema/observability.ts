import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Runtime state for test pages; source-of-truth manifest is in src/lib/pages/registry.ts
export const pages = sqliteTable('pages', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  path: text('path').notNull().unique(),
  description: text('description'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

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

export const adminActions = sqliteTable('admin_actions', {
  id: text('id').primaryKey(),
  timestamp: text('timestamp').notNull(),
  actionType: text('action_type').notNull(),
  targetPageId: text('target_page_id'),
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
});

export type PageRow = typeof pages.$inferSelect;
export type NewPageRow = typeof pages.$inferInsert;
export type EventRow = typeof events.$inferSelect;
export type NewEventRow = typeof events.$inferInsert;
export type AdminActionRow = typeof adminActions.$inferSelect;
export type NewAdminActionRow = typeof adminActions.$inferInsert;
