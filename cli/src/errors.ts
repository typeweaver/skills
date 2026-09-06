import { Data } from "effect";

export class NonInteractiveWithoutFlagsError extends Data.TaggedError(
  "NonInteractiveWithoutFlagsError",
)<{ readonly message: string }> {}

export class NoHarnessDetectedError extends Data.TaggedError("NoHarnessDetectedError")<{
  readonly message: string;
}> {}

export class NoReceiptError extends Data.TaggedError("NoReceiptError")<{
  readonly message: string;
}> {}

export class GeneratorDriftError extends Data.TaggedError("GeneratorDriftError")<{
  readonly message: string;
  readonly files: ReadonlyArray<string>;
}> {}

export class AgentSourceError extends Data.TaggedError("AgentSourceError")<{
  readonly message: string;
}> {}

export class LifecycleError extends Data.TaggedError("LifecycleError")<{
  readonly message: string;
}> {}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  readonly message: string;
  readonly conflicts: ReadonlyArray<string>;
}> {}

export class DoctorUnhealthyError extends Data.TaggedError("DoctorUnhealthyError")<{
  readonly message: string;
}> {}
