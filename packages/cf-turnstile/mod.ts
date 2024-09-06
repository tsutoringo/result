/**
 * @module
 * 
 * # @result/cf-turnstile
 * [![JSR](https://jsr.io/badges/@result/cf-turnstile)](https://jsr.io/@result/cf-turnstile)
 * [![JSR](https://jsr.io/badges/@result/cf-turnstile/score)](https://jsr.io/@result/cf-turnstile)
 *
 * @tsutoringo/cf-turnstile is [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) API Wrapper
 * 
 *
 * ## Example
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
 */

export * from "./validate.ts";
export * from "./error.ts";
export * from "./types.ts";
