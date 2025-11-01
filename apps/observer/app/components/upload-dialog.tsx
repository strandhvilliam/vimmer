"use client"

import { useState, useRef, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog"
import { Button } from "@vimmer/ui/components/button"
import { Progress } from "@vimmer/ui/components/progress"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"

interface PresignedUrl {
  key: string
  url: string
}

interface UploadState {
  key: string
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presignedUrls: PresignedUrl[]
}

export function UploadDialog({ open, onOpenChange, presignedUrls }: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStates, setUploadStates] = useState<UploadState[]>([])
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!open) {
      setUploadStates([])
      setIsUploading(false)
    }
  }, [open])

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    // Match files to presigned URLs
    const states: UploadState[] = files.slice(0, presignedUrls.length).map((file, index) => ({
      key: presignedUrls[index].key,
      file,
      progress: 0,
      status: "pending" as const,
    }))

    setUploadStates(states)
  }

  async function uploadFile(state: UploadState, presignedUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadStates((prev) =>
            prev.map((s) => (s.key === state.key ? { ...s, progress } : s))
          )
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
            prev.map((s) =>
              s.key === state.key ? { ...s, status: "error" as const, error } : s
            )
          )
          reject(new Error(error))
        }
      })

      xhr.addEventListener("error", () => {
        const error = "Network error occurred"
        setUploadStates((prev) =>
          prev.map((s) =>
            s.key === state.key ? { ...s, status: "error" as const, error } : s
          )
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
    setUploadStates((prev) =>
      prev.map((s) => ({ ...s, status: "uploading" as const }))
    )

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

  const allSuccess = uploadStates.length > 0 && uploadStates.every((s) => s.status === "success")
  const hasError = uploadStates.some((s) => s.status === "error")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Images</DialogTitle>
          <DialogDescription>
            Select {presignedUrls.length} image{presignedUrls.length !== 1 ? "s" : ""} to upload
            to S3
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {uploadStates.length === 0 ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8">
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                Select Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          ) : (
            <div className="space-y-4">
              {uploadStates.map((state) => {
                const presignedUrl = presignedUrls.find((p) => p.key === state.key)
                return (
                  <div key={state.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {state.status === "success" && (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        )}
                        {state.status === "error" && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {state.status === "uploading" && (
                          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        )}
                        {state.status === "pending" && (
                          <div className="h-5 w-5 border-2 border-muted-foreground rounded-full" />
                        )}
                        <span className="text-sm font-medium">{state.file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {state.status === "success"
                          ? "Complete"
                          : state.status === "error"
                            ? "Failed"
                            : state.status === "uploading"
                              ? `${state.progress}%`
                              : "Pending"}
                      </span>
                    </div>
                    {state.status === "uploading" && (
                      <Progress value={state.progress} className="h-2" />
                    )}
                    {state.error && (
                      <p className="text-sm text-red-500">{state.error}</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {uploadStates.length > 0 && (
            <div className="flex justify-end gap-2">
              {allSuccess && (
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              )}
              {!allSuccess && !isUploading && (
                <>
                  <Button variant="outline" onClick={() => setUploadStates([])}>
                    Change Files
                  </Button>
                  {hasError && (
                    <Button onClick={handleUpload}>Retry Failed</Button>
                  )}
                  {!hasError && (
                    <Button onClick={handleUpload}>Upload</Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

