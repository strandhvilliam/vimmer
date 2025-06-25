import { User2Icon } from "lucide-react";
import React from "react";
import { connection } from "next/server";

export default async function StaffDefaultPage() {
  await connection();
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <User2Icon className="h-12 w-12 mb-4" />
      <h2 className="text-lg font-medium mb-2">No Staff Selected</h2>
      <p>Select a staff member from the list to view their details</p>
    </div>
  );
}
