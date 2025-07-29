import sharp, { Sharp } from "sharp";
import { Submission } from "@vimmer/api/db/types";
import { AppRouter } from "@vimmer/api/trpc/routers/_app";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Resource } from "sst";
import { createTRPCProxyClient, httpBatchLink, loggerLink } from "@trpc/client";
import superjson from "superjson";

const WIDTH = 1024;
const HEIGHT = 768;
const PADDING = 50;

const GRID_COLS = 4;
const GRID_ROWS = 2;

interface CompositeOperation {
  input: Buffer;
  top: number;
  left: number;
}

const createApiClient = () =>
  createTRPCProxyClient<AppRouter>({
    links: [
      loggerLink({
        enabled: (op) =>
          process.env.NODE_ENV === "development" ||
          (op.direction === "down" && op.result instanceof Error),
      }),
      httpBatchLink({
        url: Resource.Api.url + "trpc",
        transformer: superjson,
      }),
    ],
  });

async function main() {
  const participantId = process.env.PARTICIPANT_ID;
  if (!participantId) throw new Error("No participant ID found");
  const s3Client = new S3Client({ region: "eu-north-1" });
  const apiClient = createApiClient();
  const participant = await apiClient.participants.getById.query({
    id: Number(participantId),
  });

  if (!participant) throw new Error("No participant found");

  generateContactSheet({
    s3Client,
    submissions: participant.submissions,
    onSuccess: async (buffer) => {
      await uploadContactSheet({
        s3Client,
        domain: participant.domain,
        participantRef: participant.reference,
        buffer,
      });
    },
    onError: () => {
      console.error("Error generating contact sheet");
    },
  });
}

async function generateContactSheet({
  s3Client,
  submissions,
  onSuccess,
  onError,
}: {
  s3Client: S3Client;
  submissions: Submission[];
  onSuccess?: (buffer: Buffer) => void;
  onError?: (error: Error) => void;
}) {
  const cellWidth: number = (WIDTH - PADDING * (GRID_COLS + 1)) / GRID_COLS;
  const cellHeight: number = (HEIGHT - PADDING * (GRID_ROWS + 1)) / GRID_ROWS;

  const canvas: Sharp = sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 3,
      background: { r: 255, g: 255, b: 255 },
    },
  });

  const compositeOperations: CompositeOperation[] = [];

  for (let i = 0; i < submissions.length; i++) {
    const col = i % GRID_COLS;
    const row = Math.floor(i / GRID_COLS);

    const left = PADDING + col * (cellWidth + PADDING);
    const top = PADDING + row * (cellHeight + PADDING);

    try {
      if (!submissions[i]?.key) {
        throw new Error(`Submission ${i} has no key`);
      }
      const buffer = await getImageFromS3(s3Client, submissions[i]!.key);
      const resizedBufferImage = await sharp(buffer)
        .resize(Math.round(cellWidth), Math.round(cellHeight), {
          fit: "inside",
          background: { r: 0, g: 0, b: 0 },
        })
        .toBuffer();

      compositeOperations.push({
        input: resizedBufferImage,
        top: Math.round(top),
        left: Math.round(left),
      });
      console.log(
        `Processed image ${i + 1}/${submissions.length}: ${submissions}`,
      );
    } catch (error) {
      console.error(error);
      throw new Error(`Error generating contact sheet for submission ${i}`);
    }
  }
  canvas.composite(compositeOperations);
  try {
    canvas.toBuffer((err, buffer) => {
      if (err) {
        onError?.(err);
      } else {
        onSuccess?.(buffer);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function getImageFromS3(s3Client: S3Client, key: string) {
  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: Resource.SubmissionBucket.name,
        Key: key,
      }),
    );
    return response.Body?.transformToByteArray();
  } catch (error) {
    console.error(error);
    throw new Error(`Error fetching image from S3: ${key}`);
  }
}

async function uploadContactSheet({
  s3Client,
  domain,
  participantRef,
  buffer,
}: {
  s3Client: S3Client;
  domain: string;
  participantRef: string;
  buffer: Buffer;
}) {
  try {
    await s3Client.send(
      new PutObjectCommand({
        Bucket: Resource.ContactSheetsBucket.name,
        Key: `${domain}/${participantRef}.jpg`,
        Body: buffer,
        ContentType: "image/jpg",
      }),
    );
  } catch (error) {
    console.error(error);
    throw new Error(`Error uploading contact sheet to S3: ${error}`);
  }
}

main();
