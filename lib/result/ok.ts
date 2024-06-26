import { type Result } from "./result.ts";
import { EventualResult } from "./eventual.ts";
import { None, type Option, Some } from "../option/mod.ts";
import { ExpectError, UnwrapError } from "../exceptions.ts";

/**
 * Contains the success value of a `Result<T, E>`
 *
 * @template T The type of the success value
 */
export class Ok<T> implements Result<T, never> {
  constructor(private val: T) {}

  unwrap(): T {
    return this.val;
  }

  unwrapOr(): T {
    return this.val;
  }

  expect(_message: string): T {
    return this.val;
  }

  expectResult(_message: string): Ok<T> {
    return this;
  }

  unwrapErr(): never {
    throw new UnwrapError("Cannot unwrap `Ok` to `Err`", this.val);
  }

  expectErr(message: string): never {
    throw new ExpectError(message, this.val);
  }

  andThen<U, E, OpResult extends Result<U, E>>(
    op: (value: T) => OpResult,
  ): OpResult {
    return op(this.val);
  }

  map<U>(op: (value: T) => U): Result<U, never> {
    return new Ok(op(this.val));
  }

  mapErr(): Ok<T> {
    return this;
  }

  mapOr<U>(_fallback: U, op: (value: T) => U): U {
    return op(this.val);
  }

  mapOrElse<U>(_fallback: () => U, op: (value: T) => U): U {
    return op(this.val);
  }

  effect(op: (value: T) => void): Result<T, never> {
    return this.map<T>((value) => {
      op(value);
      return value;
    });
  }

  effectErr(): Result<T, never> {
    return this;
  }

  and<E>(other: Result<T, E>): Result<T, E> {
    return other;
  }

  or<F>(_other: Result<T, F>): Result<T, F> {
    return this;
  }

  orElse<E, F>(_other: (val: E) => Result<T, F>): Result<T, F> {
    return this;
  }

  ok(): Option<T> {
    return new Some(this.val);
  }

  err(): Option<never> {
    return None;
  }

  eventually(): EventualResult<T, never> {
    return new EventualResult<T, never>(Promise.resolve(this));
  }

  get [Symbol.toStringTag]() {
    return "Ok";
  }
}

/**
 * Determines whether a `Result<T, E>` is `Ok<T>`
 */
export function isOk<T>(result: Result<T, unknown>): result is Ok<T> {
  return result instanceof Ok;
}
