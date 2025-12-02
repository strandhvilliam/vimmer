"use server"
import { Effect, pipe } from "effect"

const effectAction = Effect.fn("InitParticipant")(function* (
  participantReference: string,
  domain: string
) {
  return yield* Effect.succeed(true)
})

export const initParticipantAction = async (participantReference: string, domain: string) =>
  pipe(effectAction(participantReference, domain), Effect.runPromise)
