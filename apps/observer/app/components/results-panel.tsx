"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"
import { Button } from "@vimmer/ui/components/button"
import { Progress } from "@vimmer/ui/components/progress"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface UploadState {
  key: string
  file: File
  progress: number
  status: "pending" | "uploading" | "success" | "error"
  error?: string
  thumbnail?: string
}

interface ResultsPanelProps {
  uploadStates: UploadState[]
}

export function ResultsPanel({ uploadStates }: ResultsPanelProps) {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Results</CardTitle>
        <CardDescription>Artifacts and data emitted by the engine</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 overflow-auto flex-1">
        <div className="flex gap-3 flex-shrink-0">
          <Button size="sm" variant="outline">
            Zip File
          </Button>
          <Button size="sm" variant="outline">
            Contact Sheet
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 min-h-0">
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-base">Validation Results</CardTitle>
            </CardHeader>
            <CardContent className="overflow-auto flex-1">
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>No duplicates found</li>
                <li>Expected count: 5, received: 5</li>
                <li>All EXIF timestamps within contest window</li>
                <li>Thumbnails generated for 5 images</li>
              </ul>
            </CardContent>
          </Card>
          <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0">
              <CardTitle className="text-base">Images</CardTitle>
              <CardDescription>
                {uploadStates.length > 0
                  ? `${uploadStates.length} file${uploadStates.length !== 1 ? "s" : ""} selected`
                  : "Uploaded files"}
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-auto flex-1">
              {uploadStates.length > 0 ? (
                <div className="space-y-2">
                  {uploadStates.map((state) => (
                    <div
                      key={state.key}
                      className="flex items-center gap-3 p-2 rounded-lg border bg-card"
                    >
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border bg-muted">
                        {state.thumbnail ? (
                          <img
                            src={state.thumbnail}
                            alt={state.file.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                            No preview
                          </div>
                        )}
                      </div>

                      {/* File info and progress */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-2 min-w-0">
                            {state.status === "success" && (
                              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                            )}
                            {state.status === "error" && (
                              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                            )}
                            {state.status === "uploading" && (
                              <Loader2 className="h-4 w-4 text-primary animate-spin flex-shrink-0" />
                            )}
                            {state.status === "pending" && (
                              <div className="h-4 w-4 border-2 border-muted-foreground rounded-full flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium truncate">{state.file.name}</span>
                          </div>
                          <span className="text-xs text-muted-foreground flex-shrink-0">
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
                          <Progress value={state.progress} className="h-1.5" />
                        )}
                        {state.error && (
                          <p className="text-xs text-red-500 mt-1 truncate">{state.error}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Placeholder for when no uploads */}
                  <div className="aspect-square w-full rounded-md border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                    No files yet
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
