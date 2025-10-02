import { MarathonCreationCliService } from "@/services/marathon-create-service"
import { Command, Options } from "@effect/cli"
import { Effect, Option, Array } from "effect"

const domainArg = Options.text("domain").pipe(
  Options.withDescription("The domain of the marathon (e.g. sthlm2025)"),
  Options.optional
)

const nameArg = Options.text("name").pipe(
  Options.withDescription(
    "The name of the marathon (e.g. Stockholm Fotomaraton)"
  ),
  Options.optional
)

const classesArg = Options.text("classes").pipe(
  Options.withDescription(
    "The classes of the marathon with number of photos in format: '4 hours:12'"
  ),
  Options.repeated,
  Options.map((classes) =>
    classes
      .map((c) => c.split(":").map((c) => c.trim()))
      .map(([name, numberOfPhotos]) => ({
        name: name ?? "",
        numberOfPhotos: Number(numberOfPhotos),
      }))
  ),
  Options.map((classes) =>
    Array.isEmptyArray(classes) ? Option.none() : Option.some(classes)
  )
)

export const marathonCreateCommand = Command.make("marathon:create", {
  domainArg,
  nameArg,
  classesArg,
}).pipe(
  Command.withDescription(
    "Create a new marathon. Optionally provide the domain and name as arguments or fill in the prompts."
  ),
  Command.withHandler(({ domainArg, nameArg, classesArg }) =>
    MarathonCreationCliService.pipe(
      Effect.andThen((service) =>
        service.create({
          domainArg,
          nameArg,
          classesArg,
        })
      )
    )
  )
)
