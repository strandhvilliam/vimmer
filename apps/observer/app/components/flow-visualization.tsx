"use client"

import type { ReactNode } from "react"
import { useMounted } from "@/hooks/use-mounted"
import { sseAtom } from "@/lib/atoms"
import { RunStateEventSchema } from "@blikka/pubsub"
import { Atom, Result, useAtomValue } from "@effect-atom/atom-react"
import { Card, CardContent, CardHeader, CardTitle } from "@vimmer/ui/components/card"
import { Schema } from "effect"
import { motion } from "motion/react"

// Base atom: decode events from SSE messages
const runStateEventsAtom = Atom.make((get) => get(sseAtom("dev:upload-flow:*"))).pipe(
  Atom.mapResult((message) =>
    Schema.decodeUnknownSync(Schema.Array(RunStateEventSchema))(
      message.map((message) => message.payload)
    )
  )
)

// Derived atom: extract events array, handling all Result states
const eventsArrayAtom = runStateEventsAtom.pipe(
  Atom.map((result) =>
    Result.match(result, {
      onInitial: () => [] as RunStateEvent[],
      onFailure: () => [] as RunStateEvent[],
      onSuccess: (success) => success.value,
    })
  )
)

// Derived atom: check if there's an error
const hasErrorAtom = runStateEventsAtom.pipe(
  Atom.map((result) =>
    Result.match(result, {
      onInitial: () => false,
      onFailure: () => true,
      onSuccess: () => false,
    })
  )
)

// Family atom: compute flow steps based on events and expected processor count
const flowStepsAtom = Atom.family((expectedProcessorCount: number | null) =>
  eventsArrayAtom.pipe(Atom.map((events) => computeFlowSteps([...events], expectedProcessorCount)))
)

type RunStateEvent = Schema.Schema.Type<typeof RunStateEventSchema>

type StepStatus = "pending" | "running" | "success" | "error"

type FlowStepId =
  | "client"
  | "upload-processors"
  | "bus"
  | "validator"
  | "contact-sheet"
  | "zip-worker"

// Task name constants
const TASK_NAMES = {
  BUS_EVENT: "bus-event",
  VALIDATION_RUNNER: "validation-runner",
  CONTACT_SHEET_GENERATOR: "contact-sheet-generator",
  ZIP_WORKER: "zip-worker",
  UPLOAD_PROCESSOR_PREFIX: "upload-processor",
} as const

interface TaskInfo {
  readonly name: string
  readonly status: StepStatus
  readonly duration: number | null
  readonly error: string | null
  readonly lastUpdated: number | null
  readonly photo: PhotoKeyDetails | null
}

interface PhotoKeyDetails {
  readonly raw: string
  readonly domain: string
  readonly participantReference: string
  readonly topic: string
  readonly topicNumber: number | null
  readonly topicIndex: number | null
  readonly filename: string
  readonly identifier: string
}

interface FlowStep {
  readonly id: FlowStepId
  readonly label: string
  readonly description: string
  readonly status: StepStatus
  readonly task?: TaskInfo | null
  readonly processors?: readonly TaskInfo[]
}

const statusBadgeStyles: Record<StepStatus, string> = {
  pending: "bg-muted text-muted-foreground border border-dashed border-muted-foreground/40",
  running: "bg-blue-500/10 text-blue-600 border border-blue-500/30",
  success: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30",
  error: "bg-destructive/10 text-destructive border border-destructive/30",
}

const statusLabels: Record<StepStatus, string> = {
  pending: "Pending",
  running: "Running",
  success: "Completed",
  error: "Error",
}

interface FlowVisualizationProps {
  expectedProcessorCount?: number | null
}

export function FlowVisualization({ expectedProcessorCount = null }: FlowVisualizationProps) {
  const mounted = useMounted()
  const events = useAtomValue(eventsArrayAtom)
  const hasError = useAtomValue(hasErrorAtom)
  const steps = useAtomValue(flowStepsAtom(expectedProcessorCount))

  const hasPreview = (expectedProcessorCount ?? 0) > 0
  const shouldShowTimeline = hasPreview || events.length > 0

  let content: ReactNode
  if (!mounted) {
    content = <Placeholder message="Loading flow data..." />
  } else if (!shouldShowTimeline) {
    content = <Placeholder message="Select a competition class to preview the flow." />
  } else {
    content = (
      <>
        {hasError ? (
          <p className="mb-3 text-xs text-destructive">
            Live updates are unavailable. Showing expected flow instead.
          </p>
        ) : null}
        <FlowTimeline steps={steps} />
      </>
    )
  }

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">{content}</CardContent>
    </Card>
  )
}

interface FlowTimelineProps {
  steps: FlowStep[]
}

function FlowTimeline({ steps }: FlowTimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-4 w-px bg-border" />
      <div className="space-y-5">
        {steps.map((step, index) => (
          <FlowStepCard key={step.id} step={step} index={index} total={steps.length} />
        ))}
      </div>
    </div>
  )
}

interface FlowStepCardProps {
  step: FlowStep
  index: number
  total: number
}

function FlowStepCard({ step, index, total }: FlowStepCardProps) {
  const isLast = index === total - 1

  return (
    <motion.div
      layout
      className="relative pl-10"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <motion.span
        className="absolute left-2 top-4 z-10 h-4 w-4 rounded-full border bg-background"
        style={{ borderColor: "rgba(148,163,184,0.6)" }}
        animate={{
          scale: step.status === "running" ? [0.9, 1.1, 0.9] : 1,
          boxShadow:
            step.status === "running"
              ? "0 0 0 6px rgba(59,130,246,0.15)"
              : step.status === "success"
                ? "0 0 0 4px rgba(16,185,129,0.15)"
                : "0 0 0 0px rgba(0,0,0,0)",
        }}
        transition={{
          repeat: step.status === "running" ? Infinity : 0,
          duration: 1.4,
          ease: "easeInOut",
        }}
      />
      {!isLast && <div className="absolute left-3 top-8 bottom-0 w-px bg-border" />}
      <div className="rounded-lg border bg-card/40 p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{step.label}</p>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </div>
          <StatusBadge status={step.status} />
        </div>
        {step.task ? <TaskMeta task={step.task} /> : null}
        {step.id === "upload-processors" ? (
          <ProcessorGrid processors={step.processors ?? []} />
        ) : null}
        {step.task?.error ? (
          <p className="mt-3 text-xs font-medium text-destructive">Error: {step.task.error}</p>
        ) : null}
      </div>
    </motion.div>
  )
}

function ProcessorGrid({ processors }: { processors: readonly TaskInfo[] }) {
  if (processors.length === 0) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        Waiting for upload processors to pick up the photos...
      </p>
    )
  }

  return (
    <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-3">
      {processors.map((processor) => (
        <motion.div
          key={processor.photo?.identifier ?? processor.name}
          layout
          className={`rounded-md border px-2 py-2 text-xs font-medium ${
            statusBadgeStyles[processor.status]
          }`}
          initial={{ opacity: 0.4, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between gap-1">
            <span>{renderProcessorLabel(processor)}</span>
            <span className="text-[10px] font-semibold uppercase tracking-wide">
              {statusLabels[processor.status]}
            </span>
          </div>
          {processor.photo?.filename ? (
            <p className="mt-1 truncate text-[10px] font-normal text-muted-foreground">
              {processor.photo.filename}
            </p>
          ) : null}
          {processor.duration ? (
            <p className="mt-1 text-[10px] font-normal text-muted-foreground">
              {formatDuration(processor.duration)}
            </p>
          ) : null}
          {processor.error ? (
            <p className="mt-1 text-[10px] font-semibold text-destructive">{processor.error}</p>
          ) : null}
        </motion.div>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: StepStatus }) {
  return (
    <motion.span
      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${statusBadgeStyles[status]}`}
      animate={{
        opacity: status === "pending" ? 0.7 : 1,
        scale: status === "running" ? [1, 1.05, 1] : 1,
      }}
      transition={{
        repeat: status === "running" ? Infinity : 0,
        duration: 1.2,
        ease: "easeInOut",
      }}
    >
      {statusLabels[status]}
    </motion.span>
  )
}

function TaskMeta({ task }: { task: TaskInfo }) {
  const durationLabel = formatDuration(task.duration)
  const timeLabel = formatTimestamp(task.lastUpdated)

  if (!durationLabel && !timeLabel) {
    return null
  }

  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {durationLabel ? <span>Duration: {durationLabel}</span> : null}
      {timeLabel ? <span>Updated: {timeLabel}</span> : null}
    </div>
  )
}

function Placeholder({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

// Pure function: compute flow steps from events and expected processor count
function computeFlowSteps(
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

function renderProcessorLabel(task: TaskInfo): string {
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

function formatDuration(duration: number | null | undefined): string | null {
  if (!duration) {
    return null
  }
  if (duration < 1000) {
    return `${duration}ms`
  }
  return `${(duration / 1000).toFixed(1)}s`
}

function formatTimestamp(timestamp: number | null): string | null {
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
