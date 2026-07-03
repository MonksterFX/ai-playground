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
] as const;

const pagesByPath = new Map(testPages.map((page) => [page.path, page]));

/** Look up a registered test page by its exact route path. */
export function findTestPageByPath(path: string): TestPage | undefined {
  return pagesByPath.get(path);
}
