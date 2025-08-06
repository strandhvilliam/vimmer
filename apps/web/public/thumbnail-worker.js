// Thumbnail generation Web Worker
self.onmessage = async function (e) {
  const { imageData, size, quality, id } = e.data;

  try {
    // Check if OffscreenCanvas is supported
    if (typeof OffscreenCanvas === "undefined") {
      throw new Error("OffscreenCanvas not supported");
    }

    // Create OffscreenCanvas
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Failed to get canvas context");
    }

    // Create ImageBitmap from the image data
    const imageBitmap = await createImageBitmap(imageData);

    // Calculate dimensions maintaining aspect ratio
    const aspectRatio = imageBitmap.height / imageBitmap.width;
    let newWidth = size;
    let newHeight = size * aspectRatio;

    if (newHeight > size) {
      newHeight = size;
      newWidth = size / aspectRatio;
    }

    // Fill background
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, size, size);

    // Center the image
    const offsetX = (size - newWidth) / 2;
    const offsetY = (size - newHeight) / 2;

    // Configure high-quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the image
    ctx.drawImage(imageBitmap, offsetX, offsetY, newWidth, newHeight);

    // Convert to blob
    const blob = await canvas.convertToBlob({
      type: "image/jpeg",
      quality: quality || 0.8,
    });

    // Convert blob to data URL
    const reader = new FileReader();
    reader.onload = function () {
      self.postMessage({
        success: true,
        thumbnail: reader.result,
        id,
      });
    };
    reader.onerror = function () {
      self.postMessage({
        success: false,
        error: "Failed to convert blob to data URL",
        id,
      });
    };
    reader.readAsDataURL(blob);

    // Clean up
    imageBitmap.close();
  } catch (error) {
    self.postMessage({
      success: false,
      error: error.message,
      id,
    });
  }
};
