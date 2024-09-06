import { TurnstileError } from "./error.ts";
import type { TunstileAPIResponse } from "./types.ts";
import { Result } from "jsr:@result/result@1.0";

type CfTurnstileResult<T> = Result<T, TurnstileError>;

/**
 * {@linkcode CfTurnstile.prototype.validate}
 */
export class CfTurnstile {
  static ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  static withAlwaysPassesToken(): CfTurnstile {
    return new CfTurnstile("1x0000000000000000000000000000000AA");
  }

  static withAlwaysFailsToken(): CfTurnstile {
    return new CfTurnstile("2x0000000000000000000000000000000AA");
  }

  static withAlreadySpentErrorToken(): CfTurnstile {
    return new CfTurnstile("3x0000000000000000000000000000000AA");
  }

  /**
   * @param secretKey Secret key provided by cloudflare dashboard
   */
  constructor(
    public secretKey: string,
  ) {
  }

  /**
   * @example
   * ```ts
   * // This is the demo secret key. In production, we recommend
   * // you store your secret key(s) safely.
   * const SECRET_KEY = '1x0000000000000000000000000000000AA';
   *
   * async function handlePost(request) {
   *   const body = await request.formData();
   *   // Turnstile injects a token in "cf-turnstile-response".
   *   const token = body.get('cf-turnstile-response');
   *   const ip = request.headers.get('CF-Connecting-IP');
   *
   *   const result = await new CfTurnstile(SECRET_KEY).validate(token, ip):
   *
   *   result.match(
   *     (response) => {
   *       // Your code...
   *     },
   *     (error) => {
   *       // Error handling...
   *     }
   *   );
   *
   *   // Or unwrap
   *
   *   const response = result.unwrap();
   * }
   * ```
   * @param token
   * @param ip
   * @param idempotencyKey
   * @returns
   */
  async validate(
    token: string,
    ip?: string,
    idempotencyKey?: string,
  ): Promise<CfTurnstileResult<TunstileAPIResponse>> {
    const formData = new FormData();

    formData.append("secret", this.secretKey);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    if (idempotencyKey) formData.append("idempotency_key", idempotencyKey);

    const request = new Request(CfTurnstile.ENDPOINT, {
      body: formData,
      method: "POST",
    });

    const response = await this.req(request);

    if (response.success) {
      return Result.ok(response);
    } else {
      return Result.err(new TurnstileError(response["error-codes"]));
    }
  }

  async req(request: Request): Promise<TunstileAPIResponse> {
    const response = await fetch(request);

    const result = await response.json() as TunstileAPIResponse;

    return result;
  }
}
