
/**
 * By making `value` a union and adding `isBreak`, the process on the caller side is simplified.
 *
 * example -> {@linkcode Result.prototype.controlFlow}
 */
export type ControlFlow<Break, Continue> = {
  isBreak: true;
  value: Break;
} | {
  isBreak: false;
  value: Continue;
};
