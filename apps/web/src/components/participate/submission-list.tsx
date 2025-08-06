import { usePhotoStore } from "@/lib/stores/photo-store";
import React from "react";
import { SubmissionItem } from "./submission-item";
import { AnimatePresence, motion } from "motion/react";
import { CompetitionClass, Topic } from "@vimmer/api/db/types";

interface Props {
  topics: Topic[];
  competitionClass: CompetitionClass;
  onUploadClick?: () => void;
}

export function SubmissionsList({
  topics,
  competitionClass,
  onUploadClick,
}: Props) {
  const { photos, removePhoto, validationResults } = usePhotoStore();
  const remainingSlots = competitionClass.numberOfPhotos - photos.length;

  return (
    <AnimatePresence>
      <div className="flex flex-col space-y-2">
        {photos.map((photo, index) => (
          <motion.div
            key={photo.file.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.1 }}
          >
            <SubmissionItem
              photo={photo}
              topic={topics[index]}
              validationResults={validationResults.filter(
                (result) => result.fileName === photo.file.name,
              )}
              index={index}
              onRemove={() => removePhoto(photo.orderIndex)}
            />
          </motion.div>
        ))}
        {[...Array(remainingSlots)].map((_, index) => (
          <motion.div
            key={`empty-${index}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: (photos.length + index) * 0.1,
            }}
          >
            <SubmissionItem
              topic={topics[photos.length + index]}
              index={photos.length + index}
              onUploadClick={onUploadClick}
            />
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
}
