import posthog from "posthog-js";

export interface ResizeOptions {
  width: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface ResizedImage {
  blob: Blob;
  width: number;
  height: number;
}
export async function resizeImage(
  file: File,
  options: ResizeOptions,
): Promise<ResizedImage> {
  const { width: targetWidth, quality = 0.9, format = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const aspectRatio = img.height / img.width;
        const newWidth = targetWidth;
        const newHeight = Math.round(targetWidth * aspectRatio);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob from canvas"));
              return;
            }

            resolve({
              blob,
              width: newWidth,
              height: newHeight,
            });
          },
          format,
          quality,
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function resizeImageToMultipleSizes(
  file: File,
  sizes: ResizeOptions[],
): Promise<ResizedImage[]> {
  const resizePromises = sizes.map((options) => resizeImage(file, options));
  return Promise.all(resizePromises);
}

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
      URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
  });
}

// Web Worker instance for thumbnail generation
let thumbnailWorker: Worker | null = null;
let workerSupported: boolean | null = null;
const pendingThumbnails = new Map<
  string,
  { resolve: (value: string) => void; reject: (error: Error) => void }
>();

function initThumbnailWorker(): boolean {
  if (workerSupported !== null) return workerSupported;

  try {
    // Check for required APIs
    if (
      typeof Worker === "undefined" ||
      typeof OffscreenCanvas === "undefined"
    ) {
      workerSupported = false;
      return false;
    }

    thumbnailWorker = new Worker("/thumbnail-worker.js");

    thumbnailWorker.onmessage = (e) => {
      const { success, thumbnail, error, id } = e.data;
      const pending = pendingThumbnails.get(id);

      if (pending) {
        pendingThumbnails.delete(id);
        if (success) {
          pending.resolve(thumbnail);
        } else {
          pending.reject(new Error(error));
        }
      }
    };

    thumbnailWorker.onerror = () => {
      workerSupported = false;
      // Reject all pending thumbnails
      for (const [id, pending] of pendingThumbnails) {
        pending.reject(new Error("Worker error"));
      }
      pendingThumbnails.clear();
    };

    workerSupported = true;
    return true;
  } catch (error) {
    console.warn(
      "Web Worker not supported, falling back to main thread:",
      error,
    );
    posthog.captureException("worker not supported");
    workerSupported = false;
    return false;
  }
}

async function generateThumbnailWithWorker(
  file: File,
  size: number = 200,
): Promise<string> {
  if (!initThumbnailWorker() || !thumbnailWorker) {
    throw new Error("Worker not available");
  }

  return new Promise((resolve, reject) => {
    const id = `${file.name}-${Date.now()}-${Math.random()}`;
    pendingThumbnails.set(id, { resolve, reject });

    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      pendingThumbnails.delete(id);
      reject(new Error("Thumbnail generation timeout"));
    }, 10000);

    const pending = pendingThumbnails.get(id)!;
    pending.resolve = (value: string) => {
      clearTimeout(timeout);
      resolve(value);
    };

    pending.reject = (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    };

    thumbnailWorker!.postMessage({
      imageData: file,
      size,
      quality: 0.8,
      id,
    });
  });
}

async function generateThumbnailMainThread(
  file: File,
  size: number = 200,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        const aspectRatio = img.height / img.width;
        let newWidth = size;
        let newHeight = size * aspectRatio;

        if (newHeight > size) {
          newHeight = size;
          newWidth = size / aspectRatio;
        }

        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = "#f0f0f0";
        ctx.fillRect(0, 0, size, size);

        const offsetX = (size - newWidth) / 2;
        const offsetY = (size - newHeight) / 2;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        URL.revokeObjectURL(img.src);
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(img.src);
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error("Failed to load image"));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function generateThumbnail(
  file: File,
  size: number = 200,
): Promise<string> {
  try {
    // Try Web Worker first for better performance
    return await generateThumbnailWithWorker(file, size);
  } catch (error) {
    console.warn(
      "Web Worker thumbnail generation failed, falling back to main thread:",
      error,
    );
    posthog.capture("no worker thumbnail generation", {
      error: error instanceof Error ? error.message : error,
    });
    // Fallback to main thread implementation
    return await generateThumbnailMainThread(file, size);
  }
}

export async function generateThumbnailWithCallback(
  file: File,
  size: number = 200,
  onProgress?: (
    stage: "worker-attempt" | "worker-failed" | "fallback-complete",
  ) => void,
): Promise<string> {
  try {
    onProgress?.("worker-attempt");
    // Try Web Worker first for better performance
    const result = await generateThumbnailWithWorker(file, size);
    return result;
  } catch (error) {
    console.warn(
      "Web Worker thumbnail generation failed, falling back to main thread:",
      error,
    );
    onProgress?.("worker-failed");
    posthog.capture("no worker thumbnail generation", {
      error: error instanceof Error ? error.message : error,
    });
    // Fallback to main thread implementation
    const result = await generateThumbnailMainThread(file, size);
    onProgress?.("fallback-complete");
    return result;
  }
}
