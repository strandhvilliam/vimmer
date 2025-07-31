import { useState } from "react";

interface FailedContactSheet {
  participantRef: string;
  error: string;
}

interface UseContactSheetSaverReturn {
  isLoading: boolean;
  error: string | null;
  statusMessage: string | null;
  failedContactSheets: FailedContactSheet[];
  saveContactSheets: (
    contactSheetUrls: { participantRef: string; url: string }[],
    domain: string,
  ) => Promise<void>;
}

function getProgress(domain: string): { processedContactSheets: string[] } {
  const key = `contact-sheet-progress-${domain}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : { processedContactSheets: [] };
}

function saveProgress(domain: string, processedContactSheets: string[]): void {
  const key = `contact-sheet-progress-${domain}`;
  localStorage.setItem(key, JSON.stringify({ processedContactSheets }));
}

function clearProgress(domain: string): void {
  const key = `contact-sheet-progress-${domain}`;
  localStorage.removeItem(key);
}

export function useContactSheetSaver(): UseContactSheetSaverReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [failedContactSheets, setFailedContactSheets] = useState<
    FailedContactSheet[]
  >([]);

  async function saveContactSheets(
    contactSheetUrls: { participantRef: string; url: string }[],
    domain: string,
  ): Promise<void> {
    setIsLoading(true);
    setError(null);
    setFailedContactSheets([]);
    setStatusMessage("Requesting directory access...");

    try {
      if (!contactSheetUrls || contactSheetUrls.length === 0) {
        setStatusMessage("No contact sheets found for this marathon.");
        setIsLoading(false);
        return;
      }

      const progress = getProgress(domain);

      // Check for File System Access API support
      // @ts-expect-error - File System Access API types might not be fully available
      if (window.showDirectoryPicker) {
        setStatusMessage(
          "File System Access API supported. Requesting directory access...",
        );
        // @ts-expect-error - File System Access API types might not be fully available
        const dirHandle = await window.showDirectoryPicker();
        setStatusMessage("Directory selected. Fetching contact sheets...");

        // Create marathon domain folder
        const marathonDirHandle = await dirHandle.getDirectoryHandle(domain, {
          create: true,
        });

        // Create contact sheets subfolder
        const contactSheetsDirHandle =
          await marathonDirHandle.getDirectoryHandle("contact-sheets", {
            create: true,
          });

        setStatusMessage(
          `Found ${contactSheetUrls.length} contact sheet(s). Processing...`,
        );

        for (let i = 0; i < contactSheetUrls.length; i++) {
          const contactSheetData = contactSheetUrls[i];
          if (!contactSheetData) {
            console.warn(`Skipping empty contact sheet at index ${i}`);
            continue;
          }

          const { participantRef, url } = contactSheetData;

          if (!url) {
            console.warn(
              `Skipping empty URL for participant ${participantRef}`,
            );
            continue;
          }

          // Skip if already processed
          if (progress.processedContactSheets.includes(participantRef)) {
            setStatusMessage(
              `Skipping already processed contact sheet for ${participantRef} (${i + 1}/${contactSheetUrls.length})`,
            );
            continue;
          }

          setStatusMessage(
            `Processing contact sheet for ${participantRef} (${i + 1}/${contactSheetUrls.length})...`,
          );

          let resp: Response;
          try {
            resp = await fetch(url);
            if (!resp.ok) {
              const errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
              setFailedContactSheets((prev) => [
                ...prev,
                {
                  participantRef,
                  error: `Failed to download contact sheet: ${errorMessage}`,
                },
              ]);
              setStatusMessage(
                `Failed to download contact sheet for ${participantRef} (${i + 1}/${contactSheetUrls.length}): ${errorMessage}. Continuing with next...`,
              );
              continue;
            }
          } catch (fetchError) {
            const errorMessage =
              fetchError instanceof Error
                ? fetchError.message
                : "Network error";
            setFailedContactSheets((prev) => [
              ...prev,
              {
                participantRef,
                error: `Network error: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Network error for ${participantRef} (${i + 1}/${contactSheetUrls.length}): ${errorMessage}. Continuing with next...`,
            );
            continue;
          }

          let imageBlob: Blob;
          try {
            imageBlob = await resp.blob();
          } catch (blobError) {
            const errorMessage =
              blobError instanceof Error
                ? blobError.message
                : "Failed to read response";
            setFailedContactSheets((prev) => [
              ...prev,
              {
                participantRef,
                error: `Failed to read contact sheet data: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Failed to read data for ${participantRef} (${i + 1}/${contactSheetUrls.length}): ${errorMessage}. Continuing with next...`,
            );
            continue;
          }

          try {
            // Determine file extension from content type or URL
            const contentType = resp.headers.get("content-type");
            let extension = "jpg";
            if (contentType?.includes("png")) {
              extension = "png";
            } else if (contentType?.includes("webp")) {
              extension = "webp";
            } else if (url.includes(".png")) {
              extension = "png";
            } else if (url.includes(".webp")) {
              extension = "webp";
            }

            const fileName = `${participantRef}_contact_sheet.${extension}`;

            const fileHandle = await contactSheetsDirHandle.getFileHandle(
              fileName,
              { create: true },
            );
            const writable = await fileHandle.createWritable();
            await writable.write(imageBlob);
            await writable.close();

            progress.processedContactSheets.push(participantRef);
            saveProgress(domain, progress.processedContactSheets);

            setStatusMessage(
              `Completed contact sheet for ${participantRef} (${i + 1}/${contactSheetUrls.length})`,
            );
          } catch (fileError) {
            const errorMessage =
              fileError instanceof Error
                ? fileError.message
                : "Unknown file processing error";
            setFailedContactSheets((prev) => [
              ...prev,
              {
                participantRef,
                error: `Failed to save contact sheet: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Failed to save contact sheet for ${participantRef} (${i + 1}/${contactSheetUrls.length}): ${errorMessage}. Continuing with next...`,
            );
            continue;
          }
        }

        clearProgress(domain);

        if (failedContactSheets.length > 0) {
          setStatusMessage(
            `Export completed with ${failedContactSheets.length} failed contact sheet(s). Successfully processed ${contactSheetUrls.length - failedContactSheets.length} contact sheets.`,
          );
        } else {
          setStatusMessage(
            "All contact sheets have been successfully downloaded and saved!",
          );
        }
      } else {
        // Fallback for browsers without File System Access API support
        setStatusMessage(
          `File System Access API not supported. Found ${contactSheetUrls.length} contact sheet(s). ` +
            "You will need to download each contact sheet individually. " +
            "Downloads will begin shortly.",
        );

        for (let i = 0; i < contactSheetUrls.length; i++) {
          const fallbackContactSheet = contactSheetUrls[i];
          if (!fallbackContactSheet) {
            console.warn(`Skipping empty contact sheet at index ${i}`);
            continue;
          }

          const { participantRef: fallbackParticipantRef, url: fallbackUrl } =
            fallbackContactSheet;
          if (!fallbackUrl) {
            console.warn(
              `Skipping empty URL for participant ${fallbackParticipantRef}`,
            );
            continue;
          }

          setStatusMessage(
            `Preparing download for contact sheet ${i + 1} of ${
              contactSheetUrls.length
            }: ${fallbackParticipantRef}. Please check your browser downloads.`,
          );

          try {
            // Create a temporary link element to trigger the download
            const link = document.createElement("a");
            link.href = fallbackUrl;
            link.setAttribute(
              "download",
              `${fallbackParticipantRef}_contact_sheet.jpg`,
            );
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setStatusMessage(
              `Download started for ${fallbackParticipantRef} contact sheet. Check your browser's download manager.`,
            );
            // Add a small delay to allow the browser to initiate multiple downloads
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (downloadError) {
            console.error(
              `Error triggering download for ${fallbackParticipantRef}:`,
              downloadError,
            );
            const errorMessage =
              downloadError instanceof Error
                ? downloadError.message
                : "Unknown download error";

            setFailedContactSheets((prev) => [
              ...prev,
              {
                participantRef: fallbackParticipantRef,
                error: `Failed to start download: ${errorMessage}`,
              },
            ]);
          }
        }

        if (failedContactSheets.length > 0) {
          setStatusMessage(
            `Download attempts completed with ${failedContactSheets.length} failed contact sheet(s). Successfully initiated ${contactSheetUrls.length - failedContactSheets.length} downloads. Please check your browser's download manager.`,
          );
        } else {
          setStatusMessage(
            "All download attempts initiated. Please check your browser's download manager.",
          );
        }
      }
    } catch (err) {
      console.error("Error saving contact sheets:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    statusMessage,
    failedContactSheets,
    saveContactSheets,
  };
}
