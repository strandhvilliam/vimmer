import { Effect } from "effect"

export class UploadFlowCliService extends Effect.Service<UploadFlowCliService>()(
  "@blikka/cli/upload-flow-service",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      return {}
    }),
  }
) {}
