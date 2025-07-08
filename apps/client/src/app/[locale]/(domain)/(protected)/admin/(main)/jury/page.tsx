import { Mail } from "lucide-react";
import React from "react";

export default async function JuryDefaultPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
      <Mail className="h-12 w-12 mb-4" />
      <h2 className="text-lg font-medium mb-2">No Invitation Selected</h2>
      <p>
        Select an invitation from the list to view details, or create a new one
      </p>
    </div>
  );
}
