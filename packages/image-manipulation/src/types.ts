import { Data } from "effect";
import type { Sharp, OverlayOptions } from "sharp";

export interface Image {
  readonly sharp: Sharp;
}

export class SharpError extends Data.TaggedError("SharpError")<{
  message?: string;
  cause?: unknown;
}> {}

export class CanvasImageError extends Data.TaggedError("CanvasImageError")<{
  message?: string;
  cause?: unknown;
}> {}

export interface SheetImagePart extends OverlayOptions {}
