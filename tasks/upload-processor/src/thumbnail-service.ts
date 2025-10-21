import { SharpImageService } from "@blikka/image-manipulation"
import { S3Service } from "@blikka/s3"
import { Effect } from "effect"
import { makeThumbnailKey, parseKey } from "./utils"
import { Resource as SSTResource } from "sst"

const THUMBNAIL_WIDTH = 400

export class ThumbnailService extends Effect.Service<ThumbnailService>()(
  "@blikka/tasks/ThumbnailService",
  {
    dependencies: [S3Service.Default, SharpImageService.Default],
    effect: Effect.gen(function* () {
      const s3 = yield* S3Service
      const sharp = yield* SharpImageService

      const generateThumbnail = Effect.fn("ThumbnailService.generateThumbnail")(
        function* (photo: Buffer, key: string) {
          const thumbnailKey = yield* parseKey(key).pipe(
            Effect.flatMap((parsedKey) => makeThumbnailKey(parsedKey))
          )

          const resized = yield* sharp.resize(Buffer.from(photo), {
            width: THUMBNAIL_WIDTH,
          })
          yield* s3.putFile(
            SSTResource.V2ThumbnailsBucket.name,
            thumbnailKey,
            resized
          )
          return thumbnailKey
        }
      )

      return {
        generateThumbnail,
      }
    }),
  }
) {}
