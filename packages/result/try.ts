import type { ControlFlow } from "./controlFlow.ts";

export interface Try<Residual, Output> {
  branch(): ControlFlow<Residual, Output>;
}
