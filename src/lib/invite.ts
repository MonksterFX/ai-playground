import { timingSafeEqual } from 'node:crypto';

const INVITE_COOKIE = 'site_invite_code';
const INVITE_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf-8');
  const bufB = Buffer.from(b, 'utf-8');
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function parseBoolean(value: string | undefined, fallback: boolean): boolean {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on') {
    return true;
  }
  if (normalized === 'false' || normalized === '0' || normalized === 'no' || normalized === 'off') {
    return false;
  }
  return fallback;
}

export function isInviteGateEnabled(): boolean {
  return parseBoolean(process.env.INVITE_GATE_ENABLED, false);
}

export function getInviteCodes(): string[] {
  const raw = process.env.INVITE_CODES ?? '';
  return raw
    .split(',')
    .map((code) => code.trim())
    .filter((code) => code.length > 0);
}

export function isInviteGateMisconfigured(): boolean {
  return isInviteGateEnabled() && getInviteCodes().length === 0;
}

export function isValidInviteCode(code: string | null | undefined): boolean {
  if (!code) return false;
  const normalized = code.trim();
  if (!normalized) return false;
  return getInviteCodes().some((candidate) => safeEqual(candidate, normalized));
}

export function isInvitePublicPath(pathname: string): boolean {
  return (
    pathname === '/invite' ||
    pathname.startsWith('/invite/') ||
    pathname.startsWith('/_astro/') ||
    pathname === '/favicon.ico' ||
    pathname === '/favicon.png' ||
    pathname === '/logo.png'
  );
}

export function getInviteCookieName(): string {
  return INVITE_COOKIE;
}

export function getInviteCookieMaxAge(): number {
  return INVITE_COOKIE_MAX_AGE;
}

/** Only allow same-site relative redirect targets. */
export function safeRedirectTarget(target: string | null, fallback: string): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return fallback;
}
