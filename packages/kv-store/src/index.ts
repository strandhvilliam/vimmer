import { Effect } from "effect"
import { UploadKVRepository } from "./repos/upload-kv-repository"
import { ZipKVRepository } from "./repos/zip-kv-repository"
import { ExifKVRepository } from "./repos/exif-kv-repository"

export * from "./repos/upload-kv-repository"
export * from "./repos/zip-kv-repository"
export * from "./repos/exif-kv-repository"
export * from "./upstash"
export * from "./key-factory"
export * from "./schema"

export class KVStore extends Effect.Service<KVStore>()(
  "@blikka/packages/kv-store",
  {
    dependencies: [
      UploadKVRepository.Default,
      ZipKVRepository.Default,
      ExifKVRepository.Default,
    ],
    effect: Effect.gen(function* () {
      const uploadRepository = yield* UploadKVRepository
      const zipRepository = yield* ZipKVRepository
      const exifRepository = yield* ExifKVRepository

      return {
        uploadRepository,
        zipRepository,
        exifRepository,
      }
    }),
  }
) {}
