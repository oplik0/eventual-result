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

      assertEquals(ok, new Ok("ok"));
    });

    await t.step("that resolves to an `Ok`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve(new Ok("ok")));
      const ok = await eventuallyOk;

      assertEquals(ok, new Ok("ok"));
    });

    await t.step("that resolves to an `Err`", async () => {
      const eventuallyErr = new EventualResult(Promise.resolve(new Err("err")));
      const err = await eventuallyErr;

      assertEquals(err, new Err("err"));
    });

    await t.step("that rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const err = await eventuallyErr;

      assertEquals(err, new Err("err"));
    });
  });

  await t.step("from a function that returns a Promise", async () => {
    const eventuallyOk = new EventualResult(() => Promise.resolve("ok"));
    const ok = await eventuallyOk;

    assertEquals(ok, new Ok("ok"));
  });

  await t.step("from an async function", async () => {
    const eventuallyOk = new EventualResult(async () =>
      await Promise.resolve("ok")
    );
    const ok = await eventuallyOk;

    assertEquals(ok, new Ok("ok"));
  });
});

Deno.test("#map", async (t) => {
  await t.step("when returning a value", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyOkLength = eventuallyOk.map((value) => value.length);

    assertEquals(await eventuallyOkLength, new Ok(2));

    const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
    const eventuallyErrLength = eventuallyErr.map((value: string) =>
      value.length
    );

    assertEquals(await eventuallyErrLength, new Err("err"));
  });

  await t.step("when returning a `Promise`", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyOkLength: EventualResult<number, unknown> = eventuallyOk
      .map((value) => Promise.resolve(value.length));

    assertEquals(await eventuallyOkLength, new Ok(2));

    const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
    const eventuallyErrLength = eventuallyErr.map((value: string) =>
      Promise.resolve(value.length)
    );

    assertEquals(await eventuallyErrLength, new Err("err"));
  });
});

Deno.test("#mapOr", async (t) => {
  await t.step("when returning a value", async () => {
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

  await t.step("when returning a `Promise`", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyOkLength: Promise<number> = eventuallyOk.mapOr(
      Infinity,
      (value) => Promise.resolve(value.length),
    );

    assertEquals(await eventuallyOkLength, 2);

    const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
    const eventuallyErrLength: Promise<number> = eventuallyErr.mapOr(
      Infinity,
      (value: string) => Promise.resolve(value.length),
    );

    assertEquals(await eventuallyErrLength, Infinity);
  });
});

Deno.test("#mapOrElse", async (t) => {
  await t.step("when returning a value", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyOkLength = eventuallyOk.mapOrElse(
      () => Infinity,
      (value) => value.length,
    );

    assertEquals(await eventuallyOkLength, 2);

    const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
    const eventuallyErrLength = eventuallyErr.mapOrElse(
      () => Infinity,
      (value: string) => value.length,
    );

    assertEquals(await eventuallyErrLength, Infinity);
  });

  await t.step("when returning a `Promise`", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyOkLength: Promise<number> = eventuallyOk.mapOrElse(
      () => Promise.resolve(Infinity),
      (value) => Promise.resolve(value.length),
    );

    assertEquals(await eventuallyOkLength, 2);

    const eventuallyErr = new EventualResult<never>(Promise.reject("err"));
    const eventuallyErrLength: Promise<number> = eventuallyErr.mapOrElse(
      () => Promise.resolve(Infinity),
      (value: string) => Promise.resolve(value.length),
    );

    assertEquals(await eventuallyErrLength, Infinity);
  });
});

Deno.test("#andThen", async (t) => {
  await t.step("when the operation returns an `Ok`", async (t) => {
    await t.step("and the promise resolves", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyExcited = eventuallyOk.andThen((value) =>
        new Ok(`${value}!`)
      );

      assert(eventuallyExcited instanceof EventualResult);
      assertEquals(await eventuallyExcited, new Ok("ok!"));
    });

    await t.step("and the promise rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const eventuallyExcited = eventuallyErr.andThen((value) =>
        new Ok(`${value}!`)
      );

      assert(eventuallyExcited instanceof EventualResult);
      assertEquals(await eventuallyExcited, new Err("err"));
    });
  });

  await t.step("when the operation returns an `Err`", async (t) => {
    await t.step("and the promise resolves", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyOkThenErr = eventuallyOk.andThen(() => new Err("err"));

      assert(eventuallyOkThenErr instanceof EventualResult);
      assertEquals(await eventuallyOkThenErr, new Err("err"));
    });

    await t.step("and the promise rejects", async () => {
      const eventuallyErr = new EventualResult(Promise.reject("err"));
      const eventuallyErrThenErr = eventuallyErr.andThen(() =>
        new Err(`then error`)
      );

      assert(eventuallyErrThenErr instanceof EventualResult);
      assertEquals(await eventuallyErrThenErr, new Err("err"));
    });
  });

  await t.step("when the operation returns a `Promise<Result>`", async (t) => {
    await t.step("when the promise resolves to an `Ok`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async (value) => {
        const better = await Promise.resolve(value + "!");

        return new Ok(better);
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, new Ok("ok!"));
    });

    await t.step("when the promise resolves to an `Err`", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async (value) => {
        const better = await Promise.resolve(value + "!");

        return new Err(better);
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, new Err("ok!"));
    });

    await t.step("when the promise rejects", async () => {
      const eventuallyOk = new EventualResult(Promise.resolve("ok"));
      const eventuallyBetter = eventuallyOk.andThen(async () => {
        await Promise.resolve();

        throw new Error("boo");
      });

      assert(eventuallyBetter instanceof EventualResult);
      assertEquals(await eventuallyBetter, new Err(new Error("boo")));
    });
  });

  await t.step("when the operation returns an `EventualResult`", async () => {
    const eventuallyOk = new EventualResult(Promise.resolve("ok"));
    const eventuallyBetter = eventuallyOk.andThen((value) => {
      return new EventualResult(Promise.resolve(value + "!"));
    });

    assert(eventuallyBetter instanceof EventualResult);
    assertEquals(await eventuallyBetter, new Ok("ok!"));
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

Deno.test("#unwrapOr", async () => {
  const eventuallyOk = new EventualResult(Promise.resolve("ok"));

  assertEquals(await eventuallyOk.unwrapOr("other"), "ok");

  const eventuallyErr = new EventualResult(Promise.reject("err"));

  assertEquals(await eventuallyErr.unwrapOr("other"), "other");
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
