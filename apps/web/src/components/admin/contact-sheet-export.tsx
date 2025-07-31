"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import {
  FolderOpen,
  Loader2,
  AlertTriangle,
  X,
  Image,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@vimmer/ui/components/card";
import { Badge } from "@vimmer/ui/components/badge";
import { Separator } from "@vimmer/ui/components/separator";
import { toast } from "sonner";
import { useContactSheetSaver } from "@/hooks/use-contact-sheet-saver";
import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { MultiStepLoader } from "@vimmer/ui/components/multi-step-loader";
import { Alert, AlertDescription } from "@vimmer/ui/components/alert";

interface ContactSheetExportProps {
  domain: string;
  marathonId: number;
  participantsWithContactSheets: number;
  totalParticipants: number;
  disabled?: boolean;
}

export function ContactSheetExport({
  domain,
  marathonId,
  participantsWithContactSheets,
  totalParticipants,
  disabled = false,
}: ContactSheetExportProps) {
  const trpc = useTRPC();
  const [showLoader, setShowLoader] = useState(false);
  const [failedContactSheets, setFailedContactSheets] = useState<number[]>([]);
  const [showErrorState, setShowErrorState] = useState(false);
  const [pendingData, setPendingData] = useState<any>(null);

  const contactSheetSaver = useContactSheetSaver();

  const loadingStates = [
    { text: "Generating presigned URLs for contact sheets..." },
    { text: "Processing contact sheets..." },
    { text: "Preparing download..." },
    { text: "Starting download..." },
  ];

  const handleContinueAnyway = async () => {
    if (
      pendingData &&
      Array.isArray(pendingData.contactSheetUrls) &&
      pendingData.contactSheetUrls.length > 0
    ) {
      setShowErrorState(false);
      try {
        await contactSheetSaver.saveContactSheets(
          pendingData.contactSheetUrls,
          domain,
        );
        setShowLoader(false);

        if (contactSheetSaver.failedContactSheets.length > 0) {
          toast.error(
            `Export completed with ${contactSheetSaver.failedContactSheets.length} errors`,
            {
              description:
                "Some contact sheets failed to process. Check the error details below.",
            },
          );
        }
      } catch (error) {
        setShowLoader(false);
        toast.error("Failed to save contact sheets", {
          description:
            error instanceof Error
              ? error.message
              : "An unknown error occurred.",
        });
      }
    }
    setFailedContactSheets([]);
    setPendingData(null);
  };

  const handleCancelExport = () => {
    setShowLoader(false);
    setShowErrorState(false);
    setFailedContactSheets([]);
    setPendingData(null);
  };

  const { mutate: generateContactSheetUrls, isPending: isGenerating } =
    useMutation(
      trpc.presignedUrls.generateContactSheetPresignedUrls.mutationOptions({
        onSuccess: async (data) => {
          if (data.failedParticipantIds.length > 0) {
            setFailedContactSheets(data.failedParticipantIds);
            setPendingData(data);
            setShowErrorState(true);
            return;
          }

          if (
            Array.isArray(data.contactSheetUrls) &&
            data.contactSheetUrls.length > 0
          ) {
            try {
              await contactSheetSaver.saveContactSheets(
                data.contactSheetUrls,
                domain,
              );
              setShowLoader(false);

              if (contactSheetSaver.failedContactSheets.length > 0) {
                toast.error(
                  `Export completed with ${contactSheetSaver.failedContactSheets.length} errors`,
                  {
                    description:
                      "Some contact sheets failed to process. Check the error details below.",
                  },
                );
              }
            } catch (error) {
              setShowLoader(false);
              toast.error("Failed to save contact sheets", {
                description:
                  error instanceof Error
                    ? error.message
                    : "An unknown error occurred.",
              });
            }
          } else {
            setShowLoader(false);
          }
        },
        onError: (err) => {
          setShowLoader(false);
          toast.error("Failed to fetch contact sheet URLs", {
            description: err.message,
          });
          console.error("Failed to fetch contact sheet URLs", err);
        },
      }),
    );

  const handleDownload = () => {
    setShowLoader(true);
    generateContactSheetUrls({ marathonId });
  };

  const getContactSheetStatusColor = () => {
    if (totalParticipants === 0)
      return "bg-gray-100 text-gray-800 border-gray-200";
    if (participantsWithContactSheets === totalParticipants) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    if (participantsWithContactSheets > 0) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                <h2 className="text-lg font-semibold font-rocgrotesk">
                  Contact Sheets
                </h2>
                <Badge className={`${getContactSheetStatusColor()} border`}>
                  {participantsWithContactSheets}/{totalParticipants}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all available contact sheets to a local folder. Contact
                sheets show participant submissions in a grid layout.
              </p>

              {/* Browser Compatibility Info */}
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mt-4">
                <div className="flex items-center gap-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/e/e1/Google_Chrome_icon_%28February_2022%29.svg"
                    alt="Chrome"
                    className="h-5 w-5"
                  />
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/98/Microsoft_Edge_logo_%282019%29.svg"
                    alt="Edge"
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <p className="text-xs font-medium">Chrome & Edge Only</p>
                  <p className="text-xs text-muted-foreground">
                    File system access required
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <Button
                onClick={handleDownload}
                disabled={
                  contactSheetSaver.isLoading ||
                  disabled ||
                  isGenerating ||
                  participantsWithContactSheets === 0
                }
                size="lg"
                className="h-12 text-base font-medium"
              >
                {contactSheetSaver.isLoading || isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {contactSheetSaver.statusMessage || "Processing..."}
                  </>
                ) : (
                  <>
                    <FolderOpen className="mr-2 h-5 w-5" />
                    Save to Local Folder
                  </>
                )}
              </Button>

              {/* Status Messages */}
              {contactSheetSaver.error && (
                <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Error:</strong> {contactSheetSaver.error}
                  </AlertDescription>
                </Alert>
              )}

              {!contactSheetSaver.error &&
                contactSheetSaver.statusMessage &&
                !contactSheetSaver.isLoading &&
                !isGenerating && (
                  <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      {contactSheetSaver.statusMessage}
                    </AlertDescription>
                  </Alert>
                )}

              {/* Failed Contact Sheets */}
              {contactSheetSaver.failedContactSheets.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-red-600">
                      Failed Contact Sheets (
                      {contactSheetSaver.failedContactSheets.length})
                    </p>
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                    {contactSheetSaver.failedContactSheets.map(
                      (error, index) => (
                        <div
                          key={index}
                          className="text-xs bg-white dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded p-2"
                        >
                          <span className="font-medium text-red-700 dark:text-red-300">
                            {error.participantRef}:
                          </span>{" "}
                          <span className="text-red-600 dark:text-red-400">
                            {error.error}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <MultiStepLoader
        loadingStates={loadingStates}
        loading={showLoader && !showErrorState}
        duration={2000}
        loop={true}
      />

      {showErrorState && (
        <div className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl border">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="h-6 w-6 text-amber-500" />
              <h2 className="text-xl font-semibold font-rocgrotesk">
                Export Warning
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-sm text-muted-foreground">
                Failed to generate contact sheets for{" "}
                {failedContactSheets.length} participant(s).
              </p>

              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Failed Participant IDs:</strong>{" "}
                  {failedContactSheets.join(", ")}
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                You can continue with the export for the remaining participants
                or cancel to try again later.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleContinueAnyway}
                variant="default"
                className="flex-1"
              >
                Continue Anyway
              </Button>
              <Button
                onClick={handleCancelExport}
                variant="outline"
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
