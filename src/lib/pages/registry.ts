/**
 * Source-of-truth manifest of public test pages.
 *
 * Add a new test page by:
 *   1. Adding an entry here.
 *   2. Creating the matching Astro page under `src/pages/tests/`.
 *
 * Runtime state (enabled/disabled) is stored in the `pages` table and seeded
 * from this manifest on startup.
 */
export interface TestPage {
  id: string;
  title: string;
  path: string;
  description: string;
  /**
   * How the router matches request paths to this page:
   * - `exact` (default): `url.pathname === path`.
   * - `prefix`: `url.pathname === path` or starts with `path + '/'`.
   *   Used for sections with dynamic child routes (e.g. product detail pages).
   */
  match?: 'exact' | 'prefix';
}

export const testPages: readonly TestPage[] = [
  {
    id: 'basic-navigation',
    title: 'Basic Navigation Test',
    path: '/tests/basic-navigation',
    description: 'Tests whether an agent can follow clear navigation links to a target.',
  },
  {
    id: 'simple-form',
    title: 'Simple Form Test',
    path: '/tests/simple-form',
    description: 'Tests whether an agent can complete and submit a simple accessible form.',
  },
  {
    id: 'button-interaction',
    title: 'Button Interaction Test',
    path: '/tests/button-interaction',
    description: 'Tests whether an agent can click buttons and understand state changes.',
  },
  {
    id: 'content-extraction',
    title: 'Content Extraction Test',
    path: '/tests/content-extraction',
    description: 'Tests whether an agent can find and extract specific structured information.',
  },
  {
    id: 'disabled-state',
    title: 'Disabled State Test',
    path: '/tests/disabled-state',
    description: 'Demonstrates disabled-page behavior; disable it from the admin area.',
  },
  {
    id: 'webmcp-challenge',
    title: 'WebMCP Challenge Test',
    path: '/tests/webmcp',
    description:
      'Exposes WebMCP tools (document.modelContext) for agents to fetch a challenge and earn a flag.',
  },
  {
    id: 'shop-plp',
    title: 'Demo Shop — Product List',
    path: '/shop',
    description: 'A fake multi-page shop landing / product listing page (PLP).',
  },
  {
    id: 'shop-pdp',
    title: 'Demo Shop — Product Detail',
    path: '/shop/products',
    description: 'Product detail pages (PDP) for the demo shop.',
    match: 'prefix',
  },
  {
    id: 'shop-cart',
    title: 'Demo Shop — Cart',
    path: '/shop/cart',
    description: 'Server-side shopping cart with quantity updates and removal.',
    match: 'prefix',
  },
  {
    id: 'shop-checkout',
    title: 'Demo Shop — Checkout',
    path: '/shop/checkout',
    description: 'Accessible checkout form with validation (no real payment).',
  },
  {
    id: 'shop-order',
    title: 'Demo Shop — Order Confirmation',
    path: '/shop/order-confirmation',
    description: 'Order confirmation page shown after a successful checkout.',
    match: 'prefix',
  },
] as const;

const pagesByPath = new Map(testPages.map((page) => [page.path, page]));

/** Look up a registered test page by its exact route path. */
export function findTestPageByPath(path: string): TestPage | undefined {
  return pagesByPath.get(path);
}

/**
 * Resolve the registered page that owns a given request pathname, honoring each
 * page's `match` strategy. Prefix pages (e.g. product detail pages) win over a
 * bare exact match only when the path is actually a child route.
 */
export function resolveTrackedPage(pathname: string): TestPage | undefined {
  const exact = pagesByPath.get(pathname);
  if (exact) return exact;

  for (const page of testPages) {
    if (page.match === 'prefix' && pathname.startsWith(page.path + '/')) {
      return page;
    }
  }
  return undefined;
}
