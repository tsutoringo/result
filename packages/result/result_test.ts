import { assert, assertEquals, assertFalse, assertThrows } from "@std/assert";
import { Result } from "./result.ts";

Deno.test({
  name: "Result.ok()",
  fn() {
    const x: Result<number, string> = Result.ok(3);

    assert(x.innerResult.success);
    assertEquals(x.innerResult.value, 3);
  },
});

Deno.test({
  name: "Result.ok() with undefined value",
  fn() {
    const x: Result<undefined, string> = Result.ok();

    assert(x.innerResult.success);
    assertEquals(x.innerResult.value, undefined);
  },
});

Deno.test({
  name: "Result.err()",
  fn() {
    const x: Result<number, string> = Result.err("Some error message");

    assertFalse(x.innerResult.success);
    assertEquals(x.innerResult.value, "Some error message");
  },
});

Deno.test({
  name: "Result#isOk()",
  fn() {
    const x: Result<number, string> = Result.ok(-3);
    assertEquals(x.isOk(), true);

    const y: Result<number, string> = Result.err("Some error message");
    assertEquals(y.isOk(), false);
  },
});

Deno.test({
  name: "Result#isOkAnd()",
  fn() {
    const x: Result<number, string> = Result.ok(2);
    assertEquals(x.isOkAnd((x) => x > 1), true);

    const y: Result<number, string> = Result.ok(0);
    assertEquals(y.isOkAnd((y) => y > 1), false);

    const z: Result<number, string> = Result.err("hey");
    assertEquals(z.isOkAnd((z) => z > 1), false);
  },
});

Deno.test({
  name: "Result#isErr()",
  fn() {
    const x: Result<number, string> = Result.ok(-3);
    assertEquals(x.isErr(), false);

    const y: Result<number, string> = Result.err("Some error message");
    assertEquals(y.isErr(), true);
  },
});

Deno.test({
  name: "Result#isErrAnd()",
  fn() {
    const x: Result<number, string> = Result.err("Some error message");
    assertEquals(x.isErrAnd((x) => x === "Some error message"), true);

    const y: Result<number, string> = Result.err("Another error message");
    assertEquals(y.isErrAnd((y) => y === "Some error message"), false);

    const z: Result<number, string> = Result.ok(123);
    assertEquals(z.isErrAnd((z) => z === "Some error message"), false);
  },
});

Deno.test({
  name: "Result#ok()",
  fn() {
    const x: Result<number, string> = Result.ok(100);
    assertEquals(x.ok(), 100);

    const y: Result<number, string> = Result.err("Some error message");
    assertEquals(y.ok(), null);
  },
});

Deno.test({
  name: "Result#ok(true)",
  fn() {
    const x: Result<number, string> = Result.ok(100);
    assertEquals(x.ok(true), 100);

    const z: Result<number, string> = Result.err("Some error message");
    assertEquals(z.ok(true), Result.none);
  },
});

Deno.test({
  name: "Result#err()",
  fn() {
    const x: Result<number, string> = Result.err("Some error message");
    assertEquals(x.err(), "Some error message");

    const y: Result<number, string> = Result.ok(100);
    assertEquals(y.err(), null);
  },
});

Deno.test({
  name: "Result#err(true)",
  fn() {
    const x: Result<number, string> = Result.err("Some error message");
    assertEquals(x.err(true), "Some error message");

    const z: Result<number, string> = Result.ok(100);
    assertEquals(z.err(true), Result.none);
  },
});

Deno.test({
  name: "Result#unwrap() with success value",
  fn() {
    const x: Result<number, string> = Result.ok(2);
    assertEquals(x.unwrap(), 2);
  },
});

Deno.test({
  name: "Result#unwrap() with fail value",
  fn() {
    const x: Result<number, string> = Result.err("Some error message");
    assertThrows(() => x.unwrap());
  },
});

Deno.test({
  name: "Result#match()",
  fn() {
    const x: Result<number, string> = Result.ok(123);
    const number = x.match(
      (x) => x,
      (_) => 0,
    );

    assertEquals(number, 123);

    const y: Result<number, string> = Result.ok(123);
    const string = y.match(
      (y) => "expected error. but got " + y,
      (error) => error,
    );

    assertEquals(string, "expected error. but got 123");

    const z: Result<number, string> = Result.err("Some error message");
    const error = z.match(
      (z) => "expected error. but got " + z,
      (error) => error,
    );

    assertEquals(error, "Some error message");
  },
});

Deno.test({
  name: "Result#branch",
  fn() {
    const returnError = (): Result<number, string> => {
      return Result.err("Some error message");
    };

    const func = (): Result<boolean, string> => {
      const result = returnError().branch();

      if (result.isBreak) return result.value;

      return Result.ok(false);
    };

    assert(func().isErr() === true);
  },
});
