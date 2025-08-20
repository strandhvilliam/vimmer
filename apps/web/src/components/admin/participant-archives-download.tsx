"use client"

import { useState } from "react"
import { Button } from "@vimmer/ui/components/button"
import {
  FolderOpen,
  Loader2,
  AlertTriangle,
  X,
  Settings2,
  Archive,
  CheckCircle2,
  Info,
  Users,
  ExternalLink,
} from "lucide-react"
import { Input } from "@vimmer/ui/components/input"
import { Label } from "@vimmer/ui/components/label"
import { Checkbox } from "@vimmer/ui/components/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card"
import { Badge } from "@vimmer/ui/components/badge"
import { Separator } from "@vimmer/ui/components/separator"
import { toast } from "sonner"
import { useZipSaver } from "@/hooks/use-zip-saver"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { MultiStepLoader } from "@vimmer/ui/components/multi-step-loader"
import { Alert, AlertDescription } from "@vimmer/ui/components/alert"
import { useDomain } from "@/contexts/domain-context"

interface ParticipantArchivesDownloadProps {
  marathonId: number
  canDownload: boolean
  participantCount: number
  zippedSubmissionsCount?: number
}

export function ParticipantArchivesDownload({
  marathonId,
  canDownload,
  participantCount,
  zippedSubmissionsCount,
}: ParticipantArchivesDownloadProps) {
  const trpc = useTRPC()
  const { domain } = useDomain()
  const [imageWidth, setImageWidth] = useState<string>("1920")
  const [useOriginalSize, setUseOriginalSize] = useState<boolean>(false)
  const [showLoader, setShowLoader] = useState(false)
  const [failedParticipants, setFailedParticipants] = useState<number[]>([])
  const [showErrorState, setShowErrorState] = useState(false)
  const [pendingData, setPendingData] = useState<any>(null)
  const [showMissingParticipants, setShowMissingParticipants] = useState(false)

  const zipSaver = useZipSaver()

  const { data: participants } = useQuery(
    trpc.participants.getParticipantsWithoutSubmissions.queryOptions({
      domain,
    })
  )

  const { data: zippedSubmissions } = useQuery(
    trpc.submissions.getZippedSubmissionsByDomain.queryOptions({
      domain,
    })
  )

  const missingParticipants =
    participants?.filter(
      (participant) =>
        !zippedSubmissions?.some(
          (zipped) => zipped.participantId === participant.id
        )
    ) || []

  const loadingStates = [
    { text: "Generating presigned URLs..." },
    { text: "Processing participant archives..." },
    { text: "Preparing download..." },
    { text: "Starting download..." },
  ]

  const handleContinueAnyway = async () => {
    if (
      pendingData &&
      Array.isArray(pendingData.presignedUrls) &&
      pendingData.presignedUrls.length > 0
    ) {
      const width = useOriginalSize ? undefined : parseInt(imageWidth) || 1920
      setShowErrorState(false)
      try {
        await zipSaver.savePhotos(pendingData.presignedUrls, domain, width)
        setShowLoader(false)

        if (zipSaver.failedParticipants.length > 0) {
          toast.error(
            `Export completed with ${zipSaver.failedParticipants.length} errors`,
            {
              description:
                "Some participants failed to process. Check the error details below.",
            }
          )
        }
      } catch (error) {
        setShowLoader(false)
        toast.error("Failed to save photos", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        })
      }
    }
    setFailedParticipants([])
    setPendingData(null)
  }

  const handleCancelExport = () => {
    setShowLoader(false)
    setShowErrorState(false)
    setFailedParticipants([])
    setPendingData(null)
  }

  const { mutate: generateZips, isPending: isGenerating } = useMutation(
    trpc.presignedUrls.generateZipSubmissionsPresignedUrls.mutationOptions({
      onSuccess: async (data) => {
        if (data.failedParticipantIds.length > 0) {
          setFailedParticipants(data.failedParticipantIds)
          setPendingData(data)
          setShowErrorState(true)
          return
        }

        if (
          Array.isArray(data.presignedUrls) &&
          data.presignedUrls.length > 0
        ) {
          const width = useOriginalSize
            ? undefined
            : parseInt(imageWidth) || 1920
          try {
            await zipSaver.savePhotos(data.presignedUrls, domain, width)
            setShowLoader(false)

            if (zipSaver.failedParticipants.length > 0) {
              toast.error(
                `Export completed with ${zipSaver.failedParticipants.length} errors`,
                {
                  description:
                    "Some participants failed to process. Check the error details below.",
                }
              )
            }
          } catch (error) {
            setShowLoader(false)
            toast.error("Failed to save photos", {
              description:
                error instanceof Error
                  ? error.message
                  : "An unknown error occurred.",
            })
          }
        } else {
          setShowLoader(false)
        }
      },
      onError: (err) => {
        setShowLoader(false)
        toast.error("Failed to fetch presigned URLs", {
          description: err.message,
        })
        console.error("Failed to fetch presigned URLs", err)
      },
    })
  )

  const handleDownload = () => {
    setShowLoader(true)
    generateZips({ marathonId })
  }

  return (
    <>
      <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Archive className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-rocgrotesk">
                  Participant Archives
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Download all generated participant photo archives
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={canDownload ? "default" : "secondary"}
                className="text-xs"
              >
                {participantCount} participants
              </Badge>
              {canDownload && (
                <Badge
                  variant="outline"
                  className="text-xs text-green-600 border-green-200"
                >
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Ready
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Alert */}
          {canDownload ? (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Ready to download!</strong> All {participantCount}{" "}
                participant archives are generated and available for download.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                {participantCount === 0
                  ? "No participants found in this marathon."
                  : `Archives not ready. Expected ${participantCount} participants, but found ${zippedSubmissionsCount || 0}. Please generate archives first.`}
                {missingParticipants.length > 0 && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowMissingParticipants(true)}
                      className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Missing Participants ({missingParticipants.length})
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              <Label className="text-sm font-medium">
                Download Configuration
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-original-size"
                      checked={useOriginalSize}
                      onCheckedChange={(checked) =>
                        setUseOriginalSize(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="use-original-size"
                      className="text-sm font-medium"
                    >
                      Use original image sizes
                    </Label>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="image-width"
                      className="text-sm font-medium"
                    >
                      Image Size (pixels)
                    </Label>
                    <Input
                      id="image-width"
                      type="number"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(e.target.value)}
                      placeholder="1920"
                      min="100"
                      max="4000"
                      className="w-full"
                      disabled={useOriginalSize}
                    />
                    <div className="flex items-start gap-2">
                      <Info className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        {useOriginalSize
                          ? "Images will be downloaded in their original resolution without resizing."
                          : "Images will be resized so their largest dimension matches this size while maintaining aspect ratio. Recommended: 1920px for high quality, 1280px for smaller files."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Browser Compatibility
                </Label>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
                      alt="Chrome"
                      className="h-5 w-5"
                    />
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg"
                      alt="Edge"
                      className="h-5 w-5"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium">Chrome & Edge Only</p>
                    <p className="text-xs text-muted-foreground">
                      File system access required
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Download Button */}
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleDownload}
              disabled={zipSaver.isLoading || !canDownload || isGenerating}
              size="lg"
              className="w-full h-12 text-base font-medium"
            >
              {zipSaver.isLoading || isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {zipSaver.statusMessage || "Processing..."}
                </>
              ) : (
                <>
                  <FolderOpen className="mr-2 h-5 w-5" />
                  Save to Local Folder
                </>
              )}
            </Button>

            {/* Status Messages */}
            {zipSaver.error && (
              <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Error:</strong> {zipSaver.error}
                </AlertDescription>
              </Alert>
            )}

            {!zipSaver.error &&
              zipSaver.statusMessage &&
              !zipSaver.isLoading &&
              !isGenerating && (
                <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {zipSaver.statusMessage}
                  </AlertDescription>
                </Alert>
              )}

            {/* Failed Participants */}
            {zipSaver.failedParticipants.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <p className="text-sm font-medium text-red-600">
                    Failed Participants ({zipSaver.failedParticipants.length})
                  </p>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                  {zipSaver.failedParticipants.map((error, index) => (
                    <div
                      key={index}
                      className="text-xs bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2"
                    >
                      <span className="font-medium text-red-700 dark:text-red-300">
                        {error.participantRef}:
                      </span>{" "}
                      <span className="text-red-600 dark:text-red-400">
                        {error.error}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <MultiStepLoader
        loadingStates={loadingStates}
        loading={showLoader && !showErrorState}
        duration={2000}
        loop={true}
      />

      {showErrorState && (
        <div className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold font-rocgrotesk">
                Export Warning
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to generate archives for {failedParticipants.length}{" "}
                participant(s).
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Failed Participant IDs:</strong>{" "}
                  {failedParticipants.join(", ")}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                You can continue with the export for the remaining participants
                or cancel to try again later.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleContinueAnyway}
                variant="default"
                className="flex-1"
              >
                Continue Anyway
              </Button>
              <Button
                onClick={handleCancelExport}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showMissingParticipants && (
        <div className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4 shadow-2xl border max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-amber-500" />
                <h2 className="text-xl font-semibold font-rocgrotesk">
                  Missing Participants
                </h2>
              </div>
              <Button
                onClick={() => setShowMissingParticipants(false)}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                The following {missingParticipants.length} participants are
                missing zipped submissions:
              </p>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-96">
                {missingParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {participant.reference}
                        </span>
                        {(participant.firstname || participant.lastname) && (
                          <span className="text-sm text-muted-foreground">
                            ({participant.firstname} {participant.lastname})
                          </span>
                        )}
                      </div>
                      {participant.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {participant.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="ml-4"
                    >
                      <a
                        href={`/admin/submissions/${participant.reference}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        View Participant
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setShowMissingParticipants(false)}
                variant="outline"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
