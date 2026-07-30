/**
 * Stateless orchestration for the WebMCP challenge flow.
 *
 * A challenge is issued as a signed, self-describing token — no server-side
 * session or database row is needed. The token carries the challenge `type`,
 * its randomized `params`, and an expiry, all authenticated with an HMAC keyed
 * by `WEBMCP_SECRET`. On submission the server re-derives the expected answer
 * from the token and, on success, returns a flag deterministically derived from
 * the same secret. The flag can therefore be re-verified later without state.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';
import {
  getChallenge,
  listChallenges,
  pickRandomChallenge,
  type ChallengeParams,
} from './challenges';

const CHALLENGE_TTL_MS = 15 * 60 * 1000;

/**
 * Signing key for challenge tokens and flags. In production set `WEBMCP_SECRET`
 * to a long random value. The development fallback keeps the page usable
 * locally but must not be relied on for anything sensitive.
 */
function secret(): string {
  const value = process.env.WEBMCP_SECRET;
  if (value && value.length > 0) return value;
  if (!secret.warned) {
    console.warn('[webmcp] WEBMCP_SECRET is not set; using an insecure development default.');
    secret.warned = true;
  }
  return 'insecure-dev-webmcp-secret';
}
secret.warned = false as boolean;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url');
}

function hmac(input: string): string {
  return createHmac('sha256', secret()).update(input).digest('base64url');
}

/** Constant-time string comparison that tolerates length mismatches. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

interface ChallengePayload {
  type: string;
  params: ChallengeParams;
  exp: number;
}

export interface IssuedChallenge {
  token: string;
  type: string;
  title: string;
  prompt: string;
}

/**
 * Create a new signed challenge. Pass a `type` to request a specific kind,
 * otherwise one is picked at random. Returns `undefined` for an unknown type.
 */
export function createChallenge(type?: string): IssuedChallenge | undefined {
  const definition = type ? getChallenge(type) : pickRandomChallenge();
  if (!definition) return undefined;

  const params = definition.generate();
  const payload: ChallengePayload = {
    type: definition.type,
    params,
    exp: Date.now() + CHALLENGE_TTL_MS,
  };
  const body = base64url(JSON.stringify(payload));
  const token = `${body}.${hmac(body)}`;

  return {
    token,
    type: definition.type,
    title: definition.title,
    prompt: definition.promptFor(params),
  };
}

function decodeToken(token: string): ChallengePayload | undefined {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return undefined;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, hmac(body))) return undefined;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as ChallengePayload;
    if (typeof payload.exp !== 'number' || Date.now() > payload.exp) return undefined;
    if (typeof payload.type !== 'string') return undefined;
    return payload;
  } catch {
    return undefined;
  }
}

export type SolveOutcome =
  | { status: 'invalid_token' }
  | { status: 'incorrect' }
  | { status: 'correct'; flag: string; type: string };

/** Verify a submitted answer for a challenge token. */
export function solveChallenge(token: string, answer: string): SolveOutcome {
  const payload = decodeToken(token);
  if (!payload) return { status: 'invalid_token' };

  const definition = getChallenge(payload.type);
  if (!definition) return { status: 'invalid_token' };

  if (!definition.verify(payload.params, answer)) {
    return { status: 'incorrect' };
  }
  return { status: 'correct', flag: flagFor(payload.type), type: payload.type };
}

/** Deterministic flag for a challenge type. Never exposed unless a solve succeeds. */
export function flagFor(type: string): string {
  return `FLAG{${hmac(`flag:${type}`)}}`;
}

/** Verify a flag submitted by a human. Stateless — recomputes every known flag. */
export function verifyFlag(flag: string): { valid: boolean; type?: string } {
  const candidate = flag.trim();
  for (const definition of listChallenges()) {
    if (safeEqual(candidate, flagFor(definition.type))) {
      return { valid: true, type: definition.type };
    }
  }
  return { valid: false };
}
