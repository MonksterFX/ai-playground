/**
 * External WebMCP tracking proxy.
 *
 * This script is intentionally decoupled from the page's WebMCP tool
 * definitions. It wraps (proxies) the `document.modelContext` object so that
 * every tool registration and invocation is observed and beaconed to the
 * backend, without the tool code needing to know anything about tracking.
 *
 * Usage (from the page, after the WebMCP polyfill has initialized). Because
 * this file lives in `/public`, it must be referenced via an HTML tag rather
 * than imported from source (Vite's dev server blocks importing public files).
 * Load it as a module script; it also exposes `installTracking` on `window`:
 *   <script type="module" src="/webmcp-tracker.js"></script>
 *   window.installWebmcpTracking();
 *   // ...then register your tools as usual...
 *
 * Privacy: only the tool name, phase, success flag, duration, and a truncated
 * error message are sent. Tool arguments and results (which may contain the
 * flag) are never transmitted.
 */

const TRACK_ENDPOINT = '/api/webmcp/track';
const INSTALLED_FLAG = '__webmcpTrackingInstalled';

function beacon(payload) {
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_ENDPOINT, new Blob([body], { type: 'application/json' }));
    } else {
      fetch(TRACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // Tracking must never break the page.
  }
}

/** Wrap a tool's `execute` so each invocation is timed and beaconed. */
function wrapExecute(tool) {
  if (!tool || typeof tool.execute !== 'function') return tool;
  const original = tool.execute;
  const name = String(tool.name ?? 'unknown');

  return {
    ...tool,
    async execute(args, client) {
      const start = performance.now();
      beacon({ tool: name, phase: 'call' });
      try {
        const result = await original.call(this, args, client);
        const isError = Boolean(result && result.isError);
        beacon({
          tool: name,
          phase: 'result',
          ok: !isError,
          durationMs: performance.now() - start,
        });
        return result;
      } catch (error) {
        beacon({
          tool: name,
          phase: 'result',
          ok: false,
          durationMs: performance.now() - start,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
  };
}

/**
 * Install tracking by proxying `document.modelContext`. Idempotent. Returns
 * `true` when tracking was installed, `false` if WebMCP was unavailable.
 */
export function installTracking() {
  const ctx = typeof document !== 'undefined' ? document.modelContext : undefined;
  if (!ctx || typeof ctx.registerTool !== 'function') return false;
  if (ctx[INSTALLED_FLAG]) return true;

  const proxy = new Proxy(ctx, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (prop === 'registerTool' && typeof value === 'function') {
        return function registerTool(tool, options) {
          beacon({ tool: String(tool?.name ?? 'unknown'), phase: 'register' });
          return value.call(target, wrapExecute(tool), options);
        };
      }

      if (prop === 'getTools' && typeof value === 'function') {
        return async function getTools(...args) {
          beacon({ tool: '*', phase: 'list' });
          return value.apply(target, args);
        };
      }

      return typeof value === 'function' ? value.bind(target) : value;
    },
  });

  Object.defineProperty(document, 'modelContext', {
    configurable: true,
    get() {
      return proxy;
    },
  });
  ctx[INSTALLED_FLAG] = true;
  return true;
}

// Expose on the global scope so the function is reachable when this module is
// loaded via a plain `<script type="module" src="/webmcp-tracker.js">` tag
// (public files can't be imported from source under Vite's dev server).
if (typeof window !== 'undefined') {
  window.installWebmcpTracking = installTracking;
}
