import { useDomain } from "@/contexts/domain-context";
import { runSheetGenerationQueue } from "@/actions/run-sheet-generation-queue";
import { PARTICIPANT_STATUS } from "@/lib/constants";
import { Participant, Submission } from "@vimmer/api/db/types";
import { Button } from "@vimmer/ui/components/button";
import { Download } from "lucide-react";
import { useState } from "react";

interface ParticipantContactSheetTabProps {
  participant: Participant & {
    submissions: Submission[];
  };
  contactSheetBucketUrl: string;
}

const VALID_CONTACT_SHEET_PHOTO_AMOUNT = [8, 24];

export function ParticipantContactSheetTab({
  participant,
  contactSheetBucketUrl,
}: ParticipantContactSheetTabProps) {
  const { domain } = useDomain();
  const [isGenerating, setIsGenerating] = useState(false);

  const hasContactSheet = !!participant.contactSheetKey;
  const canGenerate =
    participant.status === PARTICIPANT_STATUS.COMPLETED ||
    participant.status === PARTICIPANT_STATUS.VERIFIED;

  const handleGenerateContactSheet = async () => {
    setIsGenerating(true);
    try {
      await runSheetGenerationQueue({
        participantRef: participant.reference,
        domain,
      });
    } catch (error) {
      console.error("Failed to generate contact sheet:", error);
    }
  };

  const handleDownloadContactSheet = () => {
    const link = document.createElement("a");
    link.href = `${contactSheetBucketUrl}/${participant.contactSheetKey}`;
    link.download = `contact-sheet-${participant.reference}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isValidAmountOfPhotos = VALID_CONTACT_SHEET_PHOTO_AMOUNT.includes(
    participant.submissions.length,
  );

  if (!hasContactSheet && !isValidAmountOfPhotos) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">
          Invalid amount of photos submitted. Currently only 8 or 24 photos are
          supported
        </p>
      </div>
    );
  }

  if (hasContactSheet) {
    return (
      <div className="space-y-4">
        <div className="flex justify-center">
          <img
            src={`${contactSheetBucketUrl}/${participant.contactSheetKey}`}
            alt="Contact Sheet"
            className="max-w-full h-auto border border-black shadow-lg"
          />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleDownloadContactSheet} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Contact Sheet
          </Button>
        </div>
      </div>
    );
  }

  if (canGenerate) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-muted-foreground">No contact sheet available</p>
        <Button onClick={handleGenerateContactSheet} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate Contact Sheet"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-muted-foreground">Nothing to show here</p>
    </div>
  );
}
