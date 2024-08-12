import type { Match } from './match.ts';

export type Ok<T> = {
  success: true;
  value: T;
};

export type Err<E> = {
  success: false;
  value: E;
};

export type ResultInner<T, E> = Ok<T> | Err<E>;

export class Panic extends Error {
  constructor(message: string, cause: unknown) {
    super(message, { cause });
  }
}

export class Result<T, E> implements Match<[T, E]> {
  static readonly none: unique symbol = Symbol('none');

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
   * Returns `true` if the result is {@link Ok}.
   *
   * # Examples
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.ok(-3);
   * assertEquals(x.is_ok(), true);
   *
   * const y: Result<number, string> = Result.err('Some error message');
   * assertEquals(y.is_ok(), false);
   * ```
   */
  isOk(): boolean {
    return this.innerResult.success;
  }

  /**
   * Returns `true` if the result is {@link Ok} and the value inside of it matches a predicate.
   *
   * # Examples
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.ok(2);
   * assertEquals(x.is_ok_and((x) => x > 1), true);
   *
   * const y: Result<number, string> = Result.ok(2);
   * assertEquals(y.is_ok_and((y) => y > 0), false);
   *
   * const z: Result<number, string> = Result.err('hey');
   * assertEquals(z.is_ok_and((z) => z > 1), false);
   * ```
   */
  isOkAnd(f: (value: T) => boolean): boolean {
    return this.match(
      (value) => f(value),
      () => false,
    );
  }

  /**
   * Returns `true` if the result is {@link Err}.
   *
   * # Examples
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.ok(-3);
   * assertEquals(x.is_err(), false);
   *
   * const y: Result<number, string> = Result.err('Some error message');
   * assertEquals(y.is_err(), true);
   * ```
   */
  isErr(): boolean {
    return !this.innerResult.success;
  }

  /**
   * Returns `true` if the result is {@link Err} and the value inside of it matches a predicate.
   *
   * # Examples
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.error('Some error message');
   * assertEquals(x.is_err_and((x) => x === 'Some error message'), true);
   *
   * const y: Result<number, string> = Result.err('Another error message);
   * assertEquals(y.is_err_and((y) => y === 'Some error message'), false);
   *
   * const z: Result<number, string> = Result.Ok(123);
   * assertEquals(z.is_err_and((z) => z === 'Some error message'), false);
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
   * If T is `null`, setting the argument `noneSymbol` to true will result in `T | typeof Result.none`, making the distinction.
   *
   * # Example
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.ok(100);
   * assertEquals(x.ok() , 100);
   *
   * const y: Result<number, string> = Result.err('Some error message');
   * assertEquals(y.ok() , null);
   *
   * const z: Result<number, string> = Result.error('Some error message');
   * assertEquals(z.ok(true) , Resule.none);
   * ```
   */
  ok(noneSymbol?: false): T | null;
  ok(noneSymbol: true): T | typeof Result['none'];
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
   * If T is `null`, setting the argument `noneSymbol` to true will result in `E | typeof Result.none`, making the distinction.
   *
   * # Example
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.error('Some error message');
   * assertEquals(x.err() , 'Some error message');
   *
   * const y: Result<number, string> = Result.ok(100);
   * assertEquals(y.err() , null);
   *
   * const z: Result<number, string> = Result.ok(100);
   * assertEquals(z.err(true) , Resule.none);
   * ```
   */
  err(noneSymbol?: false): E | null;
  err(noneSymbol: true): E | typeof Result['none'];
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

  unwrap(): T {
    return this.match(
      (value) => value,
      (error) => {
        throw new Panic('called `Result.unwrap()` on an `Err`', error);
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
   * # Examples
   *
   * @example
   * ```ts
   * import { assertEquals } from 'jsr:@std/assert@1';
   *
   * const x: Result<number, string> = Result.ok(123);
   * const number = x.match(
   *   (x) => x,
   *   (err) => 0
   * );
   *
   * assertEquals(number, 123);
   *
   * const y: Result<number, string> = Result.ok(123);
   * const string = x.match(
   *   (x) => 'expected error. but got ' + x,
   *   (error) => error
   * );
   *
   * assertEquals(string, 'expected error. but got 123');
   *
   * const z: Result<number, string> = Result.error('Some error message');
   * const error = x.match(
   *   (x) => 'expected error. but got ' + x,
   *   (error) => error
   * );
   *
   * assertEquals(error, 'Some error message');
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
}

/**
 * Alias of {@link Result.ok}.
 */
export const ok = Result.ok;
/**
 * Alias of {@link Resule.err}.
 */
export const err = Result.err;
