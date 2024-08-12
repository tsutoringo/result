export type MatchArms<T extends unknown[], A> = {
  [key in keyof T]: (value: T[key]) => A;
};

export interface Match<T extends unknown[]> {
  match<A>(...arms: MatchArms<T, A>): A;
}
