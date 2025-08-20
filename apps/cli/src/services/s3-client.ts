import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3"

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
})

export async function downloadContactSheet(
  contactSheetKey: string
): Promise<Buffer | null> {
  try {
    console.log(`📥 Downloading contact sheet: ${contactSheetKey}`)

    const command = new GetObjectCommand({
      Bucket: "vimmer-production-contactsheetsbucketbucket-sswnzfxo",
      Key: contactSheetKey,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      console.log(`⚠️  No body found for contact sheet: ${contactSheetKey}`)
      return null
    }

    // const chunks: Uint8Array[] = []
    // const stream = response.Body as ReadableStream
    // const reader = stream.getReader()

    // try {
    //   while (true) {
    //     const { done, value } = await reader.read()
    //     if (done) break
    //     chunks.push(value)
    //   }
    // } finally {
    //   reader.releaseLock()
    // }

    const buffer = Buffer.from(await response.Body.transformToByteArray())
    console.log(
      `✅ Downloaded contact sheet: ${contactSheetKey} (${buffer.length} bytes)`
    )

    return buffer
  } catch (error) {
    console.error(
      `❌ Failed to download contact sheet ${contactSheetKey}:`,
      error
    )
    return null
  }
}

export function getContactSheetFilename(
  contactSheetKey: string,
  participantReference: string
): string {
  const extension = contactSheetKey.split(".").pop() || "jpg"
  return `${participantReference}_contact_sheet.${extension}`
}
