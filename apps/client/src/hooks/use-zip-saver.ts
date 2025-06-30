import { useState } from "react";
import JSZip from "jszip";

interface UsePresignedPhotoSaverReturn {
  isLoading: boolean;
  error: string | null;
  statusMessage: string | null;
  savePhotos: (presignedUrls: string[]) => Promise<void>;
}

export function useZipSaver(): UsePresignedPhotoSaverReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function savePhotos(presignedUrls: string[]): Promise<void> {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Requesting directory access...");

    try {
      if (!presignedUrls || presignedUrls.length === 0) {
        setStatusMessage("No photo archives found for this marathon.");
        setIsLoading(false);
        return;
      }

      // Check for File System Access API support
      // @ts-expect-error - File System Access API types might not be fully available
      if (window.showDirectoryPicker) {
        setStatusMessage(
          "File System Access API supported. Requesting directory access..."
        );
        // @ts-expect-error - File System Access API types might not be fully available
        const dirHandle = await window.showDirectoryPicker();
        setStatusMessage("Directory selected. Fetching photo archives...");

        setStatusMessage(
          `Found ${presignedUrls.length} archive(s). Downloading and processing directly to selected directory...`
        );

        for (let i = 0; i < presignedUrls.length; i++) {
          const url = presignedUrls[i];
          setStatusMessage(
            `Processing archive ${i + 1} of ${presignedUrls.length}...`
          );

          if (!url) {
            console.warn(`Skipping empty URL at index ${i}`);
            continue;
          }

          let zipFolderName = "archive";
          try {
            const urlPath = new URL(url).pathname;
            const parts = urlPath.split("/");
            const fileNameWithExtension = parts[parts.length - 1];
            if (typeof fileNameWithExtension === "string") {
              zipFolderName = fileNameWithExtension.replace(/\.zip$/, "");
            }
          } catch (e) {
            console.warn(
              `Could not parse filename from URL: ${url}. Using default '${zipFolderName}'.`,
              e
            );
          }

          const resp = await fetch(url);
          if (!resp.ok) {
            setError(
              `Failed to download archive ${i + 1} (${zipFolderName}.zip): ${resp.statusText}`
            );
            continue;
          }

          const zipBlob = await resp.blob();
          const dirHandleFromPicker = dirHandle; // Assign to a new var to help TS
          const zipSpecificDirHandle =
            await dirHandleFromPicker.getDirectoryHandle(zipFolderName, {
              create: true,
            });
          setStatusMessage(
            `Unzipping files from ${zipFolderName}.zip into folder '${zipFolderName}'...`
          );

          const zip = await JSZip.loadAsync(zipBlob);
          for (const relativePath in zip.files) {
            const zipEntry = zip.files[relativePath];
            if (zipEntry) {
              if (zipEntry.dir) {
                await zipSpecificDirHandle.getDirectoryHandle(relativePath, {
                  create: true,
                });
              } else {
                const fileData = await zipEntry.async("blob");
                const fileHandle = await zipSpecificDirHandle.getFileHandle(
                  relativePath,
                  {
                    create: true,
                  }
                );
                const writable = await fileHandle.createWritable();
                await writable.write(fileData);
                await writable.close();
              }
            }
          }
          setStatusMessage(
            `Archive ${zipFolderName}.zip successfully processed into folder '${zipFolderName}'.`
          );
        }
      } else {
        // Fallback for browsers without File System Access API support
        setStatusMessage(
          `File System Access API not supported. Found ${presignedUrls.length} archive(s). ` +
            "You will need to download each .zip file individually and unzip them manually. " +
            "Downloads will begin shortly."
        );

        for (let i = 0; i < presignedUrls.length; i++) {
          const url = presignedUrls[i];
          if (!url) {
            console.warn(`Skipping empty URL at index ${i}`);
            continue;
          }

          let zipFileName = "archive.zip";
          try {
            const urlPath = new URL(url).pathname;
            const parts = urlPath.split("/");
            const extractedFileName = parts[parts.length - 1];
            if (
              typeof extractedFileName === "string" &&
              extractedFileName.endsWith(".zip")
            ) {
              zipFileName = extractedFileName;
            } else if (typeof extractedFileName === "string") {
              zipFileName = `${extractedFileName}.zip`;
            }
          } catch (e) {
            console.warn(
              `Could not parse filename from URL: ${url}. Using default '${zipFileName}'.`,
              e
            );
          }

          setStatusMessage(
            `Preparing download for archive ${i + 1} of ${
              presignedUrls.length
            }: ${zipFileName}. Please check your browser downloads.`
          );

          try {
            // Create a temporary link element to trigger the download
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", zipFileName); // Suggest a filename
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setStatusMessage(
              `Download started for ${zipFileName}. Check your browser's download manager.`
            );
            // Add a small delay to allow the browser to initiate multiple downloads if needed,
            // though modern browsers usually handle this well.
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (downloadError) {
            console.error(
              `Error triggering download for ${zipFileName}:`,
              downloadError
            );
            setError(`Failed to start download for ${zipFileName}.`);
            // Continue to the next file if one download fails
          }
        }
        setStatusMessage(
          "All download attempts initiated. Please check your browser's download manager and unzip the files manually."
        );
      }

      setStatusMessage(
        "All photos have been successfully downloaded and saved!"
      );
    } catch (err) {
      console.error("Error saving photos:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, statusMessage, savePhotos };
}
