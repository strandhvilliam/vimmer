import { Data, Effect, Layer, ManagedRuntime, Schema } from "effect"
import { HttpApp, HttpServerRequest, HttpServerResponse } from "@effect/platform"
import { RunStateEvent } from "@blikka/pubsub"
import { FlowStep, PhotoKeyDetails, StepStatus, TaskInfo } from "./types"

class SearchParamParseError extends Data.TaggedError("SearchParamParseError")<{
  message: string
  cause?: unknown
}> {}

export const TASK_NAMES = {
  BUS_EVENT: "bus-event",
  VALIDATION_RUNNER: "validation-runner",
  CONTACT_SHEET_GENERATOR: "contact-sheet-generator",
  ZIP_WORKER: "zip-worker",
  UPLOAD_PROCESSOR_PREFIX: "upload-processor",
} as const

export const statusBadgeStyles: Record<StepStatus, string> = {
  pending: "bg-muted text-muted-foreground border border-dashed border-muted-foreground/40",
  running: "bg-blue-500/10 text-blue-600 border border-blue-500/30",
  success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
  error: "bg-destructive/10 text-destructive border border-destructive/30",
}

export const statusLabels: Record<StepStatus, string> = {
  pending: "Pending",
  running: "Running",
  success: "Completed",
  error: "Error",
}

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

export const InitialMessagePayload = Schema.Struct({
  message: Schema.String,
})

export function computeFlowSteps(
  events: RunStateEvent[],
  expectedProcessorCount: number | null
): FlowStep[] {
  const groupedByTask = groupEventsByTask(events)
  const processors = ensureProcessorSlots(
    getProcessorTasks(groupedByTask),
    expectedProcessorCount ?? null
  )
  const busTask = getTaskInfo(TASK_NAMES.BUS_EVENT, groupedByTask)
  const validatorTask = getTaskInfo(TASK_NAMES.VALIDATION_RUNNER, groupedByTask)
  const contactTask = getTaskInfo(TASK_NAMES.CONTACT_SHEET_GENERATOR, groupedByTask)
  const zipTask = getTaskInfo(TASK_NAMES.ZIP_WORKER, groupedByTask)
  const clientStatus = resolveClientStatus(processors)

  return [
    {
      id: "client",
      label: "Application Start & Upload",
      description: "User selects photos and pushes them to storage from the client.",
      status: clientStatus,
    },
    {
      id: "upload-processors",
      label: `Upload Processor${processors.length === 1 ? "" : "s"}`,
      description:
        "Each photo is processed concurrently by its own upload-processor worker (managed by infrastructure).",
      status: deriveGroupStatus(processors),
      processors,
    },
    {
      id: "bus",
      label: "EventBridge Bus Trigger",
      description: "When all uploads finish, the bus fans out additional work.",
      status: busTask?.status ?? "pending",
      task: busTask,
    },
    {
      id: "validator",
      label: "Validation",
      description:
        "Validates images and metadata (runs concurrently with contact sheet and zip generation).",
      status: validatorTask?.status ?? "pending",
      task: validatorTask,
    },
    {
      id: "contact-sheet",
      label: "Contact Sheet Generation",
      description:
        "Generates a low-res sheet for quick review (runs concurrently with validation and zip generation).",
      status: contactTask?.status ?? "pending",
      task: contactTask,
    },
    {
      id: "zip-worker",
      label: "Zip Generation",
      description:
        "Bundles all processed assets into a downloadable archive (runs concurrently with validation and contact sheet).",
      status: zipTask?.status ?? "pending",
      task: zipTask,
    },
  ]
}

function groupEventsByTask(events: readonly RunStateEvent[]): Record<string, RunStateEvent[]> {
  return events.reduce<Record<string, RunStateEvent[]>>((acc, event) => {
    acc[event.taskName] ??= []
    acc[event.taskName]?.push(event)
    return acc
  }, {})
}

function getTaskInfo(taskName: string, grouped: Record<string, RunStateEvent[]>): TaskInfo | null {
  const events = grouped[taskName]
  if (!events || events.length === 0) {
    return null
  }
  return deriveTaskInfo(taskName, events)
}

function getProcessorTasks(grouped: Record<string, RunStateEvent[]>): readonly TaskInfo[] {
  const processorTasks: TaskInfo[] = []

  Object.entries(grouped)
    .filter(([task]) => task.startsWith(TASK_NAMES.UPLOAD_PROCESSOR_PREFIX))
    .forEach(([taskName, events]) => {
      // Group upload-processor events by photo (domain + reference + orderIndex)
      // Only events with orderIndex are for individual photos
      const eventsByPhoto = groupEventsByPhoto(events)

      if (eventsByPhoto.size === 0) {
        // No events with orderIndex, treat as a single task (shouldn't happen for upload-processor)
        processorTasks.push(deriveTaskInfo(taskName, events))
        return
      }

      // Create a task info for each photo
      for (const [photoId, photoEvents] of eventsByPhoto) {
        const photoDetails = extractPhotoDetailsFromEvents(photoEvents)
        const info = deriveTaskInfo(`${taskName}-${photoId}`, photoEvents)
        const taskInfo: TaskInfo = {
          ...info,
          photo: photoDetails,
          name: photoDetails?.identifier ?? photoId ?? info.name,
        }
        processorTasks.push(taskInfo)
      }
    })

  return processorTasks.sort(compareTaskInfo)
}

function compareTaskInfo(a: TaskInfo, b: TaskInfo): number {
  const indexA = a.photo?.topicIndex
  const indexB = b.photo?.topicIndex

  if (indexA != null && indexB != null && indexA !== indexB) {
    return indexA - indexB
  }
  if (indexA != null) return -1
  if (indexB != null) return 1
  return a.name.localeCompare(b.name)
}

function deriveTaskInfo(taskName: string, events: RunStateEvent[]): TaskInfo {
  if (events.length === 0) {
    return {
      name: taskName,
      status: "pending",
      duration: null,
      error: null,
      lastUpdated: null,
      photo: null,
    }
  }

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp)

  // Find events in a single pass
  let hasStart = false
  let endEvent: RunStateEvent | null = null
  let onceEvent: RunStateEvent | null = null
  const lastEvent = sorted[sorted.length - 1] ?? null

  // Search backwards for end/once events (most recent first)
  // Note: 'end' is definitive completion, 'once' is a one-time event that won't receive an 'end'
  // (e.g., bus trigger events use 'once' because they don't send completion events)
  for (let i = sorted.length - 1; i >= 0; i--) {
    const event = sorted[i]
    if (!event) continue

    if (event.state === "end" && !endEvent) {
      endEvent = event
    } else if (event.state === "once" && !onceEvent) {
      onceEvent = event
    }
  }

  // Search forwards for start event (can break early)
  for (const event of sorted) {
    if (event.state === "start") {
      hasStart = true
      break
    }
  }

  const referenceEvent = endEvent ?? onceEvent ?? lastEvent

  let status: StepStatus = "pending"
  if (endEvent) {
    status = endEvent.error ? "error" : "success"
  } else if (onceEvent) {
    status = onceEvent.error ? "error" : "success"
  } else if (hasStart) {
    status = "running"
  }

  return {
    name: taskName,
    status,
    duration: endEvent?.duration ?? onceEvent?.duration ?? null,
    error: endEvent?.error ?? onceEvent?.error ?? null,
    lastUpdated: referenceEvent?.timestamp ?? null,
    photo: null,
  }
}

function deriveGroupStatus(tasks: readonly TaskInfo[]): StepStatus {
  if (tasks.length === 0) return "pending"
  if (tasks.some((task) => task.status === "error")) return "error"
  if (tasks.every((task) => task.status === "success")) return "success"
  if (tasks.some((task) => task.status === "running")) return "running"
  return "pending"
}

export function renderProcessorLabel(task: TaskInfo): string {
  if (task.photo) {
    const topicLabel = task.photo.topic.padStart(2, "0")
    return `Topic ${topicLabel} · ${task.photo.participantReference}`
  }

  const suffixMatch = task.name.match(/(\d+)$/)
  if (suffixMatch) {
    return `Photo ${Number.parseInt(suffixMatch[1] ?? "0", 10) + 1}`
  }
  return task.name.replace(TASK_NAMES.UPLOAD_PROCESSOR_PREFIX, "Photo")
}

function resolveClientStatus(processors: readonly TaskInfo[]): StepStatus {
  return deriveGroupStatus(processors)
}

function ensureProcessorSlots(
  processors: readonly TaskInfo[],
  expectedCount: number | null
): readonly TaskInfo[] {
  if (!expectedCount || expectedCount <= 0) {
    return processors
  }

  const indexed = new Map<number, TaskInfo>()
  const extras: TaskInfo[] = []

  for (const processor of processors) {
    const index = processor.photo?.topicIndex ?? extractProcessorIndex(processor.name)
    if (index === null || index < 0 || index >= expectedCount) {
      extras.push(processor)
      continue
    }
    indexed.set(index, processor)
  }

  const ordered: TaskInfo[] = []
  for (let i = 0; i < expectedCount; i++) {
    ordered.push(
      indexed.get(i) ?? createPendingTaskInfo(`${TASK_NAMES.UPLOAD_PROCESSOR_PREFIX}-${i}`)
    )
  }

  return [...ordered, ...extras]
}

function createPendingTaskInfo(name: string): TaskInfo {
  return {
    name,
    status: "pending",
    duration: null,
    error: null,
    lastUpdated: null,
    photo: null,
  }
}

function extractProcessorIndex(taskName: string): number | null {
  const match = taskName.match(/(\d+)$/)
  if (!match) {
    return null
  }
  return Number.parseInt(match[1] ?? "0", 10)
}

export function formatDuration(duration: number | null | undefined): string | null {
  if (!duration) {
    return null
  }
  if (duration < 1000) {
    return `${duration}ms`
  }
  return `${(duration / 1000).toFixed(1)}s`
}

export function formatTimestamp(timestamp: number | null): string | null {
  if (!timestamp) {
    return null
  }
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function groupEventsByPhoto(events: readonly RunStateEvent[]): Map<string, RunStateEvent[]> {
  const map = new Map<string, RunStateEvent[]>()
  for (const event of events) {
    // Only group events that have orderIndex (upload-processor events for individual photos)
    // Events without orderIndex are for the whole flow and shouldn't be grouped by photo
    if (event.orderIndex === null) {
      continue
    }

    const photoId = createPhotoId(event.domain, event.reference, event.orderIndex)
    const bucket = map.get(photoId)
    if (bucket) {
      bucket.push(event)
    } else {
      map.set(photoId, [event])
    }
  }
  return map
}

function createPhotoId(
  domain: string | null,
  reference: string | null,
  orderIndex: number
): string {
  const domainPart = domain ?? "unknown"
  const referencePart = reference ?? "unknown"
  return `${domainPart}-${referencePart}-${orderIndex}`
}

function extractPhotoDetailsFromEvents(events: readonly RunStateEvent[]): PhotoKeyDetails | null {
  if (events.length === 0) {
    return null
  }

  // Find an event with orderIndex (upload-processor events only)
  const event = events.find(
    (e) => e.domain !== null && e.reference !== null && e.orderIndex !== null
  )

  if (!event) {
    return null
  }

  const domain = event.domain
  const reference = event.reference
  const orderIndex = event.orderIndex

  // orderIndex should always be present at this point, but double-check
  if (!domain || !reference || orderIndex === null) {
    return null
  }

  // orderIndex is 0-based (topicIndex), so topicNumber = orderIndex + 1
  const topicNumber = orderIndex + 1
  const topic = String(topicNumber).padStart(2, "0")
  const topicIndex = orderIndex

  // We don't have filename in the schema, so we'll use a placeholder or derive from identifier
  const filename = `${domain}-${reference}-${topic}.jpg`
  const identifier = `${domain}-${reference}-${topic}`
  const raw = `${domain}/${reference}/${topic}/${filename}`

  return {
    raw,
    domain,
    participantReference: reference,
    topic,
    topicNumber,
    topicIndex,
    filename,
    identifier,
  }
}
