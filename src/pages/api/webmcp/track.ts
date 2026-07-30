import type { APIRoute } from 'astro';
import { recordEvent } from '../../../lib/db/repo';

/**
 * Tracking sink for the external WebMCP proxy script. The proxy beacons one
 * event per tool interaction; this endpoint records it. Payloads are treated as
 * untrusted and are never allowed to carry sensitive values (the proxy already
 * strips argument/result contents before sending).
 */
interface TrackPayload {
  tool?: unknown;
  phase?: unknown;
  ok?: unknown;
  durationMs?: unknown;
  error?: unknown;
}

function str(value: unknown, max = 120): string | null {
  if (typeof value !== 'string') return null;
  return value.length > max ? value.slice(0, max) : value;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: TrackPayload = {};
  try {
    body = (await request.json()) as TrackPayload;
  } catch {
    // Ignore malformed beacons.
  }

  const tool = str(body.tool, 80);
  const phase = str(body.phase, 20);

  recordEvent({
    eventType: 'webmcp_tool_call',
    pageId: 'webmcp-challenge',
    path: '/api/webmcp/track',
    url: request.url,
    method: 'POST',
    statusCode: 204,
    responseTimeMs: typeof body.durationMs === 'number' ? Math.round(body.durationMs) : null,
    userAgent: request.headers.get('user-agent'),
    requestId: locals.requestId,
    metadata: {
      tool,
      phase,
      ok: typeof body.ok === 'boolean' ? body.ok : null,
      error: str(body.error, 200),
    },
  });

  return new Response(null, { status: 204 });
};
