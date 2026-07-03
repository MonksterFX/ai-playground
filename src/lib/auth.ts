import { timingSafeEqual } from 'node:crypto';

/**
 * Basic Auth helpers for the admin area.
 *
 * Credentials come from environment variables and are never stored. Comparison
 * is timing-safe to avoid leaking information through response timing.
 */

export type AuthResult = 'ok' | 'missing' | 'invalid' | 'misconfigured';

interface ParsedBasicAuth {
  username: string;
  password: string;
}

function getConfiguredCredentials(): ParsedBasicAuth | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) return null;
  return { username, password };
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    // Compare against self to keep timing roughly constant, then fail.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/** Parse an `Authorization: Basic ...` header into credentials. */
export function parseBasicAuth(header: string | null): ParsedBasicAuth | null {
  if (!header) return null;
  const [scheme, encoded] = header.split(' ');
  if (scheme?.toLowerCase() !== 'basic' || !encoded) return null;

  let decoded: string;
  try {
    decoded = Buffer.from(encoded, 'base64').toString('utf-8');
  } catch {
    return null;
  }

  const separator = decoded.indexOf(':');
  if (separator === -1) return null;

  return {
    username: decoded.slice(0, separator),
    password: decoded.slice(separator + 1),
  };
}

/** Verify the Authorization header against configured admin credentials. */
export function verifyAdminAuth(header: string | null): {
  result: AuthResult;
  username: string | null;
} {
  const configured = getConfiguredCredentials();
  if (!configured) return { result: 'misconfigured', username: null };

  const parsed = parseBasicAuth(header);
  if (!parsed) return { result: 'missing', username: null };

  const userOk = safeEqual(parsed.username, configured.username);
  const passOk = safeEqual(parsed.password, configured.password);

  return {
    result: userOk && passOk ? 'ok' : 'invalid',
    username: parsed.username,
  };
}

/** Build a 401 response that prompts for Basic Auth credentials. */
export function unauthorizedResponse(message = 'Authentication required.'): Response {
  return new Response(message, {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Agent Playground Admin", charset="UTF-8"',
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
}
