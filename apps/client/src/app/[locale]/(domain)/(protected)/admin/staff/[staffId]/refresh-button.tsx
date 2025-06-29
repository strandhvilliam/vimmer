"use client";

import { Button } from "@vimmer/ui/components/button";
import { RefreshCw } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { refreshStaffData } from "../_actions/refresh-staff-data";
import { toast } from "sonner";

interface RefreshButtonProps {
  staffId: string;
  marathonId: number;
}

export function RefreshButton({ staffId, marathonId }: RefreshButtonProps) {
  const { execute, isExecuting } = useAction(refreshStaffData, {
    onSuccess: () => {
      toast.success("Data refreshed successfully");
    },
    onError: (error) => {
      toast.error("Failed to refresh data");
      console.error("Refresh error:", error);
    },
  });

  const handleRefresh = () => {
    execute({ staffId, marathonId });
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleRefresh}
      disabled={isExecuting}
    >
      <RefreshCw className={`h-4 w-4 ${isExecuting ? "animate-spin" : ""}`} />
      Refresh
    </Button>
  );
}
