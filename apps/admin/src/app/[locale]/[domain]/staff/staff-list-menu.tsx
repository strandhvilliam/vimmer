"use client";
import { Search, User2Icon } from "lucide-react";
import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { ScrollArea } from "@vimmer/ui/components/scroll-area";
import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Input } from "@vimmer/ui/components/input";
export function StaffListMenu({
  domain,
  staffMembersPromise,
}: {
  domain: string;
  staffMembersPromise: Promise<
    {
      id: number;
      name: string;
      email: string;
      lastLogin: string;
    }[]
  >;
}) {
  const { staffId } = useParams();
  const staffMembers = use(staffMembersPromise);

  const [search, setSearch] = useState("");
  const [filteredStaff, setFilteredStaff] = useState(staffMembers);

  useEffect(() => {
    const filteredStaff = staffMembers.filter((staff) =>
      staff.name.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStaff(filteredStaff);
  }, [search]);

  return (
    <>
      <div className="relative mx-2">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search staff..."
          className="pl-10 rounded-full focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </div>
      <ScrollArea className="flex-1 bg-background">
        <div className="space-y-2 p-2">
          {staffMembers.map((staff) => (
            <Link
              key={staff.id}
              href={`/${domain}/staff/${staff.id}`}
              className={`block w-full p-2 text-left  transition-colors rounded-md ${
                Number(staffId) === staff.id ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    <User2Icon className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-0.5">
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {staff.email}
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
