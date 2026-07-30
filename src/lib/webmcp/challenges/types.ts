/**
 * Abstract challenge contract for the WebMCP challenge page.
 *
 * A challenge is a small, self-contained puzzle that an agent must solve to
 * earn a flag. Adding a new kind of challenge is intentionally cheap: create a
 * new module that implements {@link ChallengeDefinition} and register it in
 * `./index.ts`. The token format, API routes, tools, and flag logic are all
 * challenge-agnostic and require no changes.
 */

/** JSON-serializable per-instance challenge parameters. */
export type ChallengeParams = Record<string, unknown>;

export interface ChallengeDefinition<TParams extends ChallengeParams = ChallengeParams> {
  /**
   * Stable, unique identifier for this challenge kind (e.g. `arithmetic`).
   * Stored inside the signed challenge token and used to derive the flag, so it
   * must never change once released.
   */
  readonly type: string;

  /** Human-readable name, shown in the UI and tool descriptions. */
  readonly title: string;

  /** Short description of what the solver has to do. */
  readonly description: string;

  /** Produce a fresh, randomized instance of the challenge. */
  generate(): TParams;

  /** Render the human-facing prompt for a given instance. */
  promptFor(params: TParams): string;

  /**
   * Validate a submitted answer against the instance parameters. Must be a
   * pure function of `params` and `answer` (no I/O) so verification stays
   * stateless and reproducible on the server.
   */
  verify(params: TParams, answer: string): boolean;
}
