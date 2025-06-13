"use client";

import { Avatar, AvatarFallback } from "@vimmer/ui/components/avatar";
import { Button } from "@vimmer/ui/components/button";
import { Mail, Trash2, User2Icon, RefreshCw } from "lucide-react";
import { Badge } from "@vimmer/ui/components/badge";
import { User, UserMarathonRelation } from "@vimmer/supabase/types";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { removeStaffMemberAction } from "../_actions/remove-staff-member";
import { refreshStaffData } from "../_actions/refresh-staff-data";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@vimmer/ui/components/alert-dialog";

interface StaffHeaderProps {
  staff: UserMarathonRelation & { user: User };
  staffId: string;
  domain: string;
}

export function StaffHeader({ staff, staffId, domain }: StaffHeaderProps) {
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const router = useRouter();

  const { execute: executeRefresh, isExecuting: isRefreshing } = useAction(
    refreshStaffData,
    {
      onSuccess: () => {
        toast.success("Data refreshed successfully");
      },
      onError: (error) => {
        toast.error("Failed to refresh data");
        console.error("Refresh error:", error);
      },
    }
  );

  const { execute: executeRemove, isExecuting: isRemoving } = useAction(
    removeStaffMemberAction,
    {
      onSuccess: () => {
        toast.success("Staff member removed successfully");
        router.push(`/${domain}/staff`);
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Failed to remove staff member");
      },
    }
  );

  const handleRefresh = () => {
    executeRefresh({ staffId });
  };

  const handleRemove = () => {
    executeRemove({ staffId });
  };

  return (
    <>
      <div className="p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback>
                <User2Icon className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold font-rocgrotesk">
                  {staff.user.name}
                </h2>
                <Badge
                  variant={staff.role === "admin" ? "default" : "secondary"}
                >
                  {staff.role.charAt(0).toUpperCase() + staff.role.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center text-muted-foreground">
                <Mail className="mr-2 h-4 w-4" />
                {staff.user.email}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsRemoveDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-rocgrotesk">
              Remove Staff Member
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {staff.user.name} from the staff?
              This action cannot be undone and they will lose access to this
              marathon.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={isRemoving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isRemoving ? "Removing..." : "Remove Staff Member"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
