# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/) and this
project adheres to [Semantic Versioning](http://semver.org/).

## 0.12.1 - 2024-06-11

### Fixed

- formatted files

## 0.12.0 - 2024-06-11

### Added

- `expectResult` that returns not the value, but the result if it's `Ok`

### Fixed

- export `run` fron `mod.ts`

## 0.11.0 - 2024-05-29

### Added

- allow creating `EventualResult` without try/catch for safe promises
- add static create methods to `EventualResult` as alternative to the
  constructor
- effect-only methods (run without modifying underlying value)

## 0.10.2 - 2024-05-29

### Fixed

- lint issues

## 0.10.1 - 2024-05-29

### Fixed

- minor typing and formatting issues
- use `Deno.Command` in release scripts

## 0.10.0 - 2024-05-29

### Fixed

- `EventualResult` now handles `PromiseLike`

## 0.9.1 - 2022-08-13

### Fixed

- `#or` and `#orElse` can change the error type
- `#orElse` receives the `Err` value from the object it is called on

## 0.9.0 - 2022-08-13

### Added

- `#or` and `#orElse` methods on `EventualResult`

## 0.8.1 - 2022-08-10

### Fixed

- `EventualResult` handles an exception thrown in an originator function

## 0.8.0 - 2022-08-10

### Added

- `EventualResult` now has an `.unwrapErr` method

## 0.7.0 - 2022-08-09

### Added

- `isSome`, `isNone`, `isOk` and `isErr` helper functions
- `None` is now immutable

### Removed

- `isSome`, `isNone`, `isOk` and `isErr` methods have been removed

## 0.6.0 - 2022-08-09

### Added

- Add `mapErr` method to `EventualResult`

### Changed

- Removed distinct `Option` union type and `OptionMethods` interface in favor of
  a single interface that `Option` and `None` implement
- Removed distinct `Result` union type and `ResultMethods` interface in favor of
  a single interface that `Ok` and `Err` implement
- `isSome`, `isNone`, `isOk` and `isErr` are now methods, rather than properties

## 0.5.3 - 2022-03-17

### Fixed

- Support updated `Error` definition for `es2022` that limits the supported
  types for `cause`

## 0.5.2 - 2022-03-12

### Added

- Changelog generation script
