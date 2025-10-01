import { Data, Effect, Option } from "effect"

export class InvalidArgError extends Data.TaggedError("InvalidArgError")<{
  message?: string
}> {}

export const parseArg = Effect.fn("CLI.parseArg")(function* (
  arg: Option.Option<string>
) {
  if (Option.isNone(arg)) {
    return Option.none<string>()
  }

  if (!arg.value.startsWith("--") || !arg.value.includes("=")) {
    return yield* new InvalidArgError({
      message: `Invalid argument: ${arg}. Arguments must be in the format --key=value or plain string arguments`,
    })
  }
  const [key, value] = arg.value.split("=")
  if (!key || !value) {
    return yield* new InvalidArgError({
      message: `Invalid argument: ${arg}. Arguments must be in the format --key=value or plain string arguments`,
    })
  }
  return Option.some(value)
})
