import type { APIRoute } from 'astro';
import { recordEvent } from '../../../lib/db/repo';
import { createChallenge } from '../../../lib/webmcp/challenge';

/** Issue a new signed challenge. Body: optional `{ type }`. */
export const POST: APIRoute = async ({ request, locals }) => {
  let requestedType: string | undefined;
  try {
    const body = (await request.json()) as { type?: unknown };
    if (typeof body?.type === 'string') requestedType = body.type;
  } catch {
    // No/invalid body — pick a random challenge.
  }

  const challenge = createChallenge(requestedType);

  recordEvent({
    eventType: 'webmcp_challenge',
    pageId: 'webmcp-challenge',
    path: '/api/webmcp/challenge',
    url: request.url,
    method: 'POST',
    statusCode: challenge ? 200 : 404,
    requestId: locals.requestId,
    metadata: { requestedType: requestedType ?? null, type: challenge?.type ?? null },
  });

  if (!challenge) {
    return new Response(JSON.stringify({ error: 'unknown_challenge_type' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(
    JSON.stringify({
      token: challenge.token,
      type: challenge.type,
      title: challenge.title,
      prompt: challenge.prompt,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
};
