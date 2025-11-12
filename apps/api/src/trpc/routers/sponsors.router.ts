import { createTRPCRouter, publicProcedure } from ".."
import {
  createSponsorSchema,
  updateSponsorSchema,
  deleteSponsorSchema,
  getSponsorsByMarathonSchema,
  getSponsorsByTypeSchema,
  generateSponsorUploadUrlSchema,
} from "../../schemas/sponsors.schemas"
import {
  createSponsorMutation,
  updateSponsorMutation,
  deleteSponsorMutation,
  getSponsorsByMarathonIdQuery,
  getSponsorsByTypeQuery,
} from "../../db/queries/sponsors.queries"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { Resource } from "sst"

export const sponsorsRouter = createTRPCRouter({
  create: publicProcedure.input(createSponsorSchema).mutation(async ({ ctx, input }) => {
    return await createSponsorMutation(ctx.db, { data: input })
  }),

  update: publicProcedure.input(updateSponsorSchema).mutation(async ({ ctx, input }) => {
    const { id, ...updateData } = input
    return await updateSponsorMutation(ctx.db, { id, data: updateData })
  }),

  delete: publicProcedure.input(deleteSponsorSchema).mutation(async ({ ctx, input }) => {
    await deleteSponsorMutation(ctx.db, { id: input.id })
    return { success: true }
  }),

  getByMarathon: publicProcedure
    .input(getSponsorsByMarathonSchema)
    .query(async ({ ctx, input }) => {
      return await getSponsorsByMarathonIdQuery(ctx.db, {
        marathonId: input.marathonId,
      })
    }),

  getByType: publicProcedure.input(getSponsorsByTypeSchema).query(async ({ ctx, input }) => {
    return await getSponsorsByTypeQuery(ctx.db, {
      marathonId: input.marathonId,
      type: input.type,
    })
  }),

  generateUploadUrl: publicProcedure
    .input(generateSponsorUploadUrlSchema)
    .mutation(async ({ input }) => {
      const s3 = new S3Client({ region: "eu-north-1" })
      const fileId = crypto.randomUUID()
      const key = `${input.domain}/sponsors/${fileId}.jpg`

      const command = new PutObjectCommand({
        Bucket: Resource.MarathonSettingsBucket.name,
        Key: key,
        ContentType: "image/jpeg",
      })

      const url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 })

      return { url, key }
    }),
})
