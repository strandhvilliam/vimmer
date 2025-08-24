import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import {
  AWS_REGION,
  BOTTOM_ROW_LARGE,
  BOTTOM_ROW_SMALL,
  CENTER_COL_LARGE,
  CENTER_ROW_LARGE,
  LABEL_INDEX_OFFSET,
  LEFT_COL,
  MIDDLE_COL,
  MIDDLE_ROW,
  RIGHT_COL_LARGE,
  RIGHT_COL_SMALL,
  TOP_ROW,
} from "./constants"
import type { ImageFile, SponsorPosition, TopicWithIndex } from "./types"
import { Resource } from "sst"

export function getSponsorPosition(
  position: SponsorPosition,
  isSmallGrid: boolean
): { row: number; col: number } {
  const positions = {
    "bottom-left": {
      row: isSmallGrid ? BOTTOM_ROW_SMALL : BOTTOM_ROW_LARGE,
      col: LEFT_COL,
    },
    "top-right": {
      row: TOP_ROW,
      col: isSmallGrid ? RIGHT_COL_SMALL : RIGHT_COL_LARGE,
    },
    "top-left": {
      row: TOP_ROW,
      col: LEFT_COL,
    },
    center: {
      row: isSmallGrid ? MIDDLE_ROW : CENTER_ROW_LARGE,
      col: isSmallGrid ? MIDDLE_COL : CENTER_COL_LARGE,
    },
    "bottom-right": {
      row: isSmallGrid ? BOTTOM_ROW_SMALL : BOTTOM_ROW_LARGE,
      col: isSmallGrid ? RIGHT_COL_SMALL : RIGHT_COL_LARGE,
    },
  }

  return positions[position]
}

export async function getSponsorFile(
  key: string | undefined
): Promise<Buffer | undefined> {
  if (!key) {
    return undefined
  }
  try {
    const s3Client = new S3Client({ region: AWS_REGION })
    const file = await s3Client.send(
      new GetObjectCommand({
        Bucket: "vimmer-production-marathonsettingsbucketbucket-orneboew",
        Key: key,
      })
    )
    const buffer = await file.Body?.transformToByteArray()
    if (!buffer) {
      throw new Error(`Failed to fetch sponsor image from S3: ${key}`)
    }
    return Buffer.from(buffer)
  } catch (error) {
    console.error(error)
    throw new Error(`Error fetching sponsor image from S3`)
  }
}

export function getIndexFromKey(key: string): number {
  const n = key.split("/")[2]
  if (!n) throw new Error("Invalid key format")
  const orderIndex = parseInt(n, 10)
  if (isNaN(orderIndex)) throw new Error("Invalid key format")
  return orderIndex - 1
}

export async function getImageFiles(keys: string[]): Promise<ImageFile[]> {
  try {
    const s3Client = new S3Client({ region: AWS_REGION })
    const imagePromises = keys.map(async (key) => {
      const file = await s3Client.send(
        new GetObjectCommand({
          Bucket: "vimmer-production-submissionbucketbucket-rrnomubf",
          Key: key,
        })
      )
      const buffer = await file.Body?.transformToByteArray()
      if (!buffer) {
        throw new Error(`Failed to fetch image from S3: ${key}`)
      }
      return {
        key,
        buffer: Buffer.from(buffer),
        orderIndex: getIndexFromKey(key),
      }
    })

    return await Promise.all(imagePromises)
  } catch (error) {
    console.error(error)
    throw new Error(`Error fetching image from S3`)
  }
}

export function parseVersionFromKey(key: string | null | undefined): number {
  if (!key) return 1

  const match = key.match(/_v(\d+)\.jpg$/)
  if (!match || !match[1]) return 1

  return parseInt(match[1], 10)
}
export function generateKey(domain: string, participantRef: string): string {
  return `${domain}/${participantRef}_${new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5)}.jpg`
}

export async function uploadFinalSheet({
  file,
  participantRef,
  domain,
  currentKey,
}: {
  file: Buffer
  participantRef: string
  domain: string
  currentKey?: string | null | undefined
}) {
  const s3Client = new S3Client({ region: AWS_REGION })
  const currentVersion = parseVersionFromKey(currentKey)
  const newVersion = currentVersion + 1
  const key = generateKey(domain, participantRef)

  await s3Client.send(
    new PutObjectCommand({
      Bucket: "vimmer-production-contactsheetsbucketbucket-sswnzfxo",
      Key: key,
      Body: file,
      ContentType: "image/jpg",
    })
  )
  return key
}

export function getImageLabel(
  file: ImageFile,
  topics: TopicWithIndex[]
): string {
  const topic = topics.find((t) => t.orderIndex === file.orderIndex)
  if (!topic) throw new Error("Topic not found")
  return `${topic.orderIndex + LABEL_INDEX_OFFSET} - ${topic.name}`
}
