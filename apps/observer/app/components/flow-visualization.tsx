"use client"

import type { ReactNode } from "react"
import { useMounted } from "@/hooks/use-mounted"
import { useDelayedStepStatuses } from "@/hooks/use-delayed-step-statuses"
import { sseAtom } from "@/lib/atoms"
import { RunStateEvent, RunStateEventSchema } from "@blikka/pubsub"
import { Atom, Result, useAtomValue } from "@effect-atom/atom-react"
import { Card, CardContent, CardHeader, CardTitle } from "@vimmer/ui/components/card"
import { Schema } from "effect"
import { motion } from "motion/react"
import {
  computeFlowSteps,
  formatDuration,
  formatTimestamp,
  renderProcessorLabel,
  statusBadgeStyles,
  statusLabels,
} from "@/lib/utils"
import { FlowStep, StepStatus, TaskInfo } from "@/lib/types"

const runStateEventsAtom = Atom.make((get) => get(sseAtom("dev:upload-flow:*"))).pipe(
  Atom.mapResult((message) =>
    Schema.decodeUnknownSync(Schema.Array(RunStateEventSchema))(
      message.map((message) => message.payload)
    )
  )
)

const eventsArrayAtom = runStateEventsAtom.pipe(
  Atom.map((result) =>
    Result.match(result, {
      onInitial: () => [] as RunStateEvent[],
      onFailure: () => [] as RunStateEvent[],
      onSuccess: (success) => success.value,
    })
  )
)

const hasErrorAtom = runStateEventsAtom.pipe(
  Atom.map((result) =>
    Result.match(result, {
      onInitial: () => false,
      onFailure: () => true,
      onSuccess: () => false,
    })
  )
)

const flowStepsAtom = Atom.family((expectedProcessorCount: number | null) =>
  eventsArrayAtom.pipe(Atom.map((events) => computeFlowSteps([...events], expectedProcessorCount)))
)

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
  const stepsWithDelayedStatuses = useDelayedStepStatuses(steps)

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-4 w-px bg-border" />
      <div className="space-y-5">
        {stepsWithDelayedStatuses.map((step, index) => (
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
