import type { ControlFlow } from "./controlFlow.ts";
import type { Match } from "./match.ts";
import type { Try } from "./try.ts";

/**
 * The type representing success.
 */
export type Ok<T> = {
  success: true;
  value: T;
};

/**
 * The type representing failure.
 */
export type Err<E> = {
  success: false;
  value: E;
};

/**
 * Type used in {@linkcode Result}.
 */
export type ResultInner<T, E> = Ok<T> | Err<E>;

/**
 * The error type that is thrown when {@linkcode Result.prototype.unwrap} is called.
 */
export class Panic extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
  }
}

/**
 * `Result` is a type that represents either success ({@linkcode Ok}) or failure ({@linkcode Err}).
 * See the module documentaion for details.
 */
export class Result<T, E> implements Match<[T, E]>, Try<Result<T, E>, T> {
  static readonly none: unique symbol = Symbol("none");

  static ok<T extends void, E>(value?: T): Result<T, E>;
  static ok<T, E>(value: T): Result<T, E>;
  static ok<T, E>(value: T): Result<T, E> {
    return new Result<T, E>({
      success: true,
      value,
    });
  }

  static err<T, E>(value: E): Result<T, E> {
    return new Result<T, E>({
      success: false,
      value,
    });
  }

  constructor(
    public innerResult: ResultInner<T, E>,
  ) {
  }

  /**
   * Returns `true` if the result is {@linkcode Ok}.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(-3);
   * assertEquals(x.isOk(), true);
   *
   * const y: Result<number, string> = Result.err("Some error message");
   * assertEquals(y.isOk(), false);
   * ```
   */
  isOk(): boolean {
    return this.innerResult.success;
  }

  /**
   * Returns `true` if the result is {@linkcode Ok} and the value inside of it matches a predicate.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(2);
   * assertEquals(x.isOkAnd((x) => x > 1), true);
   *
   * const y: Result<number, string> = Result.ok(2);
   * assertEquals(y.isOkAnd((y) => y > 0), false);
   *
   * const z: Result<number, string> = Result.err("hey");
   * assertEquals(z.isOkAnd((z) => z > 1), false);
   * ```
   */
  isOkAnd(f: (value: T) => boolean): boolean {
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
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(-3);
   * assertEquals(x.isErr(), false);
   *
   * const y: Result<number, string> = Result.err("Some error message");
   * assertEquals(y.isErr(), true);
   * ```
   */
  isErr(): boolean {
    return !this.innerResult.success;
  }

  /**
   * Returns `true` if the result is {@linkcode Err} and the value inside of it matches a predicate.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.err("Some error message");
   * assertEquals(x.isErrAnd((x) => x === "Some error message"), true);
   *
   * const y: Result<number, string> = Result.err("Another error message");
   * assertEquals(y.isErrAnd((y) => y === "Some error message"), false);
   *
   * const z: Result<number, string> = Result.ok(123);
   * assertEquals(z.isErrAnd((z) => z === "Some error message"), false);
   * ```
   */
  isErrAnd(f: (err: E) => boolean): boolean {
    return this.match(
      () => false,
      (err) => f(err),
    );
  }

  /**
   * Convert from `Result<T, E>` to `T | null`.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(100);
   * assertEquals(x.ok() , 100);
   *
   * const y: Result<number, string> = Result.err("Some error message");
   * assertEquals(y.ok() , null);
   * ```
   */
  ok(noneSymbol?: false): T | null;
  /**
   * Convert from `Result<T, E>` to `T | typeof Result.none`.
   *
   * If T is `null`, setting the argument `noneSymbol` to true will result in `T | typeof Result.none`, making the distinction.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(100);
   * assertEquals(x.ok(true) , 100);
   *
   * const z: Result<number, string> = Result.err("Some error message");
   * assertEquals(z.ok(true) , Result.none);
   * ```
   */
  ok(noneSymbol: true): T | typeof Result["none"];
  ok(noneSymbol?: boolean) {
    if (this.innerResult.success) {
      return this.innerResult.value;
    }

    if (noneSymbol) {
      return Result.none;
    } else {
      return null;
    }
  }

  /**
   * Convert from `Result<T, E>` to `E | null`.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.err("Some error message");
   * assertEquals(x.err() , "Some error message");
   *
   * const y: Result<number, string> = Result.ok(100);
   * assertEquals(y.err() , null);
   * ```
   */
  err(noneSymbol?: false): E | null;
  /**
   * Convert from `Result<T, E>` to `E | typeof Result.none`.
   *
   * If T is `null`, setting the argument `noneSymbol` to true will result in `E | typeof Result.none`, making the distinction.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.err("Some error message");
   * assertEquals(x.err(true) , "Some error message");
   *
   * const z: Result<number, string> = Result.ok(100);
   * assertEquals(z.err(true) , Result.none);
   * ```
   */
  err(noneSymbol: true): E | typeof Result["none"];
  err(noneSymbol?: boolean) {
    if (!this.innerResult.success) {
      return this.innerResult.value;
    }

    if (noneSymbol) {
      return Result.none;
    } else {
      return null;
    }
  }

  map<U>(op: (value: T) => U): Result<U, E> {
    return this.match<Result<U, E>>(
      (value) => Result.ok(op(value)),
      () => this as unknown as Result<U, E>,
    );
  }

  mapOr<U>(defaultValue: U, f: (value: T) => U): U {
    return this.match(
      (value) => f(value),
      () => defaultValue,
    );
  }

  mapOrElse<U>(defaultValue: (error: E) => U, f: (value: T) => U): U {
    return this.match(
      (value) => f(value),
      (error) => defaultValue(error),
    );
  }

  mapErr<F>(op: (value: E) => F): Result<T, F> {
    return this.match<Result<T, F>>(
      () => this as unknown as Result<T, F>,
      (error) => Result.err(op(error)),
    );
  }

  inspect(f: (value: T) => void): Result<T, E> {
    if (this.innerResult.success) {
      f(this.innerResult.value);
    }

    return this;
  }

  inspectErr(f: (error: E) => void): Result<T, E> {
    if (!this.innerResult.success) {
      f(this.innerResult.value);
    }

    return this;
  }

  and<U>(res: Result<U, E>): Result<U, E> {
    return this.match(
      () => res,
      () => this as unknown as Result<U, E>,
    );
  }

  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E> {
    return this.match(
      (value) => op(value),
      () => this as unknown as Result<U, E>,
    );
  }

  or<F>(res: Result<T, F>): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      () => res,
    );
  }

  orElse<F>(op: (error: E) => Result<T, F>): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      (error) => op(error),
    );
  }

  /**
   * Returns the contained {@linkcode Ok} value.
   * Because this function throw {@linkcode Panic}, its use is generally discouraged. Instead, prefer to use {@linkcode Result.prototype.match} and handle the Err case explicitly, or call {@linkcode Result.prototype.unwrapOr}, {@linkcode Result.prototype.unwrapOrElse}.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(2);
   * assertEquals(x.unwrap(), 2);
   * ```
   *
   * ```ts
   * import { assertThrows } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.err("Some error message");
   * assertThrows(() => x.unwrap());
   * ```
   *
   * @throws {Panic} if the value is an {@linkcode Err}, with a panic message provided by the Err’s value.
   */
  unwrap(): T {
    return this.match(
      (value) => value,
      (error) => {
        throw new Panic("called `Result.unwrap()` on an `Err`", error);
      },
    );
  }

  unwrapOr(defaultValue: T): T {
    return this.match(
      (value) => value,
      () => defaultValue,
    );
  }

  unwrapOrElse(defaultValue: () => T): T {
    return this.match(
      (value) => value,
      () => defaultValue(),
    );
  }

  orThrow(): T {
    return this.match(
      (value) => value,
      (error) => {
        throw error;
      },
    );
  }

  /**
   * Methods that can be used similarly to the Match statement, a Rust expression.
   *
   * @example
   * ```ts
   * import { assertEquals } from "jsr:@std/assert@1";
   *
   * const x: Result<number, string> = Result.ok(123);
   * const number = x.match(
   *   (x) => x,
   *   (_) => 0
   * );
   *
   * assertEquals(number, 123);
   *
   * const y: Result<number, string> = Result.ok(123);
   * const string = y.match(
   *   (y) => "expected error. but got " + y,
   *   (error) => error
   * );
   *
   * assertEquals(string, "expected error. but got 123");
   *
   * const z: Result<number, string> = Result.err("Some error message");
   * const error = z.match(
   *   (z) => "expected error. but got " + z,
   *   (error) => error
   * );
   *
   * assertEquals(error, "Some error message");
   * ```
   */
  match<A>(ok: (value: T) => A, err: (value: E) => A): A {
    if (this.innerResult.success) {
      return ok(this.innerResult.value);
    } else {
      return err(this.innerResult.value);
    }
  }

  async awaited(): Promise<Result<Awaited<T>, Awaited<E>>> {
    if (this.innerResult.success) {
      if (this.innerResult.value instanceof Promise) {
        return Result.ok(await this.innerResult.value);
      } else {
        return Result.ok(this.innerResult.value as Awaited<T>);
      }
    } else {
      if (this.innerResult.value instanceof Promise) {
        return Result.err(await this.innerResult.value);
      } else {
        return Result.err(this.innerResult.value as Awaited<E>);
      }
    }
  }

  /**
   * Enables processing as close as possible to Rust's `?` operator.
   * @example
   * ```ts
   * const withResult = (): Result<number, string> => {
   *    return Result.ok(2);
   * }
   *
   * const func = (): Result<number, string> => {
   *   const result = withResult().branch();
   *
   *   if (result.isBreak) return result.value;
   *
   *   // result.value is number
   * }
   *
   * func();
   *
   * ```
   */
  branch(): ControlFlow<Result<never, E>, T> {
    return this.match<ControlFlow<Result<never, E>, T>>(
      (value) => ({ isBreak: false, value: value }),
      (_) => ({ isBreak: true, value: this as unknown as Result<never, E> }),
    );
  }
}

/**
 * Alias of {@linkcode Result.ok}.
 */
export const ok = Result.ok;
/**
 * Alias of {@linkcode Result.err}.
 */
export const err = Result.err;
