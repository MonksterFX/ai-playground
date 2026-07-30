import type { APIRoute } from 'astro';
import { recordEvent } from '../../../lib/db/repo';

interface IntentPayload {
  task?: unknown;
  details?: unknown;
}

function str(value: unknown, max = 500): string | null {
  if (typeof value !== 'string') return null;
  return value.length > max ? value.slice(0, max) : value;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: IntentPayload = {};
  try {
    body = (await request.json()) as IntentPayload;
  } catch {
    // Ignore malformed payloads.
  }

  const task = str(body.task, 500);
  const details = str(body.details, 1000);

  recordEvent({
    eventType: 'webmcp_intent',
    pageId: 'agent-intent',
    path: '/api/webmcp/intent',
    url: request.url,
    method: 'POST',
    statusCode: 204,
    userAgent: request.headers.get('user-agent'),
    requestId: locals.requestId,
    metadata: { task, details },
  });

  return new Response(null, { status: 204 });
};
