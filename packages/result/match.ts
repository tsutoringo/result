/**
 * Match arms
 */
export type MatchArms<T extends unknown[], A> = {
  [key in keyof T]: (value: T[key]) => A;
};

/**
 * An interface for implementing Rust's `Match` as a method.
 */
export interface Match<T extends unknown[]> {
  match<A>(...arms: MatchArms<T, A>): A;
}
