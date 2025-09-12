import { Effect } from "effect"
import { SharpError } from "./sharp-effectful-temp"
import sharp from "sharp"

const makeSharpInstance = (image: Buffer) =>
  Effect.try({
    try: () => sharp(image),
    catch: (error) =>
      new SharpError({
        cause: error,
        message: "Failed to create sharp instance",
      }),
  })

export class SharpImageService extends Effect.Service<SharpImageService>()(
  "@blikka/packages/image-manipulation/image-manipulation-service",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const resize = Effect.fn("SharpImageService.resize")(function* (
        image: Buffer,
        options: { width: number; height?: number; quality?: number }
      ) {
        const instance = yield* makeSharpInstance(image)

        const resized = yield* Effect.tryPromise({
          try: () =>
            instance
              .rotate()
              .resize({
                width: options.width,
                height: options.height,
                withoutEnlargement: true,
                fit: "inside",
              })
              .keepMetadata()
              .toBuffer(),
          catch: (error) =>
            new SharpError({
              cause: error,
              message: "Failed to resize image",
            }),
        })
        return resized
      })

      return {
        resize,
      } as const
    }),
  }
) {}
