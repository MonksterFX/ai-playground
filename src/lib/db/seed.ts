import { sql } from 'drizzle-orm';
import { observabilityDb } from './index';
import { pages } from './schema/observability';
import { testPages } from '../pages/registry';

let seeded = false;

/**
 * Sync the source-controlled page manifest into the `pages` table.
 *
 * - Inserts pages that don't exist yet (enabled by default).
 * - Updates title/path/description for existing pages.
 * - Never overwrites the runtime `enabled` state of existing pages.
 *
 * Idempotent and safe to call on every request; the actual work runs once
 * per process.
 */
export function ensurePagesSeeded(): void {
  if (seeded) return;

  const nowIso = new Date().toISOString();

  const upsert = observabilityDb
    .insert(pages)
    .values(
      testPages.map((page) => ({
        id: page.id,
        title: page.title,
        path: page.path,
        description: page.description,
        enabled: true,
        createdAt: nowIso,
        updatedAt: nowIso,
      })),
    )
    .onConflictDoUpdate({
      target: pages.id,
      set: {
        title: sql`excluded.title`,
        path: sql`excluded.path`,
        description: sql`excluded.description`,
        updatedAt: nowIso,
      },
    });

  upsert.run();
  seeded = true;
}
