import {
  assertEquals,
  assertStrictEquals,
  assertThrows,
} from "std/testing/asserts.ts";
import { Err, isErr, isOk, type Result } from "./mod.ts";
import { EventualResult } from "./eventual.ts";
import { None, Some } from "../option/mod.ts";
import { ExpectError, UnwrapError } from "../exceptions.ts";

Deno.test("isOk", () => {
  const err = new Err("whatever");

  assertEquals(isOk(err), false);
});

Deno.test("isErr", () => {
  const err = new Err("whatever");

  assertEquals(isErr(err), true);
});

Deno.test("#unwrap", () => {
  const err = new Err("whatever");

  assertThrows(() => {
    err.unwrap();
  }, UnwrapError);
});

Deno.test("#unwrapOr", () => {
  const err = new Err("whatever");

  assertEquals(err.unwrapOr("foo"), "foo");
});

Deno.test("#expect", () => {
  const err = new Err("whatever");

  assertThrows(
    () => {
      err.expect("My Message");
    },
    ExpectError,
    "My Message",
  );
});

Deno.test("unwrapErr", () => {
  const err = new Err("whatever");

  assertEquals(err.unwrapErr(), "whatever");
});

Deno.test("#expectErr", () => {
  const err = new Err("whatever");

  assertEquals(err.expectErr("My Message"), "whatever");
});

Deno.test("#andThen", () => {
  const err = new Err("whatever");
  const afterOp = err.andThen();

  assertStrictEquals(err, afterOp, "The operation was not performed");
});

Deno.test("#map", () => {
  const err = new Err("whatever").map();

  assertStrictEquals(err, err);
});

Deno.test("#mapErr", () => {
  const err = new Err("whatever").mapErr((value) => `${value}!`);

  assertEquals(err, new Err("whatever!"));
});

Deno.test("#mapOr", () => {
  const lengthOrDefault = new Err("whatever").mapOr(
    0,
    (value: string) => value.length,
  );

  assertEquals(lengthOrDefault, 0);
});

Deno.test("#mapOrElse", () => {
  const lengthOrDefault = new Err("whatever").mapOrElse(
    () => 0,
    (value: string) => value.length,
  );

  assertEquals(lengthOrDefault, 0);
});

Deno.test("#effect", () => {
  let sideEffect = false;
  // @ts-expect-error: effectError doesn't have any parameters `Err`, only on `Ok`
  const ok = new Err("whatever").effect(() => {
    sideEffect = true;
  });

  assertEquals(sideEffect, false);
  assertEquals(ok, new Err("whatever"));
});

Deno.test("#effectErr", () => {
  let sideEffect = false;
  const ok = new Err("whatever").effectErr(() => {
    sideEffect = true;
  });

  assertEquals(sideEffect, true);
  assertEquals(ok, new Err("whatever"));
});

Deno.test("#and", () => {
  const err = new Err("foo");
  const result = err.and(new Err("bar"));

  assertStrictEquals(result, err);
});

Deno.test("#or", () => {
  const err = new Err("foo");
  const result = err.or(new Err("bar"));

  assertEquals(result, new Err("bar"));
});

Deno.test("#orElse", () => {
  const err: Result<string, string> = new Err("foo");
  const result = err.orElse((val) => new Err(val.length));

  assertEquals(result, new Err(3));
});

Deno.test("#ok", () => {
  const err = new Err("whatever");

  assertEquals(err.ok(), None);
});

Deno.test("#err", () => {
  const err = new Err("whatever");

  assertEquals(err.err(), new Some("whatever"));
});

Deno.test("#eventually", async () => {
  const eventual: EventualResult<never, string> = new Err("whatever")
    .eventually();

  assertEquals(await eventual, new Err("whatever"));
});
