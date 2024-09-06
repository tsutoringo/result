import type { TurnstileAPIErrorCode } from "./types.ts";

/**
 * Turnstile error
 */
export class TurnstileError extends Error {
  constructor(public codes: TurnstileAPIErrorCode[]) {
    super(
      "Cloudflare Turnstile returned error codes: '" + codes.join("', '") + "'",
    );
  }
}
