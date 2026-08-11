import type { APIRoute } from 'astro';
import {
  getInviteCookieMaxAge,
  getInviteCookieName,
  isInviteGateEnabled,
  isInviteGateMisconfigured,
  isValidInviteCode,
  safeRedirectTarget,
} from '../../lib/invite';

export const POST: APIRoute = async ({ request, cookies, redirect, url }) => {
  if (!isInviteGateEnabled()) {
    return redirect('/', 303);
  }

  const data = await request.formData();
  const inviteCode = (data.get('inviteCode') ?? '').toString().trim();
  const next = safeRedirectTarget(data.get('next')?.toString() ?? null, '/');

  if (isInviteGateMisconfigured()) {
    return redirect('/invite?error=misconfigured', 303);
  }

  if (!isValidInviteCode(inviteCode)) {
    return redirect(`/invite?error=invalid&next=${encodeURIComponent(next)}`, 303);
  }

  cookies.set(getInviteCookieName(), inviteCode, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: url.protocol === 'https:',
    maxAge: getInviteCookieMaxAge(),
  });

  return redirect(next, 303);
};
