"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"

interface FlowVisualizationProps {
  stepStates: Record<string, "pending" | "running" | "done" | "error">
  numberOfPhotos: number
  hasImagesSelected: boolean
}

function StepBox({
  id,
  name,
  state,
}: {
  id: string
  name: string
  state: "pending" | "running" | "done" | "error"
}) {
  const isActive = state === "running"
  const isDone = state === "done"
  const hasError = state === "error"

  return (
    <div
      className={[
        "rounded-md border px-3 py-2 text-sm min-w-[140px] text-center",
        isActive && "border-amber-500 bg-amber-50",
        isDone && "border-emerald-500 bg-emerald-50",
        hasError && "border-red-500 bg-red-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <p className="font-medium text-xs">{name}</p>
      <p className="text-xs text-muted-foreground">
        {hasError
          ? "error"
          : isDone
            ? "done"
            : isActive
              ? "running"
              : "queued"}
      </p>
    </div>
  )
}

function ArrowConnector({ type }: { type: "split" | "merge" | "straight" }) {
  if (type === "straight") {
    return (
      <div className="flex items-center justify-center min-w-[40px]">
        <div className="w-full h-0.5 bg-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-w-[40px] relative">
      {/* Main horizontal line */}
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-muted-foreground" />
      {/* Vertical connector line */}
      <div className="absolute left-1/2 top-1/2 bottom-1/2 w-0.5 bg-muted-foreground" />
    </div>
  )
}

export function FlowVisualization({
  stepStates,
  numberOfPhotos,
  hasImagesSelected,
}: FlowVisualizationProps) {
  if (numberOfPhotos === 0) {
    return (
      <Card className="h-full flex flex-col overflow-hidden">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="font-semibold">Flow Visualisation</CardTitle>
          <CardDescription>Live status of @upload-processor pipeline</CardDescription>
        </CardHeader>
        <CardContent className="overflow-auto flex-1 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Select a competition class to see the flow</p>
        </CardContent>
      </Card>
    )
  }

  const startState = hasImagesSelected ? (stepStates["flow-started"] || "done") : "pending"
  const uploadProcessors = Array.from({ length: numberOfPhotos }, (_, i) => ({
    id: `upload-processor-${i}`,
    name: `Process ${i + 1}`,
    state: stepStates[`upload-processor-${i}`] || "pending",
  }))

  const busState = stepStates["bus"] || "pending"

  const workers = [
    { id: "zip-worker", name: "Zip Worker", state: stepStates["zip-worker"] || "pending" },
    {
      id: "contact-sheet",
      name: "Contact Sheet Generator",
      state: stepStates["contact-sheet"] || "pending",
    },
    {
      id: "validator",
      name: "Validation Runner",
      state: stepStates["validator"] || "pending",
    },
  ]

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Flow Visualisation</CardTitle>
        <CardDescription>Live status of @upload-processor pipeline</CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto flex-1 p-6">
        <div className="flex items-center justify-center gap-4 h-full">
          {/* Start Node */}
          <div className="flex flex-col items-center">
            <StepBox id="start" name="Start" state={startState} />
          </div>

          {/* Connector from Start to Processes */}
          <div className="flex flex-col items-center min-w-[60px] relative">
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Horizontal line from Start */}
              <line
                x1="0"
                y1="50%"
                x2="30%"
                y2="50%"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
              {/* Vertical branch line */}
              <line
                x1="30%"
                y1="10%"
                x2="30%"
                y2="90%"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
              {/* Lines to each process */}
              {uploadProcessors.map((_, index) => {
                const boxHeight = 60
                const gap = 12
                const totalHeight = uploadProcessors.length * boxHeight + (uploadProcessors.length - 1) * gap
                const startY = 50 - (totalHeight / 2)
                const y = startY + index * (boxHeight + gap) + boxHeight / 2
                return (
                  <line
                    key={index}
                    x1="30%"
                    y1={`${y}%`}
                    x2="100%"
                    y2={`${y}%`}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
          </div>

          {/* Process Nodes (parallel, vertical stack) */}
          <div className="flex flex-col gap-3 items-center">
            {uploadProcessors.map((processor) => (
              <StepBox
                key={processor.id}
                id={processor.id}
                name={processor.name}
                state={processor.state}
              />
            ))}
          </div>

          {/* Connector from Processes to Eventbridge */}
          <div className="flex flex-col items-center min-w-[60px] relative">
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Lines from each process */}
              {uploadProcessors.map((_, index) => {
                const boxHeight = 60
                const gap = 12
                const totalHeight = uploadProcessors.length * boxHeight + (uploadProcessors.length - 1) * gap
                const startY = 50 - (totalHeight / 2)
                const y = startY + index * (boxHeight + gap) + boxHeight / 2
                return (
                  <line
                    key={index}
                    x1="0%"
                    y1={`${y}%`}
                    x2="70%"
                    y2={`${y}%`}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="2"
                  />
                )
              })}
              {/* Converging lines */}
              {uploadProcessors.map((_, index) => {
                const boxHeight = 60
                const gap = 12
                const totalHeight = uploadProcessors.length * boxHeight + (uploadProcessors.length - 1) * gap
                const startY = 50 - (totalHeight / 2)
                const y = startY + index * (boxHeight + gap) + boxHeight / 2
                return (
                  <line
                    key={index}
                    x1="70%"
                    y1={`${y}%`}
                    x2="70%"
                    y2="50%"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="2"
                  />
                )
              })}
              {/* Horizontal line to Eventbridge */}
              <line
                x1="70%"
                y1="50%"
                x2="100%"
                y2="50%"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
            </svg>
          </div>

          {/* Eventbridge Node */}
          <div className="flex flex-col items-center">
            <StepBox id="bus" name="Eventbridge" state={busState} />
          </div>

          {/* Connector from Eventbridge to Workers */}
          <div className="flex flex-col items-center min-w-[60px] relative">
            <svg
              className="absolute inset-0 w-full h-full"
              style={{ pointerEvents: "none" }}
            >
              {/* Horizontal line from Eventbridge */}
              <line
                x1="0"
                y1="50%"
                x2="30%"
                y2="50%"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
              {/* Vertical branch line */}
              <line
                x1="30%"
                y1="10%"
                x2="30%"
                y2="90%"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
              />
              {/* Lines to each worker */}
              {workers.map((_, index) => {
                const boxHeight = 60
                const gap = 12
                const totalHeight = workers.length * boxHeight + (workers.length - 1) * gap
                const startY = 50 - (totalHeight / 2)
                const y = startY + index * (boxHeight + gap) + boxHeight / 2
                return (
                  <line
                    key={index}
                    x1="30%"
                    y1={`${y}%`}
                    x2="100%"
                    y2={`${y}%`}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
          </div>

          {/* Worker Nodes (parallel, vertical stack) */}
          <div className="flex flex-col gap-3 items-center">
            {workers.map((worker) => (
              <StepBox key={worker.id} id={worker.id} name={worker.name} state={worker.state} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
