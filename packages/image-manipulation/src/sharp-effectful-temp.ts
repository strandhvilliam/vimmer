import { Data, Effect } from "effect"
import type { Sharp } from "sharp"
import sharp from "sharp"

export class SharpError extends Data.TaggedError("SharpError")<{
  message?: string
  cause?: unknown
}> {}

export type EffectSharp = {
  [K in keyof Sharp]: Sharp[K] extends (...args: []) => Promise<infer R>
    ? () => Effect.Effect<R, SharpError>
    : Sharp[K] extends (...args: [infer A]) => Promise<infer R>
      ? (arg?: A) => Effect.Effect<R, SharpError>
      : Sharp[K] extends (...args: infer A) => Promise<infer R>
        ? (...args: A) => Effect.Effect<R, SharpError>
        : Sharp[K] extends (...args: infer A) => Sharp
          ? (...args: A) => EffectSharp
          : Sharp[K]
}

const wrapSharp = (sharp: Sharp): EffectSharp =>
  new Proxy(sharp, {
    get: (target, prop, receiver) => {
      const original = Reflect.get(target, prop, receiver)
      if (typeof original !== "function") {
        return original
      }
      return (...args: unknown[]) => {
        const result = original.apply(target, args)

        if (result instanceof Promise) {
          return Effect.tryPromise({
            try: () => result,
            catch: (error) =>
              new SharpError({
                cause: error,
                message: `Failed to execute ${String(prop)} on Sharp`,
              }),
          })
        }
        if (result && result.constructor?.name === "Sharp") {
          return wrapSharp(result)
        }
        return result
      }
    },
  }) as unknown as EffectSharp

export class SharpEffectfulTemp extends Effect.Service<SharpEffectfulTemp>()(
  "@blikka/packages/image-manipulation/sharp-effectful-temp",
  {
    dependencies: [],
    effect: Effect.gen(function* () {
      const fromBuffer = (
        buffer: Buffer
      ): Effect.Effect<EffectSharp, SharpError, never> =>
        Effect.try({
          try: () => wrapSharp(sharp(buffer)),
          catch: (err) =>
            new SharpError({
              cause: err,
              message: "Failed to create Sharp instance",
            }),
        })

      return {
        fromBuffer,
      }
    }),
  }
) {}
