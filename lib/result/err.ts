import { type Result } from "./result.ts";
import { None, type Option, Some } from "../option/mod.ts";
import { ExpectError, UnwrapError } from "../exceptions.ts";

class ErrImpl<E> implements Result<never, E> {
  readonly isOk = false;
  readonly isErr = true;

  /**
   * The error being wrapped by the `Result`
   */
  private val: E;

  constructor(value: E) {
    this.val = value;
  }

  unwrap(): never {
    throw new UnwrapError("Cannot unwrap `Err`", { cause: this.val });
  }

  expect(message: string): never {
    throw new ExpectError(message, { cause: this.val });
  }

  unwrapErr(): E {
    return this.val;
  }

  expectErr(_message: string): E {
    return this.val;
  }

  andThen(_op: (value: never) => Result<never, E>): ErrImpl<E> {
    return this;
  }

  map<T = never, U = never>(_op: (value: T) => U): Result<never, E> {
    return this;
  }

  mapErr<F>(op: (error: E) => F): Result<never, F> {
    return Err(op(this.val));
  }

  mapOr<U, T = never>(fallback: U, _op: (value: T) => U): U {
    return fallback;
  }

  ok(): Option<never> {
    return None;
  }

  err(): Option<E> {
    return Some(this.val);
  }

  get [Symbol.toStringTag]() {
    return "Err";
  }
}

export function Err<E>(value: E): ErrImpl<E> {
  return new ErrImpl(value);
}