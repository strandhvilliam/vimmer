import { Console, Effect, Either, Logger, Schema } from "effect"
import {
  type EffectHandler,
  type S3Event,
  type SQSEvent,
  LambdaHandler,
} from "@effect-aws/lambda"
import { parseJson } from "./src/utils"

const S3EventSchema = Schema.Struct({
  Records: Schema.Array(
    Schema.Struct({
      s3: Schema.Struct({
        object: Schema.Struct({
          key: Schema.String,
        }),
      }),
    })
  ),
})

const effectHandler: EffectHandler<SQSEvent, never> = (event) =>
  Effect.forEach(event.Records, (record) =>
    Effect.gen(function* () {
      const body = yield* parseJson(record.body).pipe(
        Effect.map(Schema.decodeUnknownEither(S3EventSchema))
      )
      if (Either.isLeft(body)) {
        Console.error("Invalid S3 event", body.left)
        return
      }
      const s3Event = body.right
      const keys = s3Event.Records.map((r) => r.s3.object.key)

      // process each key
      // parse key to [domain, participantRef, orderIndex, fileName]
      // get submission from s3
      // generate thumbnail
      // parse exif data
      // update submissionstate
      // increment participant upload count

      return Effect.void
    })
  ).pipe(Effect.catchAll((error) => Effect.logError(error)))

export const handler = LambdaHandler.make(effectHandler)
