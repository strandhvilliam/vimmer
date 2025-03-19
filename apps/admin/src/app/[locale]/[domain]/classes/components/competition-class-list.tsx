"use client";

import { CompetitionClass } from "@vimmer/supabase/types";
import { Button } from "@vimmer/ui/components/button";
import { Card } from "@vimmer/ui/components/card";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@vimmer/ui/components/tooltip";
import { XIcon, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { CompetitionClassEditDialog } from "./competition-class-edit-dialog";
import { useAction } from "next-safe-action/hooks";
import { deleteCompetitionClassAction } from "../actions/competition-class-delete-action";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogDescription,
} from "@vimmer/ui/components/alert-dialog";

interface CompetitionClassListProps {
  classes: CompetitionClass[];
}

export default function CompetitionClassList({
  classes,
}: CompetitionClassListProps) {
  const { execute: deleteCompetitionClass, isExecuting: isDeletingClass } =
    useAction(deleteCompetitionClassAction, {
      onSuccess: () => {
        toast.success("Competition class deleted successfully");
      },
      onError: (error) => {
        toast.error(error.error.serverError || "Something went wrong");
      },
    });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {classes.map((classItem) => (
        <CompetitionClassCard
          key={classItem.id}
          classItem={classItem}
          onDelete={() => deleteCompetitionClass({ id: classItem.id })}
          isDeleting={isDeletingClass}
        />
      ))}
    </div>
  );
}

function CompetitionClassCard({
  classItem,
  onDelete,
  isDeleting,
}: {
  classItem: CompetitionClass;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Card key={classItem.id} className="relative">
      <div className="flex flex-col gap-2 p-4">
        <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
          <Button
            variant="ghost"
            className="absolute top-2 right-2 p-0 hover:bg-transparent"
            size="icon"
            disabled={isDeleting}
            onClick={() => setIsOpen(true)}
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XIcon className="w-4 h-4" />
            )}
          </Button>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => onDelete()}
                disabled={isDeleting}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="flex h-fit items-center w-fit justify-center bg-muted rounded-lg shadow-sm border p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-6 h-6 text-center text-lg font-medium font-mono">
                {classItem.numberOfPhotos}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              Number of photos: {classItem.numberOfPhotos}
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex flex-col tems-center justify-between">
          <h3 className="text-lg font-semibold">{classItem.name}</h3>
          <p className="text-sm text-muted-foreground">
            {classItem.description}
          </p>
        </div>
      </div>
      <div className="flex items-center px-4 pb-4 gap-2">
        <CompetitionClassEditDialog
          classItem={classItem}
          trigger={
            <Button size="sm" variant="outline" className="flex-1">
              Edit
            </Button>
          }
        />
        <Button size="sm" variant="outline" className="flex-1">
          View Submissions
        </Button>
      </div>
    </Card>
  );
}
