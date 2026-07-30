/**
 * Registry of available WebMCP challenges.
 *
 * To add a new challenge kind:
 *   1. Create a module under this folder implementing `ChallengeDefinition`.
 *   2. Import it here and pass it to `register()`.
 * Nothing else in the pipeline (tokens, routes, tools, flags) needs to change.
 */
import { arithmeticChallenge } from './arithmetic';
import type { ChallengeDefinition } from './types';

const registry = new Map<string, ChallengeDefinition>();

function register(definition: ChallengeDefinition): void {
  if (registry.has(definition.type)) {
    throw new Error(`Duplicate challenge type registered: ${definition.type}`);
  }
  registry.set(definition.type, definition);
}

// --- Registered challenges --------------------------------------------------
register(arithmeticChallenge);

/** Look up a challenge definition by its stable type id. */
export function getChallenge(type: string): ChallengeDefinition | undefined {
  return registry.get(type);
}

/** All registered challenge definitions. */
export function listChallenges(): ChallengeDefinition[] {
  return [...registry.values()];
}

/** Pick a random registered challenge. */
export function pickRandomChallenge(): ChallengeDefinition {
  const all = listChallenges();
  if (all.length === 0) throw new Error('No challenges registered.');
  return all[Math.floor(Math.random() * all.length)]!;
}

export type { ChallengeDefinition, ChallengeParams } from './types';
