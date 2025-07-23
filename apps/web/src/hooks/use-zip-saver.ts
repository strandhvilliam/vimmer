import { useState } from "react";
import JSZip from "jszip";
import { getMimeTypeFromExtension, isImageFile } from "@/lib/utils";

interface FailedParticipant {
  participantRef: string;
  error: string;
}

interface UsePresignedPhotoSaverReturn {
  isLoading: boolean;
  error: string | null;
  statusMessage: string | null;
  failedParticipants: FailedParticipant[];
  savePhotos: (
    presignedUrls: string[],
    domain: string,
    imageWidth?: number,
  ) => Promise<void>;
}

function getProgress(domain: string): { processedParticipants: string[] } {
  const key = `export-progress-${domain}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : { processedParticipants: [] };
}

function saveProgress(domain: string, processedParticipants: string[]): void {
  const key = `export-progress-${domain}`;
  localStorage.setItem(key, JSON.stringify({ processedParticipants }));
}

function clearProgress(domain: string): void {
  const key = `export-progress-${domain}`;
  localStorage.removeItem(key);
}

export function useZipSaver(): UsePresignedPhotoSaverReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [failedParticipants, setFailedParticipants] = useState<
    FailedParticipant[]
  >([]);

  async function savePhotos(
    presignedUrls: string[],
    domain: string,
    imageWidth?: number | undefined,
  ): Promise<void> {
    setIsLoading(true);
    setError(null);
    setFailedParticipants([]);
    setStatusMessage("Requesting directory access...");

    try {
      if (!presignedUrls || presignedUrls.length === 0) {
        setStatusMessage("No photo archives found for this marathon.");
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
        setStatusMessage("Directory selected. Fetching photo archives...");

        // Create marathon domain folder
        const marathonDirHandle = await dirHandle.getDirectoryHandle(domain, {
          create: true,
        });

        setStatusMessage(
          `Found ${presignedUrls.length} archive(s). ${imageWidth ? `Resizing images to ${imageWidth}px...` : `Processing without resizing...`}`,
        );

        for (let i = 0; i < presignedUrls.length; i++) {
          const url = presignedUrls[i];

          if (!url) {
            console.warn(`Skipping empty URL at index ${i}`);
            continue;
          }

          let participantRef = "participant";
          try {
            const urlPath = new URL(url).pathname;
            const parts = urlPath.split("/");
            const fileNameWithExtension = parts[parts.length - 1];
            if (typeof fileNameWithExtension === "string") {
              participantRef = fileNameWithExtension.replace(/\.zip$/, "");
            }
          } catch (e) {
            console.warn(
              `Could not parse filename from URL: ${url}. Using default '${participantRef}'.`,
              e,
            );
          }

          // Skip if already processed
          if (progress.processedParticipants.includes(participantRef)) {
            setStatusMessage(
              `Skipping already processed participant ${participantRef} (${i + 1}/${presignedUrls.length})`,
            );
            continue;
          }

          setStatusMessage(
            `Processing participant ${participantRef} (${i + 1}/${presignedUrls.length})...`,
          );

          let resp: Response;
          try {
            resp = await fetch(url);
            if (!resp.ok) {
              const errorMessage = `HTTP ${resp.status}: ${resp.statusText}`;
              setFailedParticipants((prev) => [
                ...prev,
                {
                  participantRef,
                  error: `Failed to download archive: ${errorMessage}`,
                },
              ]);
              setStatusMessage(
                `Failed to download ${participantRef} (${i + 1}/${presignedUrls.length}): ${errorMessage}. Continuing with next participant...`,
              );
              continue;
            }
          } catch (fetchError) {
            const errorMessage =
              fetchError instanceof Error
                ? fetchError.message
                : "Network error";
            setFailedParticipants((prev) => [
              ...prev,
              {
                participantRef,
                error: `Network error: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Network error for ${participantRef} (${i + 1}/${presignedUrls.length}): ${errorMessage}. Continuing with next participant...`,
            );
            continue;
          }

          let zipBlob: Blob;
          try {
            zipBlob = await resp.blob();
          } catch (blobError) {
            const errorMessage =
              blobError instanceof Error
                ? blobError.message
                : "Failed to read response";
            setFailedParticipants((prev) => [
              ...prev,
              {
                participantRef,
                error: `Failed to read archive data: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Failed to read data for ${participantRef} (${i + 1}/${presignedUrls.length}): ${errorMessage}. Continuing with next participant...`,
            );
            continue;
          }

          // Create participant folder
          const participantDirHandle =
            await marathonDirHandle.getDirectoryHandle(participantRef, {
              create: true,
            });

          setStatusMessage(
            `Extracting and resizing images for ${participantRef}...`,
          );

          let zip: JSZip;
          try {
            zip = await JSZip.loadAsync(zipBlob);
          } catch (zipError) {
            const errorMessage =
              zipError instanceof Error ? zipError.message : "Invalid zip file";
            setFailedParticipants((prev) => [
              ...prev,
              {
                participantRef,
                error: `Failed to extract zip: ${errorMessage}`,
              },
            ]);
            setStatusMessage(
              `Failed to extract ${participantRef} (${i + 1}/${presignedUrls.length}): ${errorMessage}. Continuing with next participant...`,
            );
            continue;
          }
          const imageFiles = Object.keys(zip.files).filter(
            (path) =>
              !zip.files[path]?.dir && /\.(jpg|jpeg|png|webp)$/i.test(path),
          );

          let orderIndex = 1;

          // Process images in batches to manage memory
          const batchSize = 5;
          for (
            let batchStart = 0;
            batchStart < imageFiles.length;
            batchStart += batchSize
          ) {
            const batch = imageFiles.slice(batchStart, batchStart + batchSize);

            for (const relativePath of batch) {
              const zipEntry = zip.files[relativePath];
              if (zipEntry && !zipEntry.dir) {
                try {
                  const originalBlob = await zipEntry.async("blob");

                  if (isImageFile(relativePath)) {
                    setStatusMessage(
                      `Resizing image ${orderIndex}/${imageFiles.length} for ${participantRef}...`,
                    );

                    let finalBlob: Blob = originalBlob;
                    if (imageWidth && imageWidth > 0) {
                      finalBlob = await resizeImage(
                        originalBlob,
                        imageWidth,
                        relativePath,
                      );
                    }
                    const extension =
                      relativePath.split(".").pop()?.toLowerCase() || "jpg";
                    const newFileName = `${participantRef}_${orderIndex.toString().padStart(2, "0")}.${extension}`;

                    const fileHandle = await participantDirHandle.getFileHandle(
                      newFileName,
                      {
                        create: true,
                      },
                    );
                    const writable = await fileHandle.createWritable();
                    await writable.write(finalBlob);
                    await writable.close();

                    orderIndex++;
                  } else {
                    // Non-image files, save as-is
                    const fileHandle = await participantDirHandle.getFileHandle(
                      relativePath,
                      {
                        create: true,
                      },
                    );
                    const writable = await fileHandle.createWritable();
                    await writable.write(originalBlob);
                    await writable.close();
                  }
                } catch (fileError) {
                  console.error(
                    `Error processing file ${relativePath}:`,
                    fileError,
                  );
                  const errorMessage =
                    fileError instanceof Error
                      ? fileError.message
                      : "Unknown file processing error";
                  setFailedParticipants((prev) => {
                    const existing = prev.find(
                      (p) => p.participantRef === participantRef,
                    );
                    if (existing) {
                      return prev.map((p) =>
                        p.participantRef === participantRef
                          ? {
                              ...p,
                              error: `${p.error}; File ${relativePath}: ${errorMessage}`,
                            }
                          : p,
                      );
                    }
                    return [
                      ...prev,
                      {
                        participantRef,
                        error: `Failed to process file ${relativePath}: ${errorMessage}`,
                      },
                    ];
                  });
                }
              }
            }

            // Small delay between batches to allow garbage collection
            if (batchStart + batchSize < imageFiles.length) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
          }

          progress.processedParticipants.push(participantRef);
          saveProgress(domain, progress.processedParticipants);

          setStatusMessage(
            `Completed processing ${participantRef} (${i + 1}/${presignedUrls.length})`,
          );
        }

        clearProgress(domain);

        if (failedParticipants.length > 0) {
          setStatusMessage(
            `Export completed with ${failedParticipants.length} failed participant(s). Successfully processed ${presignedUrls.length - failedParticipants.length} participants.`,
          );
        } else {
          setStatusMessage(
            "All photos have been successfully downloaded, resized, and saved!",
          );
        }
      } else {
        // Fallback for browsers without File System Access API support
        setStatusMessage(
          `File System Access API not supported. Found ${presignedUrls.length} archive(s). ` +
            "You will need to download each .zip file individually and unzip them manually. " +
            "Downloads will begin shortly.",
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
              e,
            );
          }

          setStatusMessage(
            `Preparing download for archive ${i + 1} of ${
              presignedUrls.length
            }: ${zipFileName}. Please check your browser downloads.`,
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
              `Download started for ${zipFileName}. Check your browser's download manager.`,
            );
            // Add a small delay to allow the browser to initiate multiple downloads if needed,
            // though modern browsers usually handle this well.
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (downloadError) {
            console.error(
              `Error triggering download for ${zipFileName}:`,
              downloadError,
            );
            const errorMessage =
              downloadError instanceof Error
                ? downloadError.message
                : "Unknown download error";

            let participantRef = "participant";
            try {
              const urlPath = new URL(url).pathname;
              const parts = urlPath.split("/");
              const fileNameWithExtension = parts[parts.length - 1];
              if (typeof fileNameWithExtension === "string") {
                participantRef = fileNameWithExtension.replace(/\.zip$/, "");
              }
            } catch (e) {
              // Use default participantRef
            }

            setFailedParticipants((prev) => [
              ...prev,
              {
                participantRef,
                error: `Failed to start download: ${errorMessage}`,
              },
            ]);
          }
        }
        if (failedParticipants.length > 0) {
          setStatusMessage(
            `Download attempts completed with ${failedParticipants.length} failed participant(s). Successfully initiated ${presignedUrls.length - failedParticipants.length} downloads. Please check your browser's download manager.`,
          );
        } else {
          setStatusMessage(
            "All download attempts initiated. Please check your browser's download manager and unzip the files manually.",
          );
        }
      }
    } catch (err) {
      console.error("Error saving photos:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  return { isLoading, error, statusMessage, failedParticipants, savePhotos };
}

async function resizeImage(
  blob: Blob,
  targetWidth: number,
  filename: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    img.onload = () => {
      const aspectRatio = img.height / img.width;
      const targetHeight = targetWidth * aspectRatio;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const mimeType = getMimeTypeFromExtension(filename);
      if (mimeType === "image/png") {
        ctx.clearRect(0, 0, targetWidth, targetHeight);
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Use appropriate format and quality based on original image type
      const outputMimeType =
        mimeType === "image/png" ? "image/png" : "image/jpeg";
      const quality = outputMimeType === "image/jpeg" ? 0.9 : undefined;

      canvas.toBlob(
        (resizedBlob) => {
          // Clean up
          URL.revokeObjectURL(img.src);

          if (resizedBlob) {
            resolve(resizedBlob);
          } else {
            reject(new Error("Failed to resize image"));
          }
        },
        outputMimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    const objectUrl = URL.createObjectURL(blob);
    img.src = objectUrl;
  });
}
