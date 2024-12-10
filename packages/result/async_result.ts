import type { AsyncMatch } from "./match.ts";
import { Result } from "./result.ts";

export type Awatable<T> = PromiseLike<T> | T;

/**
 * `AsyncResult`
 */
export class AsyncResult<T, E>
  implements PromiseLike<Result<T, E>>, AsyncMatch<[T, E]> {
  static none = Result.none;

  static ok<T extends void>(value?: T): AsyncResult<T, never>;
  static ok<T>(value: T): AsyncResult<T, never>;
  static ok<T>(value: T): AsyncResult<T, never> {
    return new AsyncResult(Promise.resolve(
      new Result<T, never>({
        success: true,
        value,
      }),
    ));
  }

  static err<E>(value: E): AsyncResult<never, E> {
    return new AsyncResult(Promise.resolve(
      new Result<never, E>({
        success: false,
        value,
      }),
    ));
  }

  /**
   * {@linkcode AsyncResult<T, E>} from `() => Promise<Result<T, E>>`
   *
   * @example
   * ```ts
   * import { assertInstanceOf } from "@std/assert";
   * import { Result } from "./result.ts";
   *
   * const asyncResult = AsyncResult.fromPromiseResult(async () => {
   *   return Result.ok(100);
   * });
   *
   * assertInstanceOf(asyncResult, AsyncResult);
   * ```
   */
  static fromPromiseResult<T, E>(
    promiseResult: () => Promise<Result<T, E>>,
  ): AsyncResult<T, E>;
  /**
   * {@linkcode AsyncResult<T, E>} from `Promise<Result<T, E>>`
   *
   * @example
   * ```ts
   * import { assertInstanceOf } from "@std/assert";
   * import { Result } from "./result.ts";
   *
   * const asyncResult = AsyncResult.fromPromiseResult(Promise.resolve(Result.ok(100)));
   *
   * assertInstanceOf(asyncResult, AsyncResult);
   * ```
   */
  static fromPromiseResult<T, E>(
    promiseResult: Promise<Result<T, E>>,
  ): AsyncResult<T, E>;
  static fromPromiseResult<T, E>(
    promiseResult: Promise<Result<T, E>> | (() => Promise<Result<T, E>>),
  ): AsyncResult<T, E> {
    if (typeof promiseResult === "function") {
      return new AsyncResult(promiseResult());
    } else {
      return new AsyncResult(promiseResult);
    }
  }

  constructor(
    public inner: PromiseLike<Result<T, E>>,
  ) {
  }

  /**
   * Returns `true` if the result is {@linkcode Ok}.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(-3);
   * assertEquals(await x.isOk(), true);
   *
   * const y: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await y.isOk(), false);
   * ```
   */
  async isOk(): Promise<boolean> {
    return (await this).isOk();
  }

  /**
   * Returns `true` if the result is {@linkcode Ok} and the value inside of it matches a predicate.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const asyncResultU: AsyncResult<number, string> = AsyncResult.ok(2);
   * assertEquals(await asyncResultU.isOkAnd((i) => i > 1), true);
   *
   * const asyncResultV: AsyncResult<number, string> = AsyncResult.ok(2);
   * assertEquals(await asyncResultV.isOkAnd((i) => i < 0), false);
   *
   * const asyncResultW: AsyncResult<number, string> = AsyncResult.err("hey");
   * assertEquals(await asyncResultW.isOkAnd((i) => i > 1), false);
   *
   * // Async function...
   * const asyncResultX: AsyncResult<number, string> = AsyncResult.ok(2);
   * assertEquals(await asyncResultX.isOkAnd(async (i) => i > 1), true);
   *
   * const asyncResultY: AsyncResult<number, string> = AsyncResult.ok(2);
   * assertEquals(await asyncResultY.isOkAnd(async (i) => i < 0), false);
   *
   * const asyncResultZ: AsyncResult<number, string> = AsyncResult.err("hey");
   * assertEquals(await asyncResultZ.isOkAnd(async (i) => i > 1), false);
   * ```
   */
  isOkAnd(f: (value: T) => Awatable<boolean>): Promise<boolean> {
    return this.match(
      (value) => f(value),
      () => false,
    );
  }

  /**
   * Returns `true` if the result is {@linkcode Err}.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(-3);
   * assertEquals(await x.isErr(), false);
   *
   * const y: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await y.isErr(), true);
   * ```
   */
  async isErr(): Promise<boolean> {
    return (await this).isErr();
  }

  /**
   * Returns `true` if the result is {@linkcode Err} and the value inside of it matches a predicate.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const asyncResultU: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await asyncResultU.isErrAnd((x) => x === "Some error message"), true);
   *
   * const asyncResultV: AsyncResult<number, string> = AsyncResult.err("Another error message");
   * assertEquals(await asyncResultV.isErrAnd((y) => y === "Some error message"), false);
   *
   * const asyncResultW: AsyncResult<number, string> = AsyncResult.ok(123);
   * assertEquals(await asyncResultW.isErrAnd((z) => z === "Some error message"), false);
   *
   * // Async function...
   * const asyncResultX: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await asyncResultX.isErrAnd(async (x) => x === "Some error message"), true);
   *
   * const asyncResultY: AsyncResult<number, string> = AsyncResult.err("Another error message");
   * assertEquals(await asyncResultY.isErrAnd(async (y) => y === "Some error message"), false);
   *
   * const asyncResultZ: AsyncResult<number, string> = AsyncResult.ok(123);
   * assertEquals(await asyncResultZ.isErrAnd(async (z) => z === "Some error message"), false);
   * ```
   */
  isErrAnd(f: (err: E) => Awatable<boolean>): Promise<boolean> {
    return this.match(
      () => false,
      (err) => f(err),
    );
  }

  /**
   * Convert from `AsyncResult<T, E>` to `Promise<T | null>`.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(100);
   * assertEquals(await x.ok() , 100);
   *
   * const y: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await y.ok() , null);
   * ```
   */
  ok(noneSymbol?: false): Promise<T | null>;
  /**
   * Convert from `AsyncResult<T, E>` to `Promise<T | typeof Result.none>`.
   *
   * If T is `null`, setting the argument `noneSymbol` to true will result in `Promise<T | typeof Result.none>`, making the distinction.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(100);
   * assertEquals(await x.ok(true) , 100);
   *
   * const z: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await z.ok(true) , AsyncResult.none);
   * ```
   */
  ok(noneSymbol: true): Promise<T | typeof AsyncResult["none"]>;
  async ok(noneSymbol?: boolean) {
    const result = await this;
    if (result.innerResult.success) {
      return result.innerResult.value;
    }

    if (noneSymbol) {
      return AsyncResult.none;
    } else {
      return null;
    }
  }

  /**
   * Convert from `AsyncResult<T, E>` to `Promise<E | null>`.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await x.err() , "Some error message");
   *
   * const y: AsyncResult<number, string> = AsyncResult.ok(100);
   * assertEquals(await y.err() , null);
   * ```
   */
  err(noneSymbol?: false): Promise<E | null>;
  /**
   * Convert from `AsyncResult<T, E>` to `Promise<E | typeof Result.none>`.
   *
   * If T is `null`, setting the argument `noneSymbol` to true will result in `Promise<E | typeof Result.none>`, making the distinction.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await x.err(true) , "Some error message");
   *
   * const z: AsyncResult<number, string> = AsyncResult.ok(100);
   * assertEquals(await z.err(true) , AsyncResult.none);
   * ```
   */
  err(noneSymbol: true): Promise<E | typeof AsyncResult["none"]>;
  async err(noneSymbol?: boolean) {
    const result = await this;
    if (!result.innerResult.success) {
      return result.innerResult.value;
    }

    if (noneSymbol) {
      return AsyncResult.none;
    } else {
      return null;
    }
  }

  /**
   * Maps a Result<T, E> to Result<U, E> by applying a function to a contained Ok value, leaving an Err value untouched.
   * This function can be used to compose the results of two functions.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(100);
   * assertEquals(await x.map((i) => i * 2).unwrap(), 200);
   *
   * const z: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertEquals(await z.map((i) => i * 2).unwrapErr(), "Some error message");
   * ```
   */
  map<U>(op: (value: T) => U): AsyncResult<U, E> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).map(op),
    );
  }

  async mapOr<U>(defaultValue: U, f: (value: T) => U): Promise<U> {
    return (await this).mapOr(defaultValue, f);
  }

  async mapOrElse<U>(
    defaultValue: (error: E) => U,
    f: (value: T) => U,
  ): Promise<U> {
    return (await this).mapOrElse(defaultValue, f);
  }

  mapErr<F>(op: (value: E) => F): AsyncResult<T, F> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).mapErr(op),
    );
  }

  inspect(f: (value: T) => void): AsyncResult<T, E> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).inspect(f),
    );
  }

  inspectErr(f: (error: E) => void): AsyncResult<T, E> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).inspectErr(f),
    );
  }

  and<U>(res: Result<U, E> | AsyncResult<U, E>): AsyncResult<U, E> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).and(await res),
    );
  }

  andThen<U>(
    op: (value: T) => Awatable<Result<U, E>> | AsyncResult<U, E>,
  ): AsyncResult<U, E> {
    return AsyncResult.fromPromiseResult(
      this.match(
        (value) => op(value),
        () => this as unknown as Result<U, E>,
      ),
    );
  }

  or<F>(res: Result<T, F> | AsyncResult<T, F>): AsyncResult<T, F> {
    return AsyncResult.fromPromiseResult(
      async () => (await this).or(await res),
    );
  }

  orElse<F>(
    op: (error: E) => Result<T, F> | AsyncResult<T, F>,
  ): AsyncResult<T, F> {
    return AsyncResult.fromPromiseResult(
      this.match(
        () => this as unknown as Result<T, F>,
        (error) => op(error),
      ),
    );
  }

  /**
   * Returns the contained {@linkcode Ok} value.
   * Because this function throw {@linkcode Panic}, its use is generally discouraged. Instead, prefer to use {@linkcode Result.prototype.match} and handle the Err case explicitly, or call {@linkcode Result.prototype.unwrapOr}, {@linkcode Result.prototype.unwrapOrElse}.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(2);
   * assertEquals(await x.unwrap(), 2);
   * ```
   *
   * @example
   * ```ts
   * import { assertRejects } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * assertRejects(async () => await x.unwrap());
   * ```
   *
   * @throws {Panic} if the value is an {@linkcode Err}, with a panic message provided by the Err’s value.
   */
  async unwrap(): Promise<T> {
    return (await this).unwrap();
  }

  async unwrapErr(): Promise<E> {
    return (await this).unwrapErr();
  }

  async unwrapOr(defaultValue: T): Promise<T> {
    return (await this).unwrapOr(defaultValue);
  }

  unwrapOrElse(defaultValue: () => Awatable<T>): Promise<T> {
    return this.match(
      (value) => value,
      () => defaultValue(),
    );
  }

  async orThrow(): Promise<T> {
    return (await this).orThrow();
  }

  /**
   * Methods that can be used similarly to the Match statement, a Rust expression.
   *
   * @example
   * ```ts
   * import { assertEquals } from "@std/assert";
   *
   * const x: AsyncResult<number, string> = AsyncResult.ok(123);
   * const number = await x.match(
   *   (x) => x,
   *   (_) => 0
   * );
   *
   * assertEquals(number, 123);
   *
   * const y: AsyncResult<number, string> = AsyncResult.ok(123);
   * const string = await y.match(
   *   (y) => "expected error. but got " + y,
   *   (error) => error
   * );
   *
   * assertEquals(string, "expected error. but got 123");
   *
   * const z: AsyncResult<number, string> = AsyncResult.err("Some error message");
   * const error = await z.match(
   *   (z) => "expected error. but got " + z,
   *   (error) => error
   * );
   *
   * assertEquals(error, "Some error message");
   * ```
   */
  async match<A extends Awatable<unknown>>(
    ok: (value: T) => A,
    err: (value: E) => A,
  ): Promise<Awaited<A>> {
    return await (await this).match(ok, err);
  }

  then<TResult1 = Result<T, E>, TResult2 = never>(
    onfulfilled?:
      | ((value: Result<T, E>) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    return this.inner.then(onfulfilled, onrejected);
  }
}
