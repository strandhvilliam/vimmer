"use client";

import { Card, CardContent } from "@vimmer/ui/components/card";
import {
  Download,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { ExportOptions } from "@/components/admin/export-options";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

export const EXPORT_KEYS = {
  ZIP_PREVIEWS: "zip_previews",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_SUBMISSIONS: "zip_submissions",
  EXIF: "exif",
  XLSX_PARTICIPANTS: "xlsx_participants",
  XLSX_SUBMISSIONS: "xlsx_submissions",
} as const;

export function ExportClientPage() {
  const { domain } = useDomain();
  const trpc = useTRPC();

  const { data: marathon } = useSuspenseQuery(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomain.queryOptions({
      domain,
    }),
  );

  const { data: zippedSubmissions } = useQuery(
    trpc.submissions.getZippedSubmissionsByDomain.queryOptions(
      {
        marathonId: marathon!.id,
      },
      { enabled: !!marathon?.id },
    ),
  );

  const participantCount = participants.length;
  const zippedSubmissionsCount = zippedSubmissions?.length;
  const canDownloadZippedSubmissions =
    participantCount > 0 && participantCount === zippedSubmissionsCount;

  if (!marathon) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold font-rocgrotesk">Export Data</h1>
        <p className="text-muted-foreground">
          Export photos, participant information, and submission data for{" "}
          {marathon.name}
        </p>
      </div>

      <div className="space-y-4">
        <Card className="">
          <CardContent className="p-6 flex justify-between w-full items-center ">
            <div className="space-y-2 flex-grow">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <h2 className="text-lg font-semibold font-rocgrotesk">
                  Download Participant Archives
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Download all generated participant photo archives. Archives will
                be saved to a folder you select on your computer.
              </p>
              {canDownloadZippedSubmissions ? (
                <Alert
                  variant="default"
                  className="bg-green-500/10 border-green-500/50 w-fit"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 stroke-green-500" />
                  <AlertTitle className="text-green-500 text-sm">
                    Ready to Download
                  </AlertTitle>
                  <AlertDescription className="text-green-500/90 text-xs">
                    {participantCount} participant archive(s) are generated and
                    ready for download.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert
                  variant="destructive"
                  className="bg-red-500/10 border-red-500/50 w-fit"
                >
                  <AlertTriangle className="h-4 w-4 text-red-500 stroke-red-500" />
                  <AlertTitle className="text-red-500 text-sm">
                    Download Not Available
                  </AlertTitle>
                  <AlertDescription className="text-red-500/90 text-xs">
                    {participantCount === 0
                      ? "There are no participants in this marathon."
                      : `Photo downloads are not ready. Expected ${participantCount} participants, but found ${zippedSubmissionsCount}. Please generate archives first.`}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex items-center ml-auto">
              <ExportOptions
                domain={domain}
                type={EXPORT_KEYS.ZIP_SUBMISSIONS}
                label="Save to Local Folder"
                description="Download all participant photo archives"
                marathonId={marathon.id.toString()}
                // isExternallyDisabled={!canDownloadZippedSubmissions}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <h2 className="text-lg font-semibold font-rocgrotesk">
                    Participant Data
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export participant information including contact details,
                  competition class, and device group.
                </p>
              </div>
              <ExportOptions
                domain={domain}
                type={EXPORT_KEYS.XLSX_PARTICIPANTS}
                label="Export"
                description="Download participant data"
                marathonId={marathon.id.toString()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <h2 className="text-lg font-semibold font-rocgrotesk">
                    Submission Data
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export detailed submission information including upload times,
                  status, and validation results.
                </p>
              </div>
              <ExportOptions
                domain={domain}
                type={EXPORT_KEYS.XLSX_SUBMISSIONS}
                label="Export"
                description="Download submission data"
                marathonId={marathon.id.toString()}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-lg font-semibold font-rocgrotesk">
                    EXIF Data
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export EXIF metadata for all submissions. Choose between JSON
                  or text format.
                </p>
              </div>
              <ExportOptions
                domain={domain}
                type={EXPORT_KEYS.EXIF}
                label="Export"
                description="Download EXIF metadata"
                marathonId={marathon.id.toString()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
