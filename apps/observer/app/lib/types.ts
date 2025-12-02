import { RunStateEventSchema } from "@blikka/pubsub"
import { Schema } from "effect"

export type RunStateEvent = Schema.Schema.Type<typeof RunStateEventSchema>

export type StepStatus = "pending" | "running" | "success" | "error"

export type FlowStepId =
  | "client"
  | "upload-processors"
  | "bus"
  | "validator"
  | "contact-sheet"
  | "zip-worker"

export interface TaskInfo {
  readonly name: string
  readonly status: StepStatus
  readonly duration: number | null
  readonly error: string | null
  readonly lastUpdated: number | null
  readonly photo: PhotoKeyDetails | null
}

export interface PhotoKeyDetails {
  readonly raw: string
  readonly domain: string
  readonly participantReference: string
  readonly topic: string
  readonly topicNumber: number | null
  readonly topicIndex: number | null
  readonly filename: string
  readonly identifier: string
}

export interface FlowStep {
  readonly id: FlowStepId
  readonly label: string
  readonly description: string
  readonly status: StepStatus
  readonly task?: TaskInfo | null
  readonly processors?: readonly TaskInfo[]
}
