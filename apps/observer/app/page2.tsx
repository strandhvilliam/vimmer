"use client"

import { useEffect, useState } from "react"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@vimmer/ui/components/resizable"
import { UploadDialog } from "./components/upload-dialog"
import { ControlsPanel } from "./components/controls-panel"
import { FlowVisualization } from "./components/flow-visualization"
import { ValidationsPanel } from "./components/results-panel"
import { LogsPanel } from "./components/logs-panel"
import { useSSE } from "./hooks/use-sse"

interface RunStateEvent {
  state: "start" | "end"
  taskName: string
  timestamp: number
  error: string | null
  duration: number | null
}

interface UploadState {
  key: string
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
  thumbnail?: string
}

function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement("canvas")
        const size = 64
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext("2d")
        if (!ctx) {
          reject(new Error("Failed to get canvas context"))
          return
        }
        ctx.drawImage(img, 0, 0, size, size)
        resolve(canvas.toDataURL("image/jpeg", 0.8))
      }
      img.onerror = reject
      img.src = e.target?.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function ObserverDashboard() {
  const [presignedUrls, setPresignedUrls] = useState<Array<{ key: string; url: string }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [stepStates, setStepStates] = useState<
    Record<string, "pending" | "running" | "done" | "error">
  >({})
  const [isUploadFlowStarted, setIsUploadFlowStarted] = useState(false)
  const [reference, setReference] = useState("")
  const [uploadStates, setUploadStates] = useState<UploadState[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [numberOfPhotos, setNumberOfPhotos] = useState<number | null>(null)

  // Check if all uploads are complete to trigger bus
  const allUploadsComplete =
    uploadStates.length > 0 && uploadStates.every((s) => s.status === "success")
  const hasImagesSelected = uploadStates.length > 0

  // Subscribe to upload flow status events - only when upload flow is started
  const uploadFlowChannel = reference && isUploadFlowStarted ? `dev:upload-flow:${reference}` : null

  useSSE(uploadFlowChannel, {
    enabled: isUploadFlowStarted,
    onMessage: (message) => {
      const payload = message.payload as RunStateEvent
      setStepStates((prev) => {
        // Map generic "upload-processor" events to numbered steps
        let taskName = payload.taskName
        if (taskName === "upload-processor" && numberOfPhotos !== null) {
          // Find the first pending upload-processor step
          const pendingIndex = Array.from({ length: numberOfPhotos }, (_, i) => i).find(
            (i) => prev[`upload-processor-${i}`] === "pending"
          )
          if (pendingIndex !== undefined) {
            taskName = `upload-processor-${pendingIndex}`
          }
        }

        if (payload.state === "start") {
          return { ...prev, [taskName]: "running" }
        } else if (payload.state === "end") {
          return {
            ...prev,
            [taskName]: payload.error ? "error" : "done",
          }
        }
        return prev
      })
    },
    onError: (error) => {
      console.error("SSE upload flow error:", error)
    },
  })

  // Initialize step states and handle bus trigger
  useEffect(() => {
    if (numberOfPhotos === null) {
      setStepStates({})
      return
    }

    if (isUploadFlowStarted && numberOfPhotos > 0) {
      const initialStates: Record<string, "pending"> = {}
      // Initialize upload processor states for each image
      for (let i = 0; i < numberOfPhotos; i++) {
        initialStates[`upload-processor-${i}`] = "pending"
      }
      initialStates["bus"] = "pending"
      initialStates["validator"] = "pending"
      initialStates["contact-sheet"] = "pending"
      initialStates["zip-worker"] = "pending"
      setStepStates(initialStates)
    } else if (!isUploadFlowStarted && numberOfPhotos > 0) {
      // Show outline when competition class is selected but flow hasn't started
      const outlineStates: Record<string, "pending"> = {}
      for (let i = 0; i < numberOfPhotos; i++) {
        outlineStates[`upload-processor-${i}`] = "pending"
      }
      outlineStates["bus"] = "pending"
      outlineStates["validator"] = "pending"
      outlineStates["contact-sheet"] = "pending"
      outlineStates["zip-worker"] = "pending"
      setStepStates(outlineStates)
    }
  }, [isUploadFlowStarted, numberOfPhotos])

  // Update flow-started state when images are selected
  useEffect(() => {
    if (hasImagesSelected) {
      setStepStates((prev) => ({ ...prev, "flow-started": "done" }))
    } else {
      setStepStates((prev) => {
        const newStates = { ...prev }
        delete newStates["flow-started"]
        return newStates
      })
    }
  }, [hasImagesSelected])

  // Trigger bus when all uploads complete
  useEffect(() => {
    if (allUploadsComplete && isUploadFlowStarted && stepStates["bus"] === "pending") {
      setStepStates((prev) => ({ ...prev, bus: "running" }))
      // Simulate bus completion (will be replaced with real event later)
      setTimeout(() => {
        setStepStates((prev) => ({ ...prev, bus: "done" }))
        // Trigger parallel steps
        setStepStates((prev) => ({
          ...prev,
          validator: "running",
          "contact-sheet": "running",
          "zip-worker": "running",
        }))
      }, 500)
    }
  }, [allUploadsComplete, isUploadFlowStarted, stepStates])

  async function handleRunUploadFlow(params: {
    domain: string
    reference: string
    firstname: string
    lastname: string
    email: string
    competitionClassId: number
    deviceGroupId: number
  }) {
    setReference(params.reference)
    try {
      const response = await fetch("/api/run-upload-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const error = response.statusText
        console.error(error)
        throw new Error(error || "Failed to start upload flow")
      }

      const data = await response.json()
      setPresignedUrls(data.presignedUrls || [])
      // numberOfPhotos will already be set from competition class selection
      setIsUploadFlowStarted(true)
      setIsDialogOpen(true)
      return { presignedUrls: data.presignedUrls || [] }
    } catch (error) {
      console.error("Error starting upload flow:", error)
      alert(error instanceof Error ? error.message : "Failed to start upload flow")
      throw error
    }
  }

  function handleReset() {
    setIsUploadFlowStarted(false)
    setStepStates({})
    setPresignedUrls([])
    setIsDialogOpen(false)
    setReference("")
    setUploadStates([])
    setIsUploading(false)
    setNumberOfPhotos(null)
  }

  async function handleFileSelect(files: File[]) {
    if (files.length === 0) {
      setUploadStates([])
      return
    }

    // Match files to presigned URLs and generate thumbnails
    const statesPromises = files.slice(0, presignedUrls.length).map(async (file, index) => {
      const presignedUrl = presignedUrls[index]
      if (!presignedUrl) {
        throw new Error(`No presigned URL found for file ${index}`)
      }
      const thumbnail = await generateThumbnail(file)
      return {
        key: presignedUrl.key,
        file,
        progress: 0,
        status: "pending" as const,
        thumbnail,
      }
    })

    const states = await Promise.all(statesPromises)
    setUploadStates(states)
  }

  async function uploadFile(state: UploadState, presignedUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadStates((prev) => prev.map((s) => (s.key === state.key ? { ...s, progress } : s)))
        }
      })

      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadStates((prev) =>
            prev.map((s) =>
              s.key === state.key ? { ...s, status: "success" as const, progress: 100 } : s
            )
          )
          resolve()
        } else {
          const error = `Upload failed: ${xhr.status} ${xhr.statusText}`
          setUploadStates((prev) =>
            prev.map((s) => (s.key === state.key ? { ...s, status: "error" as const, error } : s))
          )
          reject(new Error(error))
        }
      })

      xhr.addEventListener("error", () => {
        const error = "Network error occurred"
        setUploadStates((prev) =>
          prev.map((s) => (s.key === state.key ? { ...s, status: "error" as const, error } : s))
        )
        reject(new Error(error))
      })

      xhr.open("PUT", presignedUrl)
      xhr.setRequestHeader("Content-Type", "image/jpeg")
      xhr.send(state.file)
    })
  }

  async function handleUpload() {
    if (uploadStates.length === 0) return

    setIsUploading(true)

    // Update all to uploading
    setUploadStates((prev) => prev.map((s) => ({ ...s, status: "uploading" as const })))

    // Upload files concurrently
    const uploadPromises = uploadStates.map((state) => {
      const presignedUrl = presignedUrls.find((p) => p.key === state.key)?.url
      if (!presignedUrl) {
        setUploadStates((prev) =>
          prev.map((s) =>
            s.key === state.key
              ? { ...s, status: "error" as const, error: "No presigned URL found" }
              : s
          )
        )
        return Promise.resolve()
      }
      return uploadFile(state, presignedUrl)
    })

    try {
      await Promise.allSettled(uploadPromises)
    } finally {
      setIsUploading(false)
    }
  }

  const isSummaryVisible = isUploadFlowStarted && hasImagesSelected
  const selectedUploads = uploadStates.map((state) => ({
    key: state.key,
    name: state.file.name,
    thumbnail: state.thumbnail,
    status: state.status,
  }))
  const validationStates = {
    validator: stepStates["validator"],
    contactSheet: stepStates["contact-sheet"],
    zipWorker: stepStates["zip-worker"],
  }

  return (
    <div className="h-screen bg-background p-4 sm:p-6">
      <ResizablePanelGroup direction="vertical" className="h-full gap-2">
        <ResizablePanel defaultSize={55} minSize={40}>
          <ResizablePanelGroup direction="horizontal" className="gap-2">
            <ResizablePanel defaultSize={50} minSize={35} className="overflow-hidden">
              <ControlsPanel
                onRunUploadFlow={handleRunUploadFlow}
                onReset={handleReset}
                onCompetitionClassChange={setNumberOfPhotos}
                selectedUploads={selectedUploads}
                isSummaryVisible={isSummaryVisible}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={35} className="overflow-hidden">
              <FlowVisualization expectedProcessorCount={numberOfPhotos} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={35}>
          <ResizablePanelGroup direction="horizontal" className="gap-2">
            <ResizablePanel defaultSize={55} minSize={35} className="overflow-hidden">
              <ValidationsPanel validationStates={validationStates} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={30} className="overflow-hidden">
              <LogsPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <UploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        presignedUrls={presignedUrls}
        onFileSelect={handleFileSelect}
        onUpload={handleUpload}
        uploadStates={uploadStates}
        isUploading={isUploading}
      />
    </div>
  )
}
