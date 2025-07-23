"use client";

import { Search, User2Icon } from "lucide-react";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "@vimmer/ui/components/input";
import { Badge } from "@vimmer/ui/components/badge";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { useDomain } from "@/contexts/domain-context";
import { User, UserMarathonRelation } from "@vimmer/api/db/types";

export function StaffListMenu() {
  const { staffId } = useParams<{ staffId: string }>();
  const trpc = useTRPC();
  const { domain } = useDomain();
  const { data: staffMembers } = useSuspenseQuery(
    trpc.users.getStaffMembersByDomain.queryOptions({
      domain,
    }),
  );

  const [search, setSearch] = useState("");
  const [filteredStaff, setFilteredStaff] =
    useState<(UserMarathonRelation & { user: User })[]>(staffMembers);

  useEffect(() => {
    const filteredStaff = staffMembers.filter((staff) =>
      staff.user.name.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredStaff(filteredStaff);
  }, [search, staffMembers]);

  return (
    <>
      <div className="relative mx-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ScrollArea className="flex-1 bg-background">
        <div className="space-y-2 p-2">
          {filteredStaff.map((staff) => (
            <Link
              key={staff.userId}
              href={`/admin/staff/${staff.userId}`}
              className={`block w-full p-2 text-left  transition-colors rounded-md ${
                staffId === staff.userId ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User2Icon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{staff.user.name}</p>
                    <Badge
                      variant={staff.role === "admin" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {staff.user.email}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </ScrollArea>
    </>
  );
}
