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
