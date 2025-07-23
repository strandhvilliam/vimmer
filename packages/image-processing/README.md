# @vimmer/image-processing

Shared image processing utilities for the Vimmer photo marathon platform.

## Features

- EXIF data extraction and normalization
- Image variant generation (thumbnails, previews)
- S3 file operations
- Key parsing utilities

## Usage

```typescript
import {
  parseExifData,
  generateImageVariants,
  getFileFromS3,
  uploadFileToS3,
} from "@vimmer/image-processing";

// Extract EXIF data
const exif = await parseExifData(fileBuffer);

// Generate image variants
const { thumbnailKey, previewKey } = await generateImageVariants(
  originalKey,
  fileBuffer,
  s3Client,
  thumbnailBucket,
  previewBucket,
);
```
