"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

type PipelineState = "pending" | "running" | "done" | "error" | undefined

interface ValidationsPanelProps {
  validationStates: {
    validator?: PipelineState
    contactSheet?: PipelineState
    zipWorker?: PipelineState
  }
}

export function ValidationsPanel({ validationStates }: ValidationsPanelProps) {
  const pipelineSteps = [
    {
      key: "validator",
      title: "Photo validation",
      description: "Duplicates, EXIF window, image count",
      state: validationStates.validator,
    },
    {
      key: "contactSheet",
      title: "Contact sheet",
      description: "Generate printable summary",
      state: validationStates.contactSheet,
    },
    {
      key: "zipWorker",
      title: "Zip export",
      description: "Bundle originals for archive",
      state: validationStates.zipWorker,
    },
  ] as const

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Validations</CardTitle>
        <CardDescription>Live status for every automated check in the run</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6 overflow-hidden flex-1">
        <section className="rounded-2xl border bg-card/80 p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm font-semibold">Validation flow</p>
              <p className="text-xs text-muted-foreground">
                Validation, contact sheet, and zip run automatically
              </p>
            </div>
            <StatusTag state={overallValidationState(validationStates)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {pipelineSteps.map((step) => (
              <div key={step.key} className="rounded-xl border p-3 bg-background/60 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{step.title}</p>
                  <StatusTag state={step.state} compact />
                </div>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border bg-card/60 p-4 space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-base font-semibold text-foreground">
            {renderStatusIcon(validationStates.validator)}
            <span>Validation status</span>
          </div>
          {renderValidationCopy(validationStates.validator)}
        </section>
      </CardContent>
    </Card>
  )
}

function renderValidationCopy(state: PipelineState) {
  if (state === "error") {
    return [
      <p key="issue" className="text-red-500">
        Validation failed — review the logs for details.
      </p>,
      <p key="next">No artifacts will be published until the issues are resolved.</p>,
    ]
  }
  if (state === "running") {
    return [
      <p key="running" className="text-amber-600">
        Validation is running — hang tight while the checks finish.
      </p>,
      <p key="checks">Duplicates, timestamps, and counts are verified automatically.</p>,
    ]
  }
  if (state === "done") {
    return [
      <p key="success" className="text-emerald-600">
        All checks passed — images match the expected count and window.
      </p>,
      <p key="followup">Artifacts are ready as soon as uploads finish processing.</p>,
    ]
  }
  return [
    <p key="pending">Validation will start as soon as uploads complete.</p>,
    <p key="reminder">You do not have to trigger anything manually — everything runs in order.</p>,
  ]
}

function StatusTag({ state, compact }: { state: PipelineState; compact?: boolean }) {
  const { label, className } = mapStatusToVisuals(state)
  const padding = compact ? "px-2 py-0.5" : "px-3 py-1"
  return (
    <span
      className={`inline-flex items-center rounded-full ${padding} text-xs font-semibold capitalize ${className}`}
    >
      {label}
    </span>
  )
}

function mapStatusToVisuals(state: PipelineState): { label: string; className: string } {
  switch (state) {
    case "done":
      return { label: "Success", className: "bg-emerald-100 text-emerald-700" }
    case "running":
      return { label: "Running", className: "bg-amber-100 text-amber-700" }
    case "error":
      return { label: "Error", className: "bg-rose-100 text-rose-700" }
    case "pending":
    default:
      return { label: "Pending", className: "bg-muted text-muted-foreground" }
  }
}

function overallValidationState(states: ValidationsPanelProps["validationStates"]): PipelineState {
  if (
    states.validator === "error" ||
    states.contactSheet === "error" ||
    states.zipWorker === "error"
  ) {
    return "error"
  }
  if (
    states.validator === "done" &&
    states.contactSheet === "done" &&
    states.zipWorker === "done"
  ) {
    return "done"
  }
  if (
    states.validator === "running" ||
    states.contactSheet === "running" ||
    states.zipWorker === "running"
  ) {
    return "running"
  }
  return "pending"
}

function renderStatusIcon(state: PipelineState) {
  if (state === "done") {
    return <CheckCircle2 className="h-4 w-4 text-emerald-600" />
  }
  if (state === "running") {
    return <Loader2 className="h-4 w-4 text-amber-500 animate-spin" />
  }
  if (state === "error") {
    return <AlertCircle className="h-4 w-4 text-rose-600" />
  }
  return <Loader2 className="h-4 w-4 text-muted-foreground" />
}
