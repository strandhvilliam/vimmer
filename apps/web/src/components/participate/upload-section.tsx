import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Card, CardContent } from "@vimmer/ui/components/card"
import { Skeleton } from "@vimmer/ui/components/skeleton"
import { Alert } from "@vimmer/ui/components/alert"
import { CloudUpload, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import React from "react"
import { useI18n } from "@/locales/client"
import { usePhotoStore } from "@/lib/stores/photo-store"

import { Marathon, Topic } from "@vimmer/api/db/types"
import {
  RuleConfig,
  RuleKey,
} from "../../../../../packages/validation/old/types"
import {
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "../../../../../packages/validation/old/constants"

interface UploadSectionProps {
  maxPhotos: number
  ruleConfigs: RuleConfig<RuleKey>[]
  topics: Topic[]
  marathon: Marathon
  onUploadClick: () => void
}

export function UploadSection(props: UploadSectionProps) {
  const { maxPhotos, onUploadClick } = props
  const { photos, validationResults } = usePhotoStore()
  const t = useI18n()

  // const fileInputRef = useRef<HTMLInputElement>(null)

  const allPhotosSelected = photos.length === maxPhotos && photos.length > 0

  const hasValidationErrors = validationResults.some(
    (result) =>
      result.outcome === VALIDATION_OUTCOME.FAILED &&
      result.severity === SEVERITY_LEVELS.ERROR
  )

  const hasValidationWarnings = validationResults.some(
    (result) =>
      result.outcome === VALIDATION_OUTCOME.FAILED &&
      result.severity === SEVERITY_LEVELS.WARNING
  )

  // group by fileName
  const errorMessages = validationResults
    .filter(
      (result) =>
        result.outcome === VALIDATION_OUTCOME.FAILED &&
        result.severity === SEVERITY_LEVELS.ERROR
    )
    .map((result) => ({
      message: result.message,
      fileName: result.fileName,
    }))
    .reduce(
      (acc, result) => {
        const existingMessage = acc.find((m) => m.fileName === result.fileName)
        if (existingMessage) {
          existingMessage.message += `, ${result.message}`
        } else {
          acc.push(result)
        }
        return acc
      },
      [] as { message: string; fileName: string | undefined }[]
    )

  const warningMessages = validationResults
    .reduce(
      (acc, result) => {
        if (
          result.outcome === VALIDATION_OUTCOME.FAILED &&
          result.severity === SEVERITY_LEVELS.WARNING
        ) {
          const existingMessage = acc.find((m) => m.message === result.message)
          if (!existingMessage) {
            acc.push({
              message: result.message,
              fileName: result.fileName,
            })
          }
        }
        return acc
      },
      [] as { message: string; fileName: string | undefined }[]
    )
    .map((result) => ({
      message: result.message,
      fileName: result.fileName,
    }))

  const noExif = photos.some(
    (photo) => !photo.exif || Object.keys(photo.exif).length === 0
  )

  const renderValidationWarnings = () => {
    if (!hasValidationWarnings && !noExif) return null
    return (
      <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/50 dark:border-amber-800 dark:text-amber-200 w-full">
        <AlertTriangle className="h-4 w-4" />
        <div className="ml-2">
          <p className="font-medium">{t("uploadSection.warningTitle")}</p>
          <p className="text-sm mt-1">{t("uploadSection.warningIntro")}</p>
          <div className="mt-3 space-y-1">
            {noExif && (
              <div className="text-xs bg-amber-100 dark:bg-amber-900/30 rounded px-2 py-1">
                <span className="font-medium">
                  {t("uploadSection.noExifTitle")}:{" "}
                </span>
                <span>{t("uploadSection.noExifDescription")}</span>
              </div>
            )}
            {warningMessages.map((warning, index) => (
              <div
                key={`warning-${index}`}
                className="text-xs bg-amber-100 dark:bg-amber-900/30 rounded px-2 py-1"
              >
                {warning.fileName && (
                  <span className="font-medium">{warning.fileName}: </span>
                )}
                <span>{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      </Alert>
    )
  }

  return (
    <AnimatePresence mode="popLayout">
      {hasValidationErrors ? (
        <motion.div
          key="validation-errors"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-destructive/40 bg-destructive/5 backdrop-blur-sm rounded-lg py-5 mb-6 transition-colors">
            <CardContent className="flex flex-col items-center justify-center space-y-2 p-2">
              <AlertTriangle className="h-12 w-12 text-destructive" />
              <div className="text-center space-y-4 max-w-md">
                <p className="text-base font-medium text-destructive">
                  {t("uploadSection.validationErrorsTitle")}
                </p>
                <div className="space-y-2">
                  {errorMessages.map((error, index) => (
                    <div
                      key={`error-${index}`}
                      className="text-xs text-muted-foreground bg-background/50 rounded-md p-3 border"
                    >
                      {error.fileName && (
                        <p className="font-medium text-foreground mb-1">
                          {error.fileName}
                        </p>
                      )}
                      <p>{error.message}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("uploadSection.validationErrorsFix")}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : allPhotosSelected ? (
        <motion.div
          key="all-photos-selected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-green-200 bg-green-50/50 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors">
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <CloudUpload className="h-20 w-20 text-green-600" />
                <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                  ✓
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-semibold text-green-800">
                  {t("uploadSection.allPhotosSelectedTitle")}
                </p>
                <p className="text-sm text-green-700 max-w-md">
                  {t("uploadSection.photosReady", { count: maxPhotos })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : photos.length < maxPhotos ? (
        <motion.div
          key="upload-zone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* <UploadZone
            onDrop={(acceptedFiles) =>
              validateAndAddPhotos({
                files: acceptedFiles,
                ruleConfigs: ruleConfigs.map((rule) => {
                  if (rule.key === RULE_KEYS.WITHIN_TIMERANGE) {
                    return {
                      ...rule,
                      params: {
                        ...rule.params,
                        start: marathon.startDate,
                        end: marathon.endDate,
                      },
                    };
                  }
                  return rule;
                }),
                orderIndexes: topics.map((topic) => topic.orderIndex),
                maxPhotos,
              })
            }
            isDisabled={photos.length >= maxPhotos}
            currentCount={photos.length}
            maxCount={maxPhotos}
            onDropRejected={(fileRejections) => {
              fileRejections.forEach((rejection) => {
                rejection.errors.forEach((error) => {
                  toast.error(error.message);
                });
              });
            }}
          /> */}
          <div
            className={`
              border-2 border-dashed border-muted-foreground/40 bg-background/60 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors cursor-pointer hover:border-vimmer-primary hover:bg-muted
              ${photos.length >= maxPhotos ? "opacity-50 pointer-events-none" : ""}
            `}
            onClick={(e) => {
              e.preventDefault()
              onUploadClick()
            }}
          >
            {/* <input
              type="file"
              ref={fileInputRef}
              multiple
              accept={COMMON_IMAGE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
              onChange={(e) => {
                const files = Array.from(e.target.files || [])

                if (files.length > 0) {
                  validateAndAddPhotos({
                    files,
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
                    maxPhotos,
                  })
                } else {
                  toast.error("No files selected")
                }
              }}
              className="hidden"
              id="photo-upload"
            /> */}
            <div className="text-center flex flex-col justify-center items-center">
              <PrimaryButton
                className="flex items-center justify-center p-4 rounded-full mb-4"
                disabled={photos.length >= maxPhotos}
              >
                <CloudUpload className="w-10 h-10 text-white" />
              </PrimaryButton>

              <p className="text-muted-foreground mb-2">
                {t("uploadSection.clickToSelect")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("uploadCommon.countSummary", {
                  current: photos.length,
                  max: maxPhotos,
                })}
              </p>
              <PrimaryButton
                disabled={photos.length >= maxPhotos}
                className="mt-4"
              >
                {t("uploadSection.selectPhotos")}
              </PrimaryButton>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="loading-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="border-2 border-dashed border-muted-foreground/40 bg-background/60 backdrop-blur-sm rounded-lg p-8 mb-6">
            <div className="text-center flex flex-col justify-center items-center">
              <Skeleton className="h-20 w-20 rounded-full mb-4" />
              <Skeleton className="h-5 w-64 mb-2" />
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </motion.div>
      )}
      {renderValidationWarnings()}
    </AnimatePresence>
  )
}
