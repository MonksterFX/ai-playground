import type { APIRoute } from 'astro';
import { recordEvent } from '../../../lib/db/repo';
import { verifyFlag } from '../../../lib/webmcp/challenge';

/**
 * Human-facing flag verification. Accepts a standard form POST (progressive
 * enhancement) and redirects back to the challenge page with the result, so it
 * works without client-side JavaScript.
 */
export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const data = await request.formData();
  const flag = (data.get('flag') ?? '').toString();

  const result = flag.trim().length === 0 ? { valid: false } : verifyFlag(flag);
  const status = flag.trim().length === 0 ? 'missing' : result.valid ? 'valid' : 'invalid';

  recordEvent({
    eventType: 'webmcp_flag_verify',
    pageId: 'webmcp-challenge',
    path: '/api/webmcp/verify-flag',
    url: request.url,
    method: 'POST',
    statusCode: 303,
    requestId: locals.requestId,
    // Never store the submitted flag value.
    metadata: { result: status, type: result.type ?? null },
  });

  return redirect(`/tests/webmcp?flag=${status}#flag-check`, 303);
};
