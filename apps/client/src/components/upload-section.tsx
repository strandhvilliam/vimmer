import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Card, CardContent } from "@vimmer/ui/components/card";
import { Skeleton } from "@vimmer/ui/components/skeleton";
import { toast } from "sonner";
import { CloudUpload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React from "react";
import { UploadZone } from "./upload-zone";
import { usePhotoStore } from "@/stores/photo-store";
import { usePresignedSubmissions } from "@/hooks/use-presigned-submissions";
import { Topic } from "@vimmer/supabase/types";
import { RuleConfig } from "@vimmer/validation";
import { RuleKey } from "@vimmer/validation";

interface UploadSectionProps {
  maxPhotos: number;
  onUpload: () => void;
  ruleConfigs: RuleConfig<RuleKey>[];
  topics: Topic[];
}

export default function UploadSection({
  maxPhotos,
  onUpload,
  ruleConfigs,
  topics,
}: UploadSectionProps) {
  const { photos, validateAndAddPhotos } = usePhotoStore();
  const { data: presignedSubmissions = [] } = usePresignedSubmissions();

  const allPhotosSelected =
    photos.length === maxPhotos &&
    photos.length > 0 &&
    presignedSubmissions.length > 0;

  return (
    <AnimatePresence mode="wait">
      {allPhotosSelected ? (
        <motion.div
          key="all-photos-selected"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-dashed border-muted-foreground/40 bg-background/40 backdrop-blur-sm rounded-lg p-8 mb-6 transition-colors">
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <CloudUpload className="h-20 w-20 text-primary" />
              <p className="text-base text-center text-muted-foreground max-w-md">
                All photos selected - ready to upload
              </p>
              <PrimaryButton
                onClick={onUpload}
                disabled={!presignedSubmissions}
                className="w-full py-3 text-base rounded-full"
              >
                Upload Now
              </PrimaryButton>
            </CardContent>
          </Card>
        </motion.div>
      ) : presignedSubmissions.length > 0 ? (
        <motion.div
          key="upload-zone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UploadZone
            onDrop={(acceptedFiles) =>
              validateAndAddPhotos({
                files: acceptedFiles,
                ruleConfigs,
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
          />
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
    </AnimatePresence>
  );
}
