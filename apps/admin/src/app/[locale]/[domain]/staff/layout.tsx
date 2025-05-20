import React, { Suspense } from "react";
import { AddStaffDialog } from "./_components/add-staff-dialog";
import { StaffListMenu } from "./_components/staff-list-menu";
import { StaffListSkeleton } from "./_components/staff-list-skeleton";

const staffMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    lastLogin: "2024-03-17",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    lastLogin: "2024-03-15",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    lastLogin: "2024-03-14",
  },
];

async function demoGetStaffMembers(domain: string) {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return staffMembers;
}

export default async function StaffLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
    staffId: number;
  }>;
}) {
  const { domain } = await params;
  const staffMembersPromise = demoGetStaffMembers(domain);

  return (
    <div className="flex overflow-hidden h-full  mx-auto">
      <div className="w-80 border-r flex flex-col ">
        <div className="pt-4 space-y-4  bg-background">
          <div className="flex items-center justify-between px-4">
            <h2 className="text-lg font-semibold font-rocgrotesk">Staff</h2>
            <AddStaffDialog />
          </div>
          <Suspense fallback={<StaffListSkeleton />}>
            <StaffListMenu
              domain={domain}
              staffMembersPromise={staffMembersPromise}
            />
          </Suspense>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full">{children}</div>
    </div>
  );
}
