import { Effect, Schema } from "effect"
import { ChannelParseError } from "./utils"

const PubSubChannelEnvironment = Schema.Literal("prod", "dev", "staging")
const PubSubChannelType = Schema.Literal("upload-flow")

const PubSubChannelString = Schema.TemplateLiteral(
  PubSubChannelEnvironment,
  Schema.Literal(":"),
  PubSubChannelType,
  Schema.Literal(":"),
  Schema.String
)

type PubSubChannelEnvironment = Schema.Schema.Type<typeof PubSubChannelEnvironment>
type PubSubChannelType = Schema.Schema.Type<typeof PubSubChannelType>
type PubSubChannelString = Schema.Schema.Type<typeof PubSubChannelString>

export class PubSubChannel extends Schema.Class<PubSubChannel>("PubSubChannel")({
  environment: PubSubChannelEnvironment,
  type: PubSubChannelType,
  identifier: Schema.String,
}) {
  static toString = Effect.fnUntraced(function* (channel: PubSubChannel) {
    return yield* Schema.encodeUnknown(PubSubChannelString)(
      `${channel.environment}:${channel.type}:${channel.identifier}`
    ).pipe(Effect.mapError((error) => new ChannelParseError(error)))
  })
  static fromString = Effect.fnUntraced(function* (str: PubSubChannelString) {
    const parts = str.split(":")
    if (parts.length !== 3) {
      return yield* new ChannelParseError({ message: "Invalid pubsub channel string" })
    }
    const [environment, type, identifier] = parts
    return yield* Schema.decodeUnknown(PubSubChannel)({
      environment,
      type,
      identifier,
    }).pipe(Effect.mapError((error) => new ChannelParseError(error)))
  })
}

export class PubSubMessage extends Schema.Class<PubSubMessage>("PubSubMessage")({
  channel: PubSubChannelString,
  payload: Schema.Unknown,
  timestamp: Schema.Number,
  messageId: Schema.String,
}) {
  static create = Effect.fnUntraced(function* <T>(channel: PubSubChannel, payload: T) {
    return yield* Schema.encodeUnknown(PubSubMessage)({
      channel: yield* PubSubChannel.toString(channel),
      payload,
      timestamp: Date.now(),
      messageId: crypto.randomUUID(),
    })
  })
}
