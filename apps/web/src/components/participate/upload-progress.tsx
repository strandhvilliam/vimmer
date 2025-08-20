"use client"

import { FileState, PhotoWithPresignedUrl } from "@/lib/types"
import { Topic } from "@vimmer/api/db/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@vimmer/ui/components/dialog"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Button } from "@vimmer/ui/components/button"
import { Progress } from "@vimmer/ui/components/progress"
import { AnimatePresence, motion } from "motion/react"
import { FileProgressItem } from "@/components/participate/file-progress-item"
import { AlertTriangle, RefreshCcw, RefreshCw, X } from "lucide-react"
import { useUploadStore } from "@/lib/stores/upload-store"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useMemo, useState, useEffect } from "react"
import { useI18n } from "@/locales/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state"

interface UploadProgressProps {
  files?: PhotoWithPresignedUrl[]
  topics: Topic[]
  expectedCount: number
  onComplete: () => void
  open?: boolean
  onClose?: () => void
  realtimeConfig: {
    endpoint: string
    authorizer: string
    topic: string
  }
}

export function UploadProgress({
  topics,
  expectedCount: expectedFilesCount,
  onComplete,
  open = true,
  onClose,
  realtimeConfig,
}: UploadProgressProps) {
  const queryClient = useQueryClient()
  const trpc = useTRPC()
  const t = useI18n()
  const files = useUploadStore((state) => state.files)
  const { retryFailedFiles } = useFileUpload({ realtimeConfig })
  const [elapsedTime, setElapsedTime] = useState(0)
  const { submissionState } = useSubmissionQueryState()

  const { mutate: verifyS3Upload } = useMutation(
    trpc.submissions.verifyS3Upload.mutationOptions({
      onSettled: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.submissions.pathKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        })
      },
    })
  )

  const enhancedFileStates: FileState[] = useMemo(() => {
    const fileStates = Array.from(files.values())
    return fileStates.map((f) => ({
      ...f,
      status:
        f.phase === "completed"
          ? ("completed" as const)
          : f.phase === "error"
            ? ("error" as const)
            : f.phase === "s3_upload"
              ? ("uploading" as const)
              : ("pending" as const),
    }))
  }, [files])

  const handleRefresh = () => {
    if (elapsedTime > 60) {
      for (const file of files.values()) {
        if (file.phase === "s3_upload" || file.phase === "processing") {
          verifyS3Upload({
            key: file.key,
          })
        }
      }
    }
  }

  const progress = useMemo(() => {
    const fileStates = Array.from(files.values())
    const total = fileStates.length || expectedFilesCount
    const completed = fileStates.filter((f) => f.phase === "completed").length
    const failed = fileStates.filter((f) => f.phase === "error").length
    const uploading = fileStates.filter((f) => f.phase === "s3_upload").length
    const processing = fileStates.filter((f) => f.phase === "processing").length

    return {
      total,
      completed,
      failed,
      uploading,
      processing,
      percentage: total > 0 ? (completed / total) * 100 : 0,
    }
  }, [files, expectedFilesCount])

  const failedFiles = enhancedFileStates.filter(
    (file) => file.status === "error"
  )

  const allUploadsComplete = progress.completed === expectedFilesCount
  const hasFailures = failedFiles.length > 0
  const canRetry = hasFailures
  const failedSummaryText = hasFailures
    ? failedFiles.length === 1
      ? t("uploadProgress.failedUploads.one")
      : t("uploadProgress.failedUploads.other", { count: failedFiles.length })
    : ""

  useEffect(() => {
    if (!open) return

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [open])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleRetryFailedFiles = () => {
    setElapsedTime(0)
    retryFailedFiles()
  }

  return (
    <Dialog open={open}>
      <DialogContent
        hideCloseButton
        className="p-0 border-none bg-transparent shadow-none max-w-md"
      >
        <DialogTitle className="sr-only">
          {t("uploadProgress.titleUploading")}
        </DialogTitle>
        <Card className="w-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="text-sm w-8 text-muted-foreground font-mono">
                {!hasFailures && formatTime(elapsedTime)}
              </div>
              <div className="flex flex-col items-center">
                <CardTitle className="text-xl font-rocgrotesk flex-1 text-center">
                  {allUploadsComplete
                    ? t("uploadProgress.titleComplete")
                    : hasFailures
                      ? t("uploadProgress.titleIssues")
                      : t("uploadProgress.titleUploading")}
                </CardTitle>
                <CardDescription>
                  {allUploadsComplete
                    ? t("uploadProgress.clickToContinue")
                    : hasFailures
                      ? t("uploadProgress.clickToRetry")
                      : t("uploadProgress.thisMayTakeSeveralMinutes")}
                </CardDescription>
              </div>
              <div className="w-8 flex justify-end">
                {hasFailures && onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-muted rounded-full transition-colors border"
                    aria-label={t("uploadProgress.closeDialogAria")}
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
                {!hasFailures && (
                  <button
                    onClick={handleRefresh}
                    className="p-1 hover:bg-muted rounded-full transition-colors border"
                    aria-label={t("uploadProgress.closeDialogAria")}
                  >
                    <RefreshCcw className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{t("uploadProgress.overallProgress")}</span>
                <span>
                  {t("uploadProgress.completedOfTotal", {
                    completed: progress.completed,
                    total: progress.total,
                  })}
                  {progress.failed > 0 && (
                    <span className="text-destructive ml-1">
                      {t("uploadProgress.failedSuffix", {
                        count: progress.failed,
                      })}
                    </span>
                  )}
                </span>
              </div>
              <Progress value={progress.percentage} />
            </div>

            {hasFailures && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
              >
                <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-destructive">
                    {failedSummaryText}
                  </p>
                  <p className="text-muted-foreground">
                    {t("uploadProgress.checkConnection")}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {enhancedFileStates.length > 0
                  ? enhancedFileStates.map((file) => (
                      <FileProgressItem
                        key={file.key}
                        file={file}
                        topic={
                          topics.find(
                            (topic) => topic.orderIndex === file.orderIndex
                          )!
                        }
                      />
                    ))
                  : Array.from({ length: expectedFilesCount }, (_, index) => (
                      <motion.div
                        key={`placeholder-${index}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex-1 mr-3">
                          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-5 h-5 bg-muted rounded-full animate-pulse" />
                        </div>
                      </motion.div>
                    ))}
              </AnimatePresence>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            {canRetry && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
              >
                <Button
                  onClick={handleRetryFailedFiles}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t("uploadProgress.retryFailed", {
                    count: failedFiles.length,
                  })}
                </Button>
              </motion.div>
            )}

            {allUploadsComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-[80%]"
              >
                <PrimaryButton
                  onClick={onComplete}
                  className="w-full text-lg rounded-full"
                >
                  {t("uploadProgress.continue")}
                </PrimaryButton>
              </motion.div>
            )}
          </CardFooter>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
