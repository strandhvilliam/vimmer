import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Command } from "@effect/cli"
import { Effect, Console, Layer } from "effect"
import { MarathonCreationCliService } from "./services/marathon-create-service"
import { marathonCreateCommand } from "./commands/marathon-create-command"
import { UploadFlowCliService } from "./services/upload-flow-service"
import { uploadFlowCommand } from "./commands/upload-flow-command"
import { TracingLayer } from "@blikka/telemetry"

const blikkaCli = Command.make("blikka-cli", {}).pipe(
  Command.withHandler(() =>
    Console.log(
      "Welcome to blikka-cli. Run `blikka-cli --help` for more information."
    )
  ),
  Command.withSubcommands([marathonCreateCommand, uploadFlowCommand])
)
const run = Command.run(blikkaCli, {
  name: "Blikka CLI - Photo event platform CLI",
  version: "0.0.1",
})
const Services = Layer.mergeAll(
  MarathonCreationCliService.Default,
  UploadFlowCliService.Default
)

Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(Services),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
