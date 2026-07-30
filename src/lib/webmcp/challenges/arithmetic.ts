import type { ChallengeParams, ChallengeDefinition } from './types';

/**
 * Challenge: evaluate a simple two-operand integer arithmetic expression.
 *
 * The expected answer is derived purely from the parameters, so the server can
 * verify a submission without any stored state.
 */

interface ArithmeticParams extends ChallengeParams {
  a: number;
  b: number;
  op: '+' | '-' | '*';
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function expected(params: ArithmeticParams): number {
  switch (params.op) {
    case '+':
      return params.a + params.b;
    case '-':
      return params.a - params.b;
    case '*':
      return params.a * params.b;
  }
}

export const arithmeticChallenge: ChallengeDefinition<ArithmeticParams> = {
  type: 'arithmetic',
  title: 'Arithmetic',
  description: 'Evaluate a short arithmetic expression and submit the numeric result.',

  generate(): ArithmeticParams {
    const ops: ArithmeticParams['op'][] = ['+', '-', '*'];
    const op = ops[randomInt(0, ops.length - 1)]!;
    // Keep multiplication operands small so answers stay readable.
    const a = op === '*' ? randomInt(2, 12) : randomInt(10, 99);
    const b = op === '*' ? randomInt(2, 12) : randomInt(10, 99);
    return { a, b, op };
  },

  promptFor(params: ArithmeticParams): string {
    return `What is ${params.a} ${params.op} ${params.b}? Reply with the integer result only.`;
  },

  verify(params: ArithmeticParams, answer: string): boolean {
    const trimmed = answer.trim();
    if (!/^-?\d+$/.test(trimmed)) return false;
    return Number.parseInt(trimmed, 10) === expected(params);
  },
};
