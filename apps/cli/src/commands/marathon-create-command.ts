import { MarathonCreationCliService } from "@/services/marathon-create-service"
import { parseArg } from "@/utils"
import { Args, Command } from "@effect/cli"
import { Effect, Console } from "effect"

const domainArg = Args.text({ name: "domain" }).pipe(
  Args.optional,
  Args.withDescription("The domain of the marathon (e.g. sthlm2025)")
)
const nameArg = Args.text({ name: "name" }).pipe(
  Args.optional,
  Args.withDescription("The name of the marathon (e.g. Stockholm Marathon)")
)

export const marathonCreateCommand = Command.make(
  "marathon:create",
  { domainArg, nameArg },
  ({ domainArg, nameArg }) => {
    return Effect.gen(function* () {
      const marathonCreationCliService = yield* MarathonCreationCliService
      const parsedDomain = yield* parseArg(domainArg)
      const parsedName = yield* parseArg(nameArg)
      yield* marathonCreationCliService.create({
        domainArg: parsedDomain,
        nameArg: parsedName,
      })
    }).pipe(
      Effect.catchTag("InvalidArgError", (error) => Console.log(error.message)),
      Effect.catchTag("MarathonInputError", (error) =>
        Console.log(`Error: ${error.message}`)
      ),
      Effect.catchTag("SqlError", (error) =>
        Console.log("Unhandled SQL error:", error)
      ),
      Effect.catchTag("QuitException", (error) => Effect.void)
    )
  }
).pipe(
  Command.withDescription(
    "Create a new marathon. Optionally provide the domain and name as arguments or fill in the prompts."
  )
)
