import { assert, assertEquals, assertRejects } from "../test-deps.ts";
import { Ok } from "./ok.ts";
import { Err } from "./err.ts";
import { EventualResult } from "./eventual.ts";
import { ExpectError, UnwrapError } from "../exceptions.ts";

Deno.test("creation", async (t) => {
  await t.step("from a promise", async (t) => {
    await t.step("that resolves to a value", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const ok = await eventuallyOk;

      assertEquals(ok, Ok("ok"));
    });

    await t.step("that resolves to an `OkImpl`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve(Ok("ok")));
      const ok = await eventuallyOk;

      assertEquals(ok, Ok("ok"));
    });

    await t.step("that resolves to an `ErrImpl`", async () => {
      const eventuallyErr = new EventualResult(Promise.resolve(Err("err")));
      const err = await eventuallyErr;

      assertEquals(err, Err("err"));
    });

    await t.step("that rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const err = await eventuallyErr;

      assertEquals(err, Err("err"));
    });
  });

  await t.step("from a function that returns a Promise", async () => {
    const eventuallyOk = new EventualResult(() => Promise.resolve("ok"));
    const ok = await eventuallyOk;

    assertEquals(ok, Ok("ok"));
  });

  await t.step("from an async function", async () => {
    const eventuallyOk = new EventualResult(async () =>
      await Promise.resolve("ok")
    );
    const ok = await eventuallyOk;

    assertEquals(ok, Ok("ok"));
  });
});

Deno.test("#map", async () => {
  const eventuallyOk = new EventualResult(Promise.resolve("ok"));
  const eventuallyOkLength = eventuallyOk.map((value) => value.length);

  assertEquals(await eventuallyOkLength, Ok(2));

  const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
  const eventuallyErrLength = eventuallyErr.map((value: string) =>
    value.length
  );

  assertEquals(await eventuallyErrLength, Err("err"));
});

Deno.test("#mapOr", async () => {
  const eventuallyOk = new EventualResult(Promise.resolve("ok"));
  const eventuallyOkLength = eventuallyOk.mapOr(
    Infinity,
    (value) => value.length,
  );

  assertEquals(await eventuallyOkLength, 2);

  const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
  const eventuallyErrLength = eventuallyErr.mapOr(
    Infinity,
    (value: string) => value.length,
  );

  assertEquals(await eventuallyErrLength, Infinity);
});

Deno.test("#andThen", async (t) => {
  await t.step("when the operation returns an `Ok`", async (t) => {
    await t.step("and the promise resolves", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyExcited = eventuallyOk.andThen((value) =>
        Ok(`${value}!`)
      );

      assert(eventuallyExcited instanceof EventualResult);
      assertEquals(await eventuallyExcited, Ok("ok!"));
    });

    await t.step("and the promise rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const eventuallyExcited = eventuallyErr.andThen((value) =>
        Ok(`${value}!`)
      );

      assert(eventuallyExcited instanceof EventualResult);
      assertEquals(await eventuallyExcited, Err("err"));
    });
  });

  await t.step("when the operation returns an `Err`", async (t) => {
    await t.step("and the promise resolves", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyOkThenErr = eventuallyOk.andThen(() => Err("err"));

      assert(eventuallyOkThenErr instanceof EventualResult);
      assertEquals(await eventuallyOkThenErr, Err("err"));
    });

    await t.step("and the promise rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const eventuallyErrThenErr = eventuallyErr.andThen(() =>
        Err(`then error`)
      );

      assert(eventuallyErrThenErr instanceof EventualResult);
      assertEquals(await eventuallyErrThenErr, Err("err"));
    });
  });

  await t.step("when the operation returns a `Promise<Result>`", async (t) => {
    await t.step("when the promise resolves to an `Ok`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async (value) => {
        const better = await Promise.resolve(value + "!");

        return Ok(better);
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, Ok("ok!"));
    });

    await t.step("when the promise resolves to an `Err`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async (value) => {
        const better = await Promise.resolve(value + "!");

        return Err(better);
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, Err("ok!"));
    });

    await t.step("when the promise rejects", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async () => {
        await Promise.resolve();

        throw new Error("boo");
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, Err(new Error("boo")));
    });
  });

  await t.step("when the operation returns an `EventualResult`", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyBetter = eventuallyOk.andThen((value) => {
      return new EventualResult(Promise.resolve(value + "!"));
    });

    assert(eventuallyBetter instanceof EventualResult);
    assertEquals(await eventuallyBetter, Ok("ok!"));
  });
});

Deno.test("#unwrap", async () => {
  const eventuallyOk = new EventualResult(Promise.resolve("ok"));

  assertEquals(await eventuallyOk.unwrap(), "ok");

  const eventuallyErr = new EventualResult(Promise.reject("err"));

  await assertRejects(
    () => eventuallyErr.unwrap(),
    UnwrapError,
    "Cannot unwrap `Err`",
  );
});

Deno.test("#expect", async () => {
  const eventuallyOk = new EventualResult(Promise.resolve("ok"));

  assertEquals(await eventuallyOk.expect("Error Message"), "ok");

  const eventuallyErr = new EventualResult(Promise.reject("err"));

  await assertRejects(
    () => eventuallyErr.expect("Error Message"),
    ExpectError,
    "Error Message",
  );
});
