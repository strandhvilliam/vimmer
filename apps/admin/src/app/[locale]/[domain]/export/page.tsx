import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Button } from "@vimmer/ui/components/button";
import {
  Download,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Archive,
  AlertTriangle,
} from "lucide-react";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { ExportOptions } from "./_components/export-options";
import { PresignedPhotoSaverButton } from "./_components/PresignedPhotoSaverButton";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@vimmer/ui/components/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@vimmer/ui/components/alert-dialog";
import { EXPORT_KEYS } from "@/lib/constants";

export default async function ExportPage({
  params,
}: {
  params: Promise<{
    domain: string;
  }>;
}) {
  const { domain } = await params;
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Export Data</h1>
        <p className="text-muted-foreground">
          Export photos, participant information, and submission data for{" "}
          {marathon.name}
        </p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Photo Export</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export all submission photos in a zip file. Photos will be
                  organized by participant and topic.
                </p>
                <Alert
                  variant="default"
                  className="bg-yellow-500/10 border-yellow-500/50"
                >
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <AlertTitle className="text-yellow-500 text-sm">
                    Important Notice
                  </AlertTitle>
                  <AlertDescription className="text-yellow-500/90 text-xs">
                    Exporting photos will lock the marathon, preventing any
                    further edits or changes to participant information and
                    submissions.
                  </AlertDescription>
                </Alert>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="default">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Photo Export</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to export the photos? This action
                      will lock the marathon, preventing any further edits or
                      changes to participant information and submissions. This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction asChild>
                      <ExportOptions
                        domain={domain}
                        type={EXPORT_KEYS.ZIP_SUBMISSIONS}
                        label="Export & Lock Marathon"
                        description="Download all submission photos (locks marathon)"
                      />
                    </AlertDialogAction>
                    <AlertDialogAction asChild>
                      <PresignedPhotoSaverButton
                        marathonId={marathon.id.toString()}
                      />
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <h2 className="text-lg font-semibold">Participant Data</h2>
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
                  <h2 className="text-lg font-semibold">Submission Data</h2>
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
                  <h2 className="text-lg font-semibold">EXIF Data</h2>
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
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
