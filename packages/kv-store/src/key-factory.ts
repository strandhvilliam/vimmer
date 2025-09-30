import { Effect } from "effect";

export class KeyFactory extends Effect.Service<KeyFactory>()(
  "@blikka/packages/redis-store/key-factory",
  {
    sync: () => ({
      submission: (domain: string, ref: string, orderIndex: string) =>
        `submission:${domain}:${ref}:${orderIndex}`,
      exif: (domain: string, ref: string, orderIndex: string) =>
        `exif:${domain}:${ref}:${orderIndex}`,
      participant: (domain: string, ref: string) =>
        `participant:${domain}:${ref}`,
      zipProgress: (domain: string, ref: string) =>
        `zip-progress:${domain}:${ref}`,
    }),
  },
) {}
