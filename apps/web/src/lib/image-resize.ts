/**
 * Client-side image resizing utility using Canvas API
 */

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

/**
 * Resize an image file to specified dimensions while maintaining aspect ratio
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions,
): Promise<ResizedImage> {
  const { width: targetWidth, quality = 0.9, format = "image/jpeg" } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        const aspectRatio = img.height / img.width;
        const newWidth = targetWidth;
        const newHeight = Math.round(targetWidth * aspectRatio);

        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Set canvas dimensions
        canvas.width = newWidth;
        canvas.height = newHeight;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert to blob
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

    // Load the image
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Resize image to multiple sizes in parallel
 */
export async function resizeImageToMultipleSizes(
  file: File,
  sizes: ResizeOptions[],
): Promise<ResizedImage[]> {
  const resizePromises = sizes.map((options) => resizeImage(file, options));
  return Promise.all(resizePromises);
}

/**
 * Get image dimensions without loading the full image
 */
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
