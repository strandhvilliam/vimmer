import { Command } from "@effect/cli"
import { Effect } from "effect"
import { UploadFlowCliService } from "@/services/upload-flow-service"

export const uploadFlowCommand = Command.make("upload:flow", {}).pipe(
  Command.withDescription(
    "Create a new marathon. Optionally provide the domain and name as arguments or fill in the prompts."
  ),
  Command.withHandler(() =>
    UploadFlowCliService.pipe(Effect.andThen((service) => service.upload()))
  )
)
