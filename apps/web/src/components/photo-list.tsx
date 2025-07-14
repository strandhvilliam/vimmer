import { SelectedPhoto } from "@/lib/types";
import { CompetitionClass, Topic } from "@vimmer/supabase/types";
import { SubmissionItem } from "./submission-item";

interface Props {
  photos: SelectedPhoto[];
  removePhoto: (topicId: number) => void;
  topics: Topic[];
  competitionClass: CompetitionClass;
}

export function PhotoList({
  photos,
  removePhoto,
  topics,
  competitionClass,
}: Props) {
  return (
    <div className="flex flex-col space-y-4">
      {photos.map((photo, index) => (
        <SubmissionItem
          key={photo.topicId}
          photo={photo}
          index={index}
          onRemove={() => removePhoto(photo.topicId)}
        />
      ))}
      {[...Array(competitionClass.numberOfPhotos - photos.length)].map(
        (_, index) => (
          <SubmissionItem
            key={`empty-${index}`}
            topic={topics[photos.length + index]}
            index={photos.length + index}
          />
        ),
      )}
    </div>
  );
}
