import { Submission, Topic } from "@vimmer/supabase/types";
import { Card, CardContent } from "@vimmer/ui/components/card";

export function PhotoSubmissionCard({
  submission,
  participant,
  topic,
  imageUrl,
}: {
  submission: Submission;
  participant: any;
  topic: Topic;
  imageUrl: string;
}) {
  return (
    <div className="space-y-4">
      <Card className="sticky top-8 overflow-hidden shadow-2xl">
        <CardContent className="p-0 bg-black/50">
          <div className="relative w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={topic.name}
              className="object-contain w-full h-full max-h-[70vh]"
            />
          </div>
        </CardContent>

        <div className="bg-black p-4 flex flex-col justify-end ">
          <div className="text-white">
            <h3 className="text-xl font-bold">{topic.name}</h3>
            <p className="text-sm opacity-90">
              Topic {topic.orderIndex + 1} of{" "}
              {participant.competitionClass?.numberOfPhotos || "?"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
