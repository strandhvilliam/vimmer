import sharp from "sharp";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  DEFAULT_PADDING,
  EXTRA_SPACING_ADJUSTMENT,
  IMAGE_SIZE_FACTOR,
  LABEL_FONT_SIZE,
  LANDSCAPE_ASPECT_RATIO,
  LARGE_GRID_SIZE,
  LARGE_IMAGE_COUNT,
  RGB_CHANNELS,
  ROW_SPACING,
  SEQUENCE_BOTTOM_MARGIN,
  SEQUENCE_FONT_SIZE_MIN,
  SEQUENCE_FONT_SIZE_RATIO,
  SEQUENCE_SPACE_RATIO,
  SEQUENCE_WIDTH_RATIO,
  SMALL_GRID_SIZE,
  SMALL_IMAGE_COUNT,
  TEXT_HEIGHT_RATIO,
  TEXT_SPACING_REDUCTION,
  TEXT_VERTICAL_POSITION,
  WHITE_BACKGROUND,
} from "./constants";
import type {
  CreateContactSheetParams,
  GridConfig,
  SponsorPosition,
} from "./types";
import {
  getImageFiles,
  getImageLabel,
  getSponsorFile,
  getSponsorPosition,
  uploadFinalSheet,
} from "./utils";
import { updateParticipantMutation } from "@vimmer/api/db/queries/participants.queries";
import { db } from "@vimmer/api/db";

function getGridConfig(
  sponsorPosition: string,
  imageCount: number,
): GridConfig {
  const isSmallGrid = imageCount === SMALL_IMAGE_COUNT;
  const gridSize = isSmallGrid ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
  const { row: sponsorRow, col: sponsorCol } = getSponsorPosition(
    sponsorPosition as SponsorPosition,
    isSmallGrid,
  );

  return {
    cols: gridSize,
    rows: gridSize,
    sponsorRow,
    sponsorCol,
  };
}

export async function createContactSheet({
  domain,
  keys,
  participantRef,
  sponsorPosition,
  sponsorKey,
  topics,
  currentContactSheetKey,
}: CreateContactSheetParams & {
  currentContactSheetKey?: string | null;
}): Promise<string> {
  const imageFiles = await getImageFiles(keys);
  const sponsorFile = await getSponsorFile(sponsorKey);

  if (!imageFiles.length) throw new Error("No images found");
  if (
    imageFiles.length !== SMALL_IMAGE_COUNT &&
    imageFiles.length !== LARGE_IMAGE_COUNT
  ) {
    throw new Error("Invalid image count");
  }
  const gridConfig = getGridConfig(sponsorPosition, imageFiles.length);
  const { cols, rows, sponsorRow, sponsorCol } = gridConfig;

  const textHeight = Math.round(CANVAS_HEIGHT * TEXT_HEIGHT_RATIO);
  const sequenceSpace = participantRef
    ? Math.round(CANVAS_HEIGHT * SEQUENCE_SPACE_RATIO)
    : 0;

  const availableWidth = CANVAS_WIDTH - DEFAULT_PADDING * (cols + 1);
  const availableHeight =
    CANVAS_HEIGHT -
    DEFAULT_PADDING * (rows + 1) -
    sequenceSpace +
    EXTRA_SPACING_ADJUSTMENT;

  const cellWidth = Math.floor(availableWidth / cols);
  const cellHeight = Math.floor(availableHeight / rows);

  const availableImageHeight =
    cellHeight - (textHeight - TEXT_SPACING_REDUCTION);

  let imageWidth: number, imageHeight: number;
  if (cellWidth / availableImageHeight > LANDSCAPE_ASPECT_RATIO) {
    imageHeight = Math.floor(availableImageHeight * IMAGE_SIZE_FACTOR);
    imageWidth = Math.floor(imageHeight * LANDSCAPE_ASPECT_RATIO);
  } else {
    imageWidth = Math.floor(cellWidth * IMAGE_SIZE_FACTOR);
    imageHeight = Math.floor(imageWidth / LANDSCAPE_ASPECT_RATIO);
  }

  const canvas = sharp({
    create: {
      width: CANVAS_WIDTH,
      height: CANVAS_HEIGHT,
      channels: RGB_CHANNELS,
      background: WHITE_BACKGROUND,
    },
  });

  async function processImage(
    buffer: Buffer,
    fit: "cover" | "inside",
  ): Promise<Buffer> {
    return await sharp(buffer)
      .resize(imageWidth, imageHeight, {
        fit,
        withoutEnlargement: false,
        background: WHITE_BACKGROUND,
      })
      .jpeg()
      .rotate()
      .toBuffer();
  }

  function escapeXml(unsafe: string) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function createTextLabel(label: string): Buffer {
    const textSvg = `
      <svg width="${cellWidth}" height="${textHeight}" viewBox="0 0 ${cellWidth} ${textHeight}">
        <text x="${Math.floor((cellWidth - imageWidth) / 2)}" y="${textHeight * TEXT_VERTICAL_POSITION}" 
              font-family="Arial, sans-serif" 
              font-size="${LABEL_FONT_SIZE}" 
              font-weight="medium"
              fill="black" 
              text-anchor="start"
              >${escapeXml(label)}</text>
      </svg>
    `;
    return Buffer.from(textSvg);
  }

  function getImagePosition(x: number, y: number) {
    return {
      top: y + Math.floor((availableImageHeight - imageHeight) / 2),
      left: x + Math.floor((cellWidth - imageWidth) / 2),
    };
  }

  function calcX(col: number) {
    return DEFAULT_PADDING + col * (cellWidth + DEFAULT_PADDING);
  }

  function calcY(row: number) {
    return DEFAULT_PADDING * 2 + row * (cellHeight + ROW_SPACING);
  }

  const compositeImages: sharp.OverlayOptions[] = [];
  let imageIndex = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = calcX(col);
      const y = calcY(row);
      const isSponsorPosition = row === sponsorRow && col === sponsorCol;

      if (isSponsorPosition && sponsorKey && sponsorFile) {
        const sponsorImage = await processImage(sponsorFile, "inside");
        compositeImages.push({
          input: sponsorImage,
          ...getImagePosition(x, y),
        });
      } else if (imageIndex < imageFiles.length) {
        const file = imageFiles.find((f) => f.orderIndex === imageIndex);
        if (!file)
          throw new Error(`Image not found when processing, ${imageIndex}`);
        const processedImage = await processImage(file.buffer, "inside");
        compositeImages.push({
          input: processedImage,
          ...getImagePosition(x, y),
        });

        const label = getImageLabel(file, topics);
        const textBuffer = createTextLabel(label);
        compositeImages.push({
          input: textBuffer,
          top: y + availableImageHeight,
          left: x,
        });

        imageIndex++;
      }
    }
  }

  if (participantRef) {
    const seqFontSize = Math.max(
      SEQUENCE_FONT_SIZE_MIN,
      Math.floor(CANVAS_HEIGHT * SEQUENCE_FONT_SIZE_RATIO),
    );
    const seqWidth = Math.floor(CANVAS_WIDTH * SEQUENCE_WIDTH_RATIO);
    const seqHeight = Math.floor(CANVAS_HEIGHT);

    const seqSvg = `
      <svg width="${seqWidth}" height="${seqHeight}" viewBox="0 0 ${seqWidth} ${seqHeight}">
        <text x="${seqWidth / 2}" y="${seqHeight - SEQUENCE_BOTTOM_MARGIN}" 
              font-family="Arial, sans-serif" 
              font-size="${seqFontSize}" 
              font-weight="bold"
              fill="black" 
              text-anchor="middle">${escapeXml(participantRef)}</text>
      </svg>
    `;

    const seqBuffer = Buffer.from(seqSvg);
    compositeImages.push({
      input: seqBuffer,
      top: CANVAS_HEIGHT - seqHeight,
      left: CANVAS_WIDTH - seqWidth,
    });
  }

  const finalSheet = await canvas.composite(compositeImages).jpeg().toBuffer();

  const finalKey = await uploadFinalSheet({
    file: finalSheet,
    participantRef,
    domain,
    currentKey: currentContactSheetKey,
  });

  return finalKey;
}
