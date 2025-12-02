import { Data, Effect, Option, pipe, String } from "effect"

export class InvalidArgError extends Data.TaggedError("InvalidArgError")<{
  message?: string
}> {}

export const parseArg = Effect.fnUntraced(function* (
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

export const generateSubmissionKey = (
  domain: string,
  reference: string,
  orderIndex: number
) => {
  const dateTime = new Date().toISOString().replace(/[:.]/g, "-")
  const formattedOrderIndex = (orderIndex + 1).toString().padStart(2, "0")
  return `${domain}/${reference}/${formattedOrderIndex}/${reference}_${formattedOrderIndex}_${dateTime}.jpg`
}

export const formatOrderIndex = (index: number, topicStartIndex: number = 0) =>
  Effect.sync(() => {
    return pipe((topicStartIndex + index).toString(), String.padStart(2, "0"))
  })
