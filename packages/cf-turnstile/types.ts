/**
 * Cloudflare respond structure.
 */
export type TurnstileAPISuccessResponse = {
  success: true;
  "challenge_ts": string;
  "hostname": string;
  "error-codes": TurnstileAPIErrorCode[];
  "action": string;
  "cdata": string;
};

/**
 * Cloudflare respond error structure.
 */
export type TurnstileAPIErrorResponse = {
  success: false;
  "error-codes": TurnstileAPIErrorCode[];
};

/**
 * @see {@link https://developers.cloudflare.com/turnstile/get-started/server-side-validation/#error-codes}
 */
export type TurnstileAPIErrorCode =
  | "missing-input-secret"
  | "invalid-input-secret"
  | "missing-input-response"
  | "invalid-input-response"
  | "bad-request"
  | "timeout-or-duplicate"
  | "internal-error";

export type TunstileAPIResponse =
  | TurnstileAPISuccessResponse
  | TurnstileAPIErrorResponse;
