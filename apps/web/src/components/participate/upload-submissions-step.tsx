"use client";

import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import {
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card";
import { UploadProgress } from "@/components/participate/upload-progress";
import { StepNavigationHandlers } from "@/lib/types";
import { usePhotoStore } from "@/lib/stores/photo-store";
import { RuleKey, RuleConfig } from "@vimmer/validation/types";
import { SubmissionsList } from "@/components/participate/submission-list";
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state";
import { combinePhotos } from "@/lib/combine-photos";
import { UploadErrorFallback } from "@/components/participate/upload-error-fallback";
import { UploadSection } from "@/components/participate/upload-section";
import { useFileUpload } from "@/hooks/use-file-upload";
import { useUploadStore } from "@/lib/stores/upload-store";
import { CompetitionClass, Marathon, Topic } from "@vimmer/api/db/types";
import { useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { COMMON_IMAGE_EXTENSIONS } from "@/lib/constants";
import {
  RULE_KEYS,
  SEVERITY_LEVELS,
  VALIDATION_OUTCOME,
} from "@vimmer/validation/constants";
import { toast } from "sonner";
import { useI18n } from "@/locales/client";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { useMutation } from "@tanstack/react-query";
import { UploadInstructionsDialog } from "@/components/participate/upload-instructions-dialog";
import { ParticipantConfirmationDialog } from "@/components/participate/participant-confirmation-dialog";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { motion } from "motion/react";
import { parseExifData } from "@/lib/parse-exif-data";

const convertHeic = async (file: File) => {
  try {
    const heic2any = await import("heic2any");
    const heic = await heic2any.default({
      blob: file,
      toType: "image/jpeg",
      quality: 1,
    });
    const blob = Array.isArray(heic) ? heic : [heic];
    return new File(
      blob,
      file.name.replace(".heic", ".jpg").replace(".heif", ".jpg"),
      {
        type: "image/jpeg",
      },
    );
  } catch (error) {
    console.error(`Failed to convert HEIC file ${file.name}`, error);
    return undefined;
  }
};

interface Props extends StepNavigationHandlers {
  competitionClasses: CompetitionClass[];
  topics: Topic[];
  ruleConfigs: RuleConfig<RuleKey>[];
  marathon: Marathon;
  realtimeConfig: {
    endpoint: string;
    authorizer: string;
    topic: string;
  };
}

export function UploadSubmissionsStep({
  onPrevStep,
  onNextStep,
  topics,
  marathon,
  competitionClasses,
  ruleConfigs,
  realtimeConfig,
}: Props) {
  const t = useI18n();
  const trpc = useTRPC();
  const { domain } = useDomain();
  const {
    submissionState: {
      competitionClassId,
      participantRef,
      participantId,
      uploadInstructionsShown,
    },
    setSubmissionState,
  } = useSubmissionQueryState();

  const { photos, validateAndAddPhotos, removePhoto, validationResults } =
    usePhotoStore();

  const { executeUpload } = useFileUpload({ realtimeConfig });
  const { isUploading, setIsUploading } = useUploadStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isConvertingHeic, setIsConvertingHeic] = useState(false);
  const [isCancellingConversion, setIsCancellingConversion] = useState(false);
  const [conversionTotal, setConversionTotal] = useState(0);
  const [conversionDone, setConversionDone] = useState(0);
  const [currentConvertingName, setCurrentConvertingName] = useState<
    string | null
  >(null);
  const cancelConvertRef = useRef<{ canceled: boolean }>({ canceled: false });

  // Temporarily use any to bypass type checking until API is rebuilt
  const { mutateAsync: generatePresignedSubmissions } = useMutation(
    trpc.presignedUrls.generatePresignedSubmissionsOnDemand.mutationOptions({
      onError: () => {
        toast.error(t("uploadSubmissions.failedPresigned"));
      },
    }),
  );

  const competitionClass = competitionClasses.find(
    (cc) => cc.id === competitionClassId,
  );

  const handleCloseInstructionsDialog = () => {
    setSubmissionState({ uploadInstructionsShown: true });
  };

  const handleCloseUploadProgress = () => {
    setIsUploading(false);
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      toast.error(t("uploadSubmissions.noFilesSelected"));
      return;
    }
    if (!competitionClass) return;

    let fileArray = Array.from(files);

    const isHeicFile = (file: File) =>
      file.type === "image/heic" ||
      file.type === "image/heif" ||
      /\.heic$/i.test(file.name) ||
      /\.heif$/i.test(file.name);

    const preconvertedExifData: { name: string; exif: any }[] = [];
    if (fileArray.some((file) => isHeicFile(file))) {
      const nonHeicFiles = fileArray.filter((f) => !isHeicFile(f));
      const heicFiles = fileArray.filter((f) => isHeicFile(f));

      setIsConvertingHeic(true);
      setIsCancellingConversion(false);
      setConversionTotal(heicFiles.length);
      setConversionDone(0);
      cancelConvertRef.current.canceled = false;
      try {
        const converted: File[] = [];
        for (let i = 0; i < heicFiles.length; i++) {
          const file = heicFiles[i]!;
          setCurrentConvertingName(file.name);
          if (cancelConvertRef.current.canceled) break;
          const exif = await parseExifData(file);
          preconvertedExifData.push({
            name: file.name.replace(".heic", ".jpg").replace(".heif", ".jpg"),
            exif,
          });
          const result = await convertHeic(file);
          if (cancelConvertRef.current.canceled) break;
          if (result) converted.push(result);
          setConversionDone(i + 1);
        }

        if (cancelConvertRef.current.canceled) {
          // User canceled: keep state clean and exit without adding photos
          setIsCancellingConversion(false);
          setIsConvertingHeic(false);
          setConversionDone(0);
          setConversionTotal(0);
          setCurrentConvertingName(null);
          toast.message("HEIC conversion canceled");
          return;
        }

        fileArray = [...nonHeicFiles, ...converted];
      } catch (error) {
        console.error("Failed to convert HEIC files", error);
        toast.error("Failed to convert HEIC files");
        setIsCancellingConversion(false);
        setIsConvertingHeic(false);
        return;
      } finally {
        setIsCancellingConversion(false);
        setIsConvertingHeic(false);
        setCurrentConvertingName(null);
      }
    }

    if (fileArray.length === 0) {
      toast.error(t("uploadSubmissions.noFilesSelected"));
      return;
    }

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
          };
        }
        return rule;
      }),
      orderIndexes: topics.map((topic) => topic.orderIndex),
      maxPhotos: competitionClass.numberOfPhotos,
      preconvertedExifData,
    });
  };

  const handleUploadClick = () => {
    if (!competitionClass) {
      toast.error(t("uploadSubmissions.unableToDetermineClass"));
      return;
    }
    if (photos.length >= competitionClass.numberOfPhotos) {
      toast.error(t("uploadSubmissions.maxPhotosReached"));
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemovePhoto = async (orderIndex: number) => {
    if (!competitionClass) return;
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
          };
        }
        return rule;
      }),
      orderIndexes: topics.map((topic) => topic.orderIndex),
      maxPhotos: competitionClass.numberOfPhotos,
    });
  };

  const handleUpload = async () => {
    if (!domain || !participantRef || !participantId || !competitionClassId) {
      toast.error(t("uploadSubmissions.missingRequiredInfo"));
      return;
    }

    setShowConfirmationDialog(true);
  };

  const handleConfirmedUpload = async () => {
    setShowConfirmationDialog(false);

    if (!domain || !participantRef || !participantId || !competitionClassId) {
      toast.error(t("uploadSubmissions.missingRequiredInfo"));
      return;
    }

    try {
      setIsUploading(true);

      const presignedSubmissions = await generatePresignedSubmissions({
        domain,
        participantRef,
        participantId,
        competitionClassId,
        preconvertedExifData: photos
          .map((photo) => ({
            orderIndex: photo.orderIndex,
            exif: photo.preconvertedExif,
          }))
          .filter((p) => p.exif)
          .sort((a, b) => a.orderIndex - b.orderIndex),
      });

      if (!presignedSubmissions || presignedSubmissions.length === 0) {
        setIsUploading(false);
        toast.error(t("uploadSubmissions.failedNoSubmissions"));
        return;
      }

      const combinedPhotos = combinePhotos(photos, presignedSubmissions);

      if (!combinedPhotos || combinedPhotos.length === 0) {
        setIsUploading(false);
        toast.error(t("uploadSubmissions.failedPreparePhotos"));
        return;
      }

      await executeUpload(combinedPhotos);
    } catch (error) {
      console.error("Upload failed:", error);
      setIsUploading(false);
      toast.error(t("uploadSubmissions.failedToStartUpload"));
    }
  };

  if (!competitionClass) {
    return (
      <UploadErrorFallback
        error={t("uploadSubmissions.unexpectedError")}
        onPrevStepAction={onPrevStep}
      />
    );
  }

  return (
    <>
      {/* HEIC conversion overlay */}
      <Dialog open={isConvertingHeic}>
        <DialogContent hideCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-rocgrotesk">
              Converting HEIC photos
            </DialogTitle>
            <DialogDescription>
              {isCancellingConversion
                ? "Cancelling..."
                : `This can take a moment. ${conversionDone}/${conversionTotal}${
                    currentConvertingName ? ` - ${currentConvertingName}` : ""
                  }`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <div className="text-sm text-muted-foreground">
              {isCancellingConversion
                ? "Stopping conversion"
                : `Converting ${conversionDone} of ${conversionTotal}`}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                cancelConvertRef.current.canceled = true;
                setIsCancellingConversion(true);
              }}
              disabled={isCancellingConversion}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <UploadInstructionsDialog
        open={!uploadInstructionsShown}
        onClose={handleCloseInstructionsDialog}
      />
      <UploadProgress
        realtimeConfig={realtimeConfig}
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
          photos.length === competitionClass.numberOfPhotos &&
          photos.length > 0;
        const hasValidationErrors = validationResults.some(
          (result) =>
            result.outcome === VALIDATION_OUTCOME.FAILED &&
            result.severity === SEVERITY_LEVELS.ERROR,
        );

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
        ) : null;
      })()}
    </>
  );
}
