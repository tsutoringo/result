import type { Result as _Result } from "./result.ts";

/**
 * By making `value` a union and adding `isBreak`, the process on the caller side is simplified.
 *
 * example -> {@linkcode _Result.prototype.controlFlow}
 */
export type ControlFlow<Break, Continue> = {
  isBreak: true;
  value: Break;
} | {
  isBreak: false;
  value: Continue;
};

/** */
export interface ToControlFlow<Break, Continue> {
  controlFlow(): ControlFlow<Break, Continue>;
}
