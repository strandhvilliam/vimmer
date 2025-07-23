export declare function parseExifData(
  file: Uint8Array<ArrayBufferLike>,
): Promise<any>;

export declare function generateImageVariants(
  originalKey: string,
  file: Uint8Array,
  s3Client: any,
  thumbnailBucket: string,
  previewBucket: string,
): Promise<{ thumbnailKey: string; previewKey: string }>;

export declare function createVariant(
  originalKey: string,
  photoInstance: any,
  config: { width: number; prefix: string },
  s3Client: any,
  bucket: string,
): Promise<string | null>;

export declare function getFileFromS3(
  s3: any,
  key: string,
  bucket: string,
): Promise<{
  file: Uint8Array;
  mimeType?: string;
  size?: number;
  metadata?: Record<string, string>;
}>;

export declare function uploadFileToS3(
  s3: any,
  key: string,
  file: Buffer | Uint8Array,
  bucket: string,
  mimeType?: string,
): Promise<string>;

export declare function parseKey(key: string): {
  domain: string;
  participantRef: string;
  orderIndex: string;
  fileName: string;
};

export declare const IMAGE_VARIANTS: {
  readonly thumbnail: { width: 200; prefix: "thumbnail" };
  readonly preview: { width: 800; prefix: "preview" };
};
