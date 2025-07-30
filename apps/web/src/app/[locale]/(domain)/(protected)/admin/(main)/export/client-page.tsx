"use client";

import { Card, CardContent } from "@vimmer/ui/components/card";
import { FileSpreadsheet, FileText, Image } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { ExportOptions } from "@/components/admin/export-options";
import { ParticipantArchivesDownload } from "@/components/admin/participant-archives-download";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";

export const EXPORT_KEYS = {
  ZIP_PREVIEWS: "zip_previews",
  ZIP_THUMBNAILS: "zip_thumbnails",
  ZIP_SUBMISSIONS: "zip_submissions",
  ZIP_CONTACT_SHEETS: "zip_contact_sheets",
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

  // Contact sheet status calculation
  const participantsWithContactSheets = participants.filter(
    (p) => p.contactSheetKey,
  ).length;
  const contactSheetStatus =
    participantCount === 0
      ? "none"
      : participantsWithContactSheets === participantCount
        ? "all"
        : participantsWithContactSheets > 0
          ? "some"
          : "none";

  const getContactSheetStatusColor = (status: string) => {
    switch (status) {
      case "all":
        return "bg-green-100 text-green-800 border-green-200";
      case "some":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "none":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

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

      <div className="space-y-6">
        <ParticipantArchivesDownload
          domain={domain}
          marathonId={marathon.id}
          canDownload={canDownloadZippedSubmissions}
          participantCount={participantCount}
          zippedSubmissionsCount={zippedSubmissionsCount}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    Export detailed submission information including upload
                    times, status, and validation results.
                  </p>
                </div>
                <ExportOptions
                  domain={domain}
                  type={EXPORT_KEYS.XLSX_SUBMISSIONS}
                  label="Export"
                />
              </div>
            </CardContent>
          </Card>
        </div>

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
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  <h2 className="text-lg font-semibold font-rocgrotesk">
                    Contact Sheets
                  </h2>
                  <Badge
                    className={`${getContactSheetStatusColor(contactSheetStatus)} border`}
                  >
                    {participantsWithContactSheets}/{participantCount}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all available contact sheets as a ZIP archive. Contact
                  sheets show participant submissions in a grid layout.
                </p>
              </div>
              <ExportOptions
                domain={domain}
                type={EXPORT_KEYS.ZIP_CONTACT_SHEETS}
                label="Export"
                disabled={participantsWithContactSheets === 0}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
