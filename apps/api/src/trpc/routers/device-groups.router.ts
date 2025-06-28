import { createTRPCRouter, publicProcedure } from "..";
import {
  createDeviceGroupSchema,
  deleteDeviceGroupSchema,
  getDeviceGroupByIdSchema,
  getDeviceGroupsByDomainSchema,
  updateDeviceGroupSchema,
} from "@vimmer/api/schemas/device-groups.schemas";
import {
  createDeviceGroup,
  deleteDeviceGroup,
  getDeviceGroupByIdQuery,
  getDeviceGroupsByDomainQuery,
  updateDeviceGroup,
} from "@vimmer/api/db/queries/device-groups.queries";

export const deviceGroupsRouter = createTRPCRouter({
  getById: publicProcedure
    .input(getDeviceGroupByIdSchema)
    .query(async ({ ctx, input }) => {
      return getDeviceGroupByIdQuery(ctx.db, {
        id: input.id,
      });
    }),
  getByDomain: publicProcedure
    .input(getDeviceGroupsByDomainSchema)
    .query(async ({ ctx, input }) => {
      return getDeviceGroupsByDomainQuery(ctx.db, {
        domain: input.domain,
      });
    }),
  create: publicProcedure
    .input(createDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return createDeviceGroup(ctx.db, {
        data: input.data,
      });
    }),
  update: publicProcedure
    .input(updateDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return updateDeviceGroup(ctx.db, {
        id: input.id,
        data: input.data,
      });
    }),
  delete: publicProcedure
    .input(deleteDeviceGroupSchema)
    .mutation(async ({ ctx, input }) => {
      return deleteDeviceGroup(ctx.db, {
        id: input.id,
      });
    }),
});
