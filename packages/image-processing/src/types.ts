export interface ImageVariantConfig {
  width: number;
  prefix: string;
}

export interface ParsedKey {
  domain: string;
  participantRef: string;
  orderIndex: string;
  fileName: string;
}

export interface FileFromS3 {
  file: Uint8Array;
  mimeType?: string;
  size?: number;
  metadata?: Record<string, string>;
}

export interface ImageVariants {
  thumbnailKey: string;
  previewKey: string;
}
