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
import { Upload } from "lucide-react"

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
  thumbnail?: string
}

interface UploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presignedUrls: PresignedUrl[]
  onFileSelect: (files: File[]) => void
  onUpload: () => void
  uploadStates: UploadState[]
  isUploading: boolean
}

export function UploadDialog({
  open,
  onOpenChange,
  presignedUrls,
  onFileSelect,
  onUpload,
  uploadStates,
  isUploading,
}: UploadDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      // Reset file input when dialog closes
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [open])

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return
    onFileSelect(files)
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
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {uploadStates.length} file{uploadStates.length !== 1 ? "s" : ""} selected
              </p>
            </div>
          )}

          {uploadStates.length > 0 && (
            <div className="flex justify-end gap-2">
              {allSuccess && (
                <Button onClick={() => onOpenChange(false)}>Close</Button>
              )}
              {!allSuccess && !isUploading && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.value = ""
                      }
                      onFileSelect([])
                    }}
                  >
                    Change Files
                  </Button>
                  {hasError && (
                    <Button onClick={onUpload}>Retry Failed</Button>
                  )}
                  {!hasError && (
                    <Button onClick={onUpload}>Upload</Button>
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
