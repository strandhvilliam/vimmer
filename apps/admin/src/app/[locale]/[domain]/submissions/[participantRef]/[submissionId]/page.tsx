import { notFound } from "next/navigation";
import { Button } from "@vimmer/ui/components/button";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@vimmer/ui/components/badge";
import { format } from "date-fns";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs";
import { cn } from "@vimmer/ui/lib/utils";
import { getParticipantByReference } from "@vimmer/supabase/cached-queries";
import { PhotoSubmissionCard } from "./_components/photo-submission-card";
import { ValidationStepsTable } from "./_components/validation-steps";
import { ExifDataDisplay } from "./_components/exif-data-display";
import { SubmissionDetails } from "./_components/submission-details";
import { SubmissionHeader } from "./_components/submission-header";

export default async function SubmissionDetailPage({
  params,
}: {
  params: Promise<{
    domain: string;
    participantRef: string;
    submissionId: string;
  }>;
}) {
  const { domain, participantRef, submissionId } = await params;
  const participant = await getParticipantByReference(domain, participantRef);

  if (!participant) {
    notFound();
  }

  const submission = participant.submissions.find(
    (s) => s.id === parseInt(submissionId)
  );

  if (!submission) {
    notFound();
  }

  const submissionValidationResults =
    participant.validationResults?.filter(
      (result) => result.fileName && result.fileName.includes(submission.key)
    ) || [];

  const hasIssues = submissionValidationResults.some(
    (result) => result.outcome === "failed"
  );

  return (
    <div className="container mx-auto py-8 space-y-8">
      <SubmissionHeader
        submission={submission}
        participant={participant}
        validationResults={submissionValidationResults}
        domain={domain}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
        <div>
          <Tabs defaultValue="details" className="">
            <TabsList className="bg-background rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
              <TabsTrigger
                value="details"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Details & Timeline
              </TabsTrigger>
              <TabsTrigger
                value="validation"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                Validation Results
              </TabsTrigger>
              <TabsTrigger
                value="exif"
                className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
              >
                EXIF Data
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <SubmissionDetails
                submission={submission}
                participant={participant}
                hasIssues={hasIssues}
              />
            </TabsContent>

            <TabsContent value="validation" className="mt-4">
              <ValidationStepsTable
                validationResults={submissionValidationResults}
              />
            </TabsContent>

            <TabsContent value="exif" className="mt-4 space-y-4">
              <ExifDataDisplay exifData={submission.exif} />
            </TabsContent>
          </Tabs>
        </div>
        <PhotoSubmissionCard
          submission={submission}
          participant={participant}
        />
      </div>
    </div>
  );
}
