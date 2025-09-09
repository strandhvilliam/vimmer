// setup geneiric interface
// import the actual service (sharp etc)
// make the service reio

import { Effect } from "effect"

export class ImageManipulationService extends Effect.Service<ImageManipulationService>()(
  "@blikka/packages/image-manipulation/image-manipulation-service",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      return {
        manipulateImage: (image: Buffer) => {
          return image
        },
      }
    }),
  }
) {}
