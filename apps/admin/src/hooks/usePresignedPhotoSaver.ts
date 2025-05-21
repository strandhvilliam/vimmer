import { useState } from "react";
import JSZip from "jszip";

interface UsePresignedPhotoSaverReturn {
  isLoading: boolean;
  error: string | null;
  statusMessage: string | null;
  savePhotos: (
    marathonId: string,
    domain: string | string[] | undefined
  ) => Promise<void>;
}

export function usePresignedPhotoSaver(): UsePresignedPhotoSaverReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function savePhotos(
    marathonId: string,
    domain: string | string[] | undefined
  ): Promise<void> {
    setIsLoading(true);
    setError(null);
    setStatusMessage("Requesting directory access...");

    try {
      // @ts-expect-error - File System Access API types might not be fully available
      const dirHandle = await window.showDirectoryPicker();
      setStatusMessage("Directory selected. Fetching photo archives...");

      const apiUrl = process.env.NEXT_PUBLIC_DOWNLOAD_PRESIGNED_API_URL;
      if (!apiUrl) {
        setError(
          "API URL for downloading presigned URLs is not configured. Please set NEXT_PUBLIC_DOWNLOAD_PRESIGNED_API_URL."
        );
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${apiUrl!}?domain=${domain}`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch presigned URLs: ${response.statusText}`
        );
      }
      const { presignedUrls } = (await response.json()) as {
        presignedUrls: string[];
      };

      if (!presignedUrls || presignedUrls.length === 0) {
        setStatusMessage("No photo archives found for this marathon.");
        setIsLoading(false);
        return;
      }

      setStatusMessage(
        `Found ${presignedUrls.length} archive(s). Downloading...`
      );

      for (let i = 0; i < presignedUrls.length; i++) {
        const url = presignedUrls[i];
        setStatusMessage(
          `Downloading and unzipping archive ${i + 1} of ${
            presignedUrls.length
          }...`
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
        const zipSpecificDirHandle = await dirHandle.getDirectoryHandle(
          zipFolderName,
          { create: true }
        );
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
