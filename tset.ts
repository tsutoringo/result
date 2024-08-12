import { ok, Result } from './result.ts';

const x: Result<number, string> = ok(1);

const value = x.ok();
