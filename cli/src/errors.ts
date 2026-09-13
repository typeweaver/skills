import { Data, Runtime } from "effect";

// Expected outcomes are rendered by the CLI entry point as plain messages.
// `Runtime.errorReported = false` keeps the Effect runtime from logging them
// with a stack trace; the exit code stays 1.

export class NonInteractiveWithoutFlagsError extends Data.TaggedError(
  "NonInteractiveWithoutFlagsError",
)<{ readonly message: string }> {
  override readonly [Runtime.errorReported] = false;
}

export class NoHarnessDetectedError extends Data.TaggedError("NoHarnessDetectedError")<{
  readonly message: string;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class NoReceiptError extends Data.TaggedError("NoReceiptError")<{
  readonly message: string;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class GeneratorDriftError extends Data.TaggedError("GeneratorDriftError")<{
  readonly message: string;
  readonly files: ReadonlyArray<string>;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class AgentSourceError extends Data.TaggedError("AgentSourceError")<{
  readonly message: string;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class LifecycleError extends Data.TaggedError("LifecycleError")<{
  readonly message: string;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  readonly message: string;
  readonly conflicts: ReadonlyArray<string>;
}> {
  override readonly [Runtime.errorReported] = false;
}

export class DoctorUnhealthyError extends Data.TaggedError("DoctorUnhealthyError")<{
  readonly message: string;
}> {
  override readonly [Runtime.errorReported] = false;
}
