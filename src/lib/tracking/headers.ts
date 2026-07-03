/**
 * Request header filtering for tracking.
 *
 * Only an allowlist of non-sensitive headers is stored. Sensitive headers
 * (Authorization, Cookie, Set-Cookie, ...) are never persisted, even if they
 * were somehow added to the allowlist.
 */

const ALLOWED_HEADERS = new Set(
  [
    'user-agent',
    'accept',
    'accept-language',
    'accept-encoding',
    'referer',
    'host',
    'origin',
    'sec-fetch-site',
    'sec-fetch-mode',
    'sec-fetch-dest',
    'x-forwarded-for',
    'x-request-id',
  ].map((h) => h.toLowerCase()),
);

const BLOCKED_HEADERS = new Set(
  ['authorization', 'cookie', 'set-cookie', 'proxy-authorization'].map((h) => h.toLowerCase()),
);

/** Return a filtered plain object of headers safe to store. */
export function filterHeaders(headers: Headers): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of headers.entries()) {
    const lower = key.toLowerCase();
    if (BLOCKED_HEADERS.has(lower)) continue;
    if (!ALLOWED_HEADERS.has(lower)) continue;
    result[lower] = value;
  }
  return result;
}
