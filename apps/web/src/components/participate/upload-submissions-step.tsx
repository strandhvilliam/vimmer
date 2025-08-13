"use client"

import { Button } from "@vimmer/ui/components/button"
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"
import { UploadProgress } from "@/components/participate/upload-progress"
import { StepNavigationHandlers } from "@/lib/types"
import { usePhotoStore } from "@/lib/stores/photo-store"
import { RuleKey, RuleConfig } from "@vimmer/validation/types"
import { SubmissionsList } from "@/components/participate/submission-list"
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state"
import { combinePhotos } from "@/lib/combine-photos"
import { UploadErrorFallback } from "@/components/participate/upload-error-fallback"
import { UploadSection } from "@/components/participate/upload-section"
import { useFileUpload } from "@/hooks/use-file-upload"
import { useUploadStore } from "@/lib/stores/upload-store"
import { CompetitionClass, Marathon, Topic } from "@vimmer/api/db/types"
import { useRef, useState } from "react"
import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants"
import {
  RULE_KEYS,
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "@vimmer/validation/constants"
import { toast } from "sonner"
import { useI18n } from "@/locales/client"
import { useTRPC } from "@/trpc/client"
import { useDomain } from "@/contexts/domain-context"
import { useMutation } from "@tanstack/react-query"
import { UploadInstructionsDialog } from "@/components/participate/upload-instructions-dialog"
import { ParticipantConfirmationDialog } from "@/components/participate/participant-confirmation-dialog"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { motion } from "motion/react"

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[]
  topics: Topic[]
  ruleConfigs: RuleConfig<RuleKey>[]
  marathon: Marathon
}

export function UploadSubmissionsStep({
  onPrevStep,
  onNextStep,
  topics,
  marathon,
  competitionClasses,
  ruleConfigs,
}: Props) {
  const t = useI18n()
  const trpc = useTRPC()
  const { domain } = useDomain()
  const {
    submissionState: {
      competitionClassId,
      participantRef,
      participantId,
      uploadInstructionsShown,
    },
    setSubmissionState,
  } = useSubmissionQueryState()

  const { photos, validateAndAddPhotos, removePhoto, validationResults } =
    usePhotoStore()

  const { executeUpload } = useFileUpload()
  const { isUploading, setIsUploading } = useUploadStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)

  // Temporarily use any to bypass type checking until API is rebuilt
  const { mutateAsync: generatePresignedSubmissions } = useMutation(
    trpc.presignedUrls.generatePresignedSubmissionsOnDemand.mutationOptions({
      onError: () => {
        toast.error(t("uploadSubmissions.failedPresigned"))
      },
    })
  )

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId
  )

  const handleCloseInstructionsDialog = () => {
    setSubmissionState({ uploadInstructionsShown: true })
  }

  const handleCloseUploadProgress = () => {
    setIsUploading(false)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.error(t("uploadSubmissions.noFilesSelected"))
      return
    }
    if (!competitionClass) return

    const fileArray = Array.from(files)

    if (fileArray.length > 0) {
      await validateAndAddPhotos({
        files: fileArray,
        ruleConfigs: ruleConfigs.map((rule) => {
          if (rule.key === RULE_KEYS.WITHIN_TIMERANGE) {
            return {
              ...rule,
              params: {
                ...rule.params,
                start: marathon.startDate,
                end: marathon.endDate,
              },
            }
          }
          return rule
        }),
        orderIndexes: topics.map((topic) => topic.orderIndex),
        maxPhotos: competitionClass.numberOfPhotos,
      })
    } else {
      toast.error(t("uploadSubmissions.noFilesSelected"))
      return
    }
  }

  const handleUploadClick = () => {
    if (!competitionClass) {
      toast.error(t("uploadSubmissions.unableToDetermineClass"))
      return
    }
    if (photos.length >= competitionClass.numberOfPhotos) {
      toast.error(t("uploadSubmissions.maxPhotosReached"))
      return
    }
    fileInputRef.current?.click()
  }

  const handleRemovePhoto = async (orderIndex: number) => {
    if (!competitionClass) return
    await removePhoto({
      photoToRemoveIndex: orderIndex,
      ruleConfigs: ruleConfigs.map((rule) => {
        if (rule.key === RULE_KEYS.WITHIN_TIMERANGE) {
          return {
            ...rule,
            params: {
              ...rule.params,
              start: marathon.startDate,
              end: marathon.endDate,
            },
          }
        }
        return rule
      }),
      orderIndexes: topics.map((topic) => topic.orderIndex),
      maxPhotos: competitionClass.numberOfPhotos,
    })
  }

  const handleUpload = async () => {
    if (!domain || !participantRef || !participantId || !competitionClassId) {
      toast.error(t("uploadSubmissions.missingRequiredInfo"))
      return
    }

    setShowConfirmationDialog(true)
  }

  const handleConfirmedUpload = async () => {
    setShowConfirmationDialog(false)

    if (!domain || !participantRef || !participantId || !competitionClassId) {
      toast.error(t("uploadSubmissions.missingRequiredInfo"))
      return
    }

    try {
      setIsUploading(true)

      const presignedSubmissions = await generatePresignedSubmissions({
        domain,
        participantRef,
        participantId,
        competitionClassId,
      })

      if (!presignedSubmissions || presignedSubmissions.length === 0) {
        setIsUploading(false)
        toast.error(t("uploadSubmissions.failedNoSubmissions"))
        return
      }

      const combinedPhotos = combinePhotos(photos, presignedSubmissions)

      if (!combinedPhotos || combinedPhotos.length === 0) {
        setIsUploading(false)
        toast.error(t("uploadSubmissions.failedPreparePhotos"))
        return
      }

      await executeUpload(combinedPhotos)
    } catch (error) {
      console.error("Upload failed:", error)
      setIsUploading(false)
      toast.error(t("uploadSubmissions.failedToStartUpload"))
    }
  }

  if (!competitionClass) {
    return (
      <UploadErrorFallback
        error={t("uploadSubmissions.unexpectedError")}
        onPrevStepAction={onPrevStep}
      />
    )
  }

  return (
    <>
      <UploadInstructionsDialog
        open={!uploadInstructionsShown}
        onClose={handleCloseInstructionsDialog}
      />
      <UploadProgress
        topics={topics}
        expectedCount={competitionClass.numberOfPhotos}
        onComplete={() => onNextStep?.()}
        open={isUploading}
        onClose={handleCloseUploadProgress}
      />
      <ParticipantConfirmationDialog
        open={showConfirmationDialog}
        onClose={() => setShowConfirmationDialog(false)}
        onConfirm={handleConfirmedUpload}
        expectedParticipantRef={participantRef || ""}
      />
      <div className="max-w-4xl mx-auto space-y-6">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-rocgrotesk font-bold text-center">
            {t("uploadSubmissions.title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("uploadSubmissions.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <UploadSection
            marathon={marathon}
            maxPhotos={competitionClass.numberOfPhotos}
            // onUpload={handleUpload}
            ruleConfigs={ruleConfigs}
            topics={topics}
            onUploadClick={handleUploadClick}
          />
          <SubmissionsList
            topics={topics}
            competitionClass={competitionClass}
            onUploadClick={handleUploadClick}
            onRemovePhoto={handleRemovePhoto}
          />
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={COMMON_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
            onChange={(e) => handleFileSelect(e.target.files)}
            style={{ display: "none" }}
          />
        </CardContent>

        <CardFooter className="flex flex-col gap-3 items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            onClick={onPrevStep}
            className="w-[200px]"
          >
            {t("uploadSubmissions.back")}
          </Button>
        </CardFooter>
      </div>

      {/* Floating finalize button */}
      {(() => {
        const allPhotosSelected =
          photos.length === competitionClass.numberOfPhotos && photos.length > 0
        const hasValidationErrors = validationResults.some(
          (result) =>
            result.outcome === VALIDATION_OUTCOME.FAILED &&
            result.severity === SEVERITY_LEVELS.ERROR
        )

        return allPhotosSelected && !hasValidationErrors ? (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-border shadow-lg"
          >
            <div className="max-w-4xl mx-auto">
              <PrimaryButton
                onClick={handleUpload}
                className="w-full rounded-full py-4 text-lg font-semibold"
              >
                {t("uploadSubmissions.finalizeAndSubmit")}
              </PrimaryButton>
            </div>
          </motion.div>
        ) : null
      })()}
    </>
  )
}
