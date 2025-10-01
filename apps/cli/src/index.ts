import { BunContext, BunRuntime } from "@effect/platform-bun"
import { Args, Command } from "@effect/cli"
import { Effect, Console, Layer } from "effect"
import { parseArg } from "./utils"
import { MarathonCreationCliService } from "./services/marathon-create-service"
import { marathonCreateCommand } from "./commands/marathon-create-command"

const blikkaCli = Command.make("blikka-cli", {}, () =>
  Console.log(
    "Welcome to blikka-cli. Run `blikka-cli --help` for more information."
  )
).pipe(Command.withSubcommands([marathonCreateCommand]))
const run = Command.run(blikkaCli, {
  name: "Blikka CLI - Photo event platform CLI",
  version: "0.0.1",
})
const Services = Layer.mergeAll(MarathonCreationCliService.Default)

Effect.suspend(() => run(process.argv)).pipe(
  Effect.provide(Services),
  Effect.provide(BunContext.layer),
  BunRuntime.runMain
)
