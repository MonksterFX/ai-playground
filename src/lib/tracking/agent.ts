/**
 * Lightweight agent hint detection from the User-Agent string.
 *
 * This is intentionally simple for v0.1: it recognizes a handful of well-known
 * AI/crawler user agents and headless browsers. Improved detection is planned
 * for a later version.
 */

interface AgentSignature {
  hint: string;
  test: RegExp;
}

const SIGNATURES: AgentSignature[] = [
  { hint: 'gptbot', test: /GPTBot/i },
  { hint: 'chatgpt-user', test: /ChatGPT-User/i },
  { hint: 'oai-searchbot', test: /OAI-SearchBot/i },
  { hint: 'claudebot', test: /ClaudeBot|Claude-Web|anthropic-ai/i },
  { hint: 'perplexitybot', test: /PerplexityBot/i },
  { hint: 'google-extended', test: /Google-Extended/i },
  { hint: 'googlebot', test: /Googlebot/i },
  { hint: 'bingbot', test: /bingbot/i },
  { hint: 'applebot', test: /Applebot/i },
  { hint: 'bytespider', test: /Bytespider/i },
  { hint: 'ccbot', test: /CCBot/i },
  { hint: 'headless', test: /HeadlessChrome|Playwright|Puppeteer|Selenium|PhantomJS/i },
  { hint: 'bot', test: /bot|crawler|spider|slurp/i },
];

/** Return a short agent hint, or null if none is detected. */
export function detectAgentHint(userAgent: string | null | undefined): string | null {
  if (!userAgent) return null;
  for (const signature of SIGNATURES) {
    if (signature.test.test(userAgent)) return signature.hint;
  }
  return null;
}
