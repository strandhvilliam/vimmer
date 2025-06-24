import React, { Suspense } from "react";
import { AddStaffDialog } from "./_components/add-staff-dialog";
import { StaffListMenu } from "./_components/staff-list-menu";
import { StaffListSkeleton } from "./_components/staff-list-skeleton";
import {
  getMarathonByDomain,
  getStaffMembersByDomain,
} from "@vimmer/supabase/cached-queries";
import { notFound } from "next/navigation";

const staffMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    lastLogin: "2024-03-17",
    role: "admin" as const,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    lastLogin: "2024-03-15",
    role: "user" as const,
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    lastLogin: "2024-03-14",
    role: "user" as const,
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
  const marathon = await getMarathonByDomain(domain);
  if (!marathon) {
    notFound();
  }
  const staffMembersPromise = getStaffMembersByDomain(domain);

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
      <div className="flex-1 flex flex-col h-full">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </div>
    </div>
  );
}
