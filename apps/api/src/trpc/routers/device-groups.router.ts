import { createTRPCRouter, publicProcedure } from "../init";
import {
  createDeviceGroupSchema,
  deleteDeviceGroupSchema,
  getDeviceGroupByIdSchema,
  getDeviceGroupsByDomainSchema,
  updateDeviceGroupSchema,
} from "@/schemas/device-groups.schemas";
import {
  createDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroupByIdQuery,
  getDeviceGroupsByDomainQuery,
  updateDeviceGroup,
} from "@/db/queries/device-groups.queries";

export const deviceGroupsRouter = createTRPCRouter({
  getDeviceGroupById: publicProcedure
    .input(getDeviceGroupByIdSchema)
    .query(async ({ ctx, input }) => {
      return getDeviceGroupByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getDeviceGroupsByDomain: publicProcedure
    .input(getDeviceGroupsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getDeviceGroupsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  createDeviceGroup: publicProcedure
    .input(createDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return createDeviceGroup(ctx.db, {
        data: input.data,
      });
    }),
  updateDeviceGroup: publicProcedure
    .input(updateDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return updateDeviceGroup(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  deleteDeviceGroup: publicProcedure
    .input(deleteDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteDeviceGroup(ctx.db, {
        id: input.id,
      });
    }),
});
