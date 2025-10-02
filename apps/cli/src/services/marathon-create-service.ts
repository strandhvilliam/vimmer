import { Terminal } from "@effect/platform"
import { Prompt } from "@effect/cli"
import { Effect, Option, Data, Console } from "effect"
import { Database } from "@blikka/db"
import { DOMAIN_MIN_LENGTH } from "../constants"
import { QuitException } from "@effect/platform/Terminal"

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

      const validateNumberOfPhotosInput = Effect.fn(
        "MarathonCreationCliService.validateNumberOfPhotosInput"
      )(function* (value: number) {
        if (value < 1) {
          return yield* new MarathonInputError({
            message: "Number of photos must be at least 1\n",
          })
        }
        return yield* Effect.succeed(value)
      })

      const validateClasses = Effect.fn(
        "MarathonCreationCliService.validateClasses"
      )(function* (classes: { name: string; numberOfPhotos: number }[]) {
        return yield* Effect.forEach(classes, (c) =>
          Effect.gen(function* () {
            const name = yield* validateNameInput(c.name)
            const numberOfPhotos = yield* validateNumberOfPhotosInput(
              c.numberOfPhotos
            )
            return yield* Effect.succeed({ name, numberOfPhotos })
          })
        )
      })

      const promptAndValidateDomain = Effect.fn(
        "MarathonCreationCliService.promptDomain"
      )(function* () {
        return yield* Prompt.text({
          message: "Enter subdomain to be used in the url (e.g. sthlm2025):",
          validate: (value) =>
            validateDomainInput(value).pipe(
              Effect.mapError((error) => error.message)
            ),
        })
      })

      const promptAndValidateName = Effect.fn(
        "MarathonCreationCliService.promptName"
      )(function* () {
        return yield* Prompt.text({
          message: "Enter name for the marathon:",
          validate: (value) =>
            validateNameInput(value).pipe(
              Effect.mapError((error) => error.message)
            ),
        })
      })

      const promptAndValidateClasses = Effect.fn(
        "MarathonCreationCliService.promptClasses"
      )(function* () {
        return yield* Effect.iterate(
          {
            classes: [] as { name: string; numberOfPhotos: number }[],
            shouldContinue: true,
          },
          {
            while: (state) => !!state.shouldContinue,
            body: (state) =>
              Effect.gen(function* () {
                const name = yield* Prompt.text({
                  message: "Enter class name:",
                  validate: (value) =>
                    validateNameInput(value).pipe(
                      Effect.mapError((error) => error.message)
                    ),
                })
                const numberOfPhotos = yield* Prompt.integer({
                  message: "Enter number of photos:",
                  validate: (value) =>
                    validateNumberOfPhotosInput(value).pipe(
                      Effect.mapError((error) => error.message)
                    ),
                })

                const newClasses = [...state.classes, { name, numberOfPhotos }]

                yield* terminal.display(
                  `Class '${name}' (${numberOfPhotos}) added!\n\n`
                )

                const addAnother = yield* Prompt.confirm({
                  message: "Add another class?",
                })

                return {
                  classes: newClasses,
                  shouldContinue: addAnother,
                }
              }),
          }
        ).pipe(Effect.map((result) => result.classes))
      })

      const create = Effect.fn("MarathonCreationCliService.create")(function* ({
        domainArg,
        nameArg,
        classesArg,
      }: {
        domainArg: Option.Option<string>
        nameArg: Option.Option<string>
        classesArg: Option.Option<{ name: string; numberOfPhotos: number }[]>
      }) {
        const domain = yield* Option.match(domainArg, {
          onSome: validateDomainInput,
          onNone: promptAndValidateDomain,
        })
        const name = yield* Option.match(nameArg, {
          onSome: validateNameInput,
          onNone: promptAndValidateName,
        })
        const classes = yield* Option.match(classesArg, {
          onNone: promptAndValidateClasses,
          onSome: validateClasses,
        })

        const newMarathon = yield* db.marathonsQueries.createMarathon({
          data: {
            domain,
            name,
          },
        })

        const createdClasses =
          yield* db.competitionClassesQueries.createMultipleCompetitionClasses({
            data: classes.map((c) => ({
              name: c.name,
              numberOfPhotos: c.numberOfPhotos,
              marathonId: newMarathon.id,
            })),
          })

        return yield* terminal.display(
          `Marathon '${name}' created with ${createdClasses.length} classes!\n\n`
        )
      })

      return { create } as const
    }),
  }
) {}
