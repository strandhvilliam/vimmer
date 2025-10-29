import { Data, Effect, Layer, ManagedRuntime, Schema } from "effect"
import { HttpApp, HttpServerRequest, HttpServerResponse } from "@effect/platform"

class SearchParamParseError extends Data.TaggedError("SearchParamParseError")<{
  message: string
  cause?: unknown
}> {}

export const parseSearchParams = Effect.fn("Utils.parseSearchParams")(function* <T>(
  request: HttpServerRequest.HttpServerRequest,
  schema: Schema.Schema<T>
) {
  return yield* Effect.try(
    () => new URLSearchParams(new URL(request.originalUrl).searchParams)
  ).pipe(
    Effect.andThen((searchParams) =>
      Schema.decodeUnknown(schema)(Object.fromEntries(searchParams.entries()))
    ),
    Effect.mapError(
      (error) => new SearchParamParseError({ message: error.message, cause: error.cause })
    )
  )
})

export const createEffectWebHandler = async <R, E>(
  layer: Layer.Layer<R, E>,
  program: Effect.Effect<
    HttpServerResponse.HttpServerResponse,
    never,
    R | HttpServerRequest.HttpServerRequest
  >
) => {
  const managedRuntime = ManagedRuntime.make(layer)
  const runtime = await managedRuntime.runtime()
  return HttpApp.toWebHandlerRuntime(runtime)(program)
}
