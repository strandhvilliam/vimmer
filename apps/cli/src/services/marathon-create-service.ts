import { Terminal } from "@effect/platform"
import { Prompt } from "@effect/cli"
import { Effect, Option, Data } from "effect"
import { Database } from "@blikka/db"
import { DOMAIN_MIN_LENGTH } from "../constants"

export class MarathonInputError extends Data.TaggedError("MarathonInputError")<{
  message?: string
}> {}

export class MarathonCreationCliService extends Effect.Service<MarathonCreationCliService>()(
  "@blikka/cli/marathon-creation-service",
  {
    dependencies: [Database.Default],
    effect: Effect.gen(function* () {
      const db = yield* Database
      const terminal = yield* Terminal.Terminal

      const validateDomainInput = Effect.fn(
        "MarathonCreationCliService.validateDomainInput"
      )(function* (value: string) {
        if (value.length < DOMAIN_MIN_LENGTH) {
          return yield* new MarathonInputError({
            message: `Domain must be at least ${DOMAIN_MIN_LENGTH} characters long\n`,
          })
        }
        const exists = yield* db.marathonsQueries.getMarathonByDomain({
          domain: value,
        })
        return yield* Option.match(exists, {
          onSome: () =>
            new MarathonInputError({
              message: "Domain already exists\n",
            }),
          onNone: () => Effect.succeed(value),
        })
      })

      const validateNameInput = Effect.fn(
        "MarathonCreationCliService.validateNameInput"
      )(function* (value: string) {
        if (value.length === 0) {
          return yield* new MarathonInputError({
            message: "Name is required\n",
          })
        }
        return yield* Effect.succeed(value)
      })

      const create = Effect.fn("MarathonCreationCliService.create")(function* ({
        domainArg,
        nameArg,
      }: {
        domainArg: Option.Option<string>
        nameArg: Option.Option<string>
      }) {
        const domain = yield* Option.match(domainArg, {
          onSome: (domain) => validateDomainInput(domain),
          onNone: () =>
            Prompt.text({
              message:
                "Enter subdomain to be used in the url (e.g. sthlm2025):",
              validate: (value) =>
                validateDomainInput(value).pipe(
                  Effect.mapError((error) => error.message)
                ),
            }),
        })

        const name = yield* Option.match(nameArg, {
          onSome: (name) => validateNameInput(name),
          onNone: () =>
            Prompt.text({
              message: "Enter name for the marathon:",
              validate: (value) =>
                validateNameInput(value).pipe(
                  Effect.mapError((error) => error.message)
                ),
            }),
        })

        const result = yield* db.marathonsQueries.createMarathon({
          data: {
            domain,
            name,
          },
        })
        yield* terminal.display(`Marathon ${result.name} successfully created`)
        return result
      })

      return { create }
    }),
  }
) {}
