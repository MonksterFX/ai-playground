import type { APIRoute } from 'astro';
import { recordEvent } from '../../../lib/db/repo';
import { solveChallenge } from '../../../lib/webmcp/challenge';

/** Check a submitted answer. Body: `{ token, answer }`. Returns a flag on success. */
export const POST: APIRoute = async ({ request, locals }) => {
  let token = '';
  let answer = '';
  try {
    const body = (await request.json()) as { token?: unknown; answer?: unknown };
    if (typeof body?.token === 'string') token = body.token;
    if (typeof body?.answer === 'string') answer = body.answer;
    else if (typeof body?.answer === 'number') answer = String(body.answer);
  } catch {
    // Fall through with empty values → invalid_token.
  }

  const outcome = solveChallenge(token, answer);

  recordEvent({
    eventType: 'webmcp_solve',
    pageId: 'webmcp-challenge',
    path: '/api/webmcp/solve',
    url: request.url,
    method: 'POST',
    statusCode: 200,
    requestId: locals.requestId,
    // Never store the raw answer or the flag value.
    metadata: {
      result: outcome.status,
      type: outcome.status === 'correct' ? outcome.type : null,
    },
  });

  if (outcome.status === 'correct') {
    return new Response(JSON.stringify({ correct: true, flag: outcome.flag }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ correct: false, reason: outcome.status }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
