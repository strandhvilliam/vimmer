import { Data } from "effect"
export class PubSubError extends Data.TaggedError("PubSubError")<{
  message?: string
  cause?: unknown
}> {}

export class ChannelParseError extends Data.TaggedError("ChannelParseError")<{
  message?: string
  cause?: unknown
}> {}
