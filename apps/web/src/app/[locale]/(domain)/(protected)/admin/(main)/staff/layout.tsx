import React, { Suspense } from "react";
import { AddStaffDialog } from "@/components/admin/add-staff-dialog";
import { StaffListMenu } from "@/components/admin/staff-list-menu";
import { StaffListSkeleton } from "@/components/admin/staff-list-skeleton";
import { StaffDetailsSkeleton } from "@/components/admin/staff-details-skeleton";
import { getDomain } from "@/lib/get-domain";
import { batchPrefetch, trpc } from "@/trpc/server";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = await getDomain();

  batchPrefetch([
    trpc.users.getStaffMembersByDomain.queryOptions({
      domain,
    }),
  ]);

  return (
    <div className="flex overflow-hidden h-full  mx-auto">
      <div className="w-80 border-r flex flex-col ">
        <div className="pt-4 space-y-4  bg-background h-full">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold font-rocgrotesk">Staff</h2>
            <AddStaffDialog />
          </div>
          <Suspense fallback={<StaffListSkeleton />}>
            <StaffListMenu />
          </Suspense>
        </div>
      </div>
      <div className="flex-1 flex flex-col h-full">
        <Suspense fallback={<StaffDetailsSkeleton />}>{children}</Suspense>
      </div>
    </div>
  );
}
