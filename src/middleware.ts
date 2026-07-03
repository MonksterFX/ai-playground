import './lib/env';
import { randomUUID } from 'node:crypto';
import type { APIContext } from 'astro';
import { defineMiddleware } from 'astro:middleware';
import { unauthorizedResponse, verifyAdminAuth } from './lib/auth';
import { getPageByPath, recordEvent } from './lib/db/repo';
import { ensurePagesSeeded } from './lib/db/seed';
import { findTestPageByPath } from './lib/pages/registry';
import { detectAgentHint } from './lib/tracking/agent';
import { filterHeaders } from './lib/tracking/headers';

const TRACK_IP = (process.env.TRACK_IP ?? 'true').toLowerCase() !== 'false';
const DISABLED_STATUS = process.env.DISABLED_STATUS === '404' ? 404 : 410;

/** Tracking must never break a request. */
function safeTrack(fn: () => void): void {
  try {
    fn();
  } catch (error) {
    console.error('[tracking] failed to record event:', error);
  }
}

function getClientIp(context: APIContext): string | null {
  const forwarded = context.request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() ?? null;
  try {
    return context.clientAddress ?? null;
  } catch {
    return null;
  }
}

function disabledResponse(title: string): Response {
  const label = DISABLED_STATUS === 404 ? 'Not Found' : 'Gone';
  const body = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${DISABLED_STATUS} ${label} — ${title}</title>
  </head>
  <body>
    <main>
      <h1>${DISABLED_STATUS} ${label}</h1>
      <p>The test page &ldquo;${title}&rdquo; is currently disabled.</p>
      <p><a href="/">Return to the Agent Playground home page.</a></p>
    </main>
  </body>
</html>`;
  return new Response(body, {
    status: DISABLED_STATUS,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  ensurePagesSeeded();

  const { request, url } = context;
  const userAgent = request.headers.get('user-agent');
  const requestId = request.headers.get('x-request-id') ?? randomUUID();
  const start = performance.now();

  context.locals.requestId = requestId;
  context.locals.isAdmin = false;

  // --- Admin Basic Auth gate ---
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    const { result, username } = verifyAdminAuth(request.headers.get('authorization'));

    if (result === 'misconfigured') {
      return new Response(
        'Admin credentials are not configured. Set ADMIN_USERNAME and ADMIN_PASSWORD.',
        { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
      );
    }

    if (result !== 'ok') {
      safeTrack(() =>
        recordEvent({
          eventType: 'admin_login_attempt',
          path: url.pathname,
          url: url.href,
          method: request.method,
          statusCode: 401,
          responseTimeMs: Math.round(performance.now() - start),
          userAgent,
          agentHint: detectAgentHint(userAgent),
          ipAddress: TRACK_IP ? getClientIp(context) : null,
          requestId,
          // Never store the submitted password. Username is only recorded on an
          // invalid attempt to aid debugging.
          metadata: { reason: result, attemptedUsername: result === 'invalid' ? username : null },
        }),
      );
      return unauthorizedResponse();
    }

    context.locals.isAdmin = true;
  }

  // --- Disabled test page gate ---
  const testPage = findTestPageByPath(url.pathname);
  if (testPage) {
    const pageRow = getPageByPath(url.pathname);
    if (pageRow && !pageRow.enabled) {
      safeTrack(() =>
        recordEvent({
          eventType: 'page_view',
          pageId: testPage.id,
          path: url.pathname,
          url: url.href,
          method: request.method,
          statusCode: DISABLED_STATUS,
          responseTimeMs: Math.round(performance.now() - start),
          userAgent,
          referrer: request.headers.get('referer'),
          agentHint: detectAgentHint(userAgent),
          ipAddress: TRACK_IP ? getClientIp(context) : null,
          requestId,
          headers: filterHeaders(request.headers),
          metadata: { disabled: true },
        }),
      );
      return disabledResponse(testPage.title);
    }
  }

  // --- Continue to the route ---
  const response = await next();
  const responseTimeMs = Math.round(performance.now() - start);

  // --- Track public test page requests ---
  if (testPage) {
    safeTrack(() =>
      recordEvent({
        eventType: 'page_view',
        pageId: testPage.id,
        path: url.pathname,
        url: url.href,
        method: request.method,
        statusCode: response.status,
        responseTimeMs,
        userAgent,
        referrer: request.headers.get('referer'),
        agentHint: detectAgentHint(userAgent),
        ipAddress: TRACK_IP ? getClientIp(context) : null,
        requestId,
        headers: filterHeaders(request.headers),
      }),
    );
  }

  response.headers.set('x-request-id', requestId);
  return response;
});
