"use client";

import { useState } from "react";
import { Button } from "@vimmer/ui/components/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Input } from "@vimmer/ui/components/input";
import { Label } from "@vimmer/ui/components/label";
import { Textarea } from "@vimmer/ui/components/textarea";
import { Checkbox } from "@vimmer/ui/components/checkbox";

interface AddTopicButtonProps {
  marathonId: number;
}

export function AddTopicButton({ marathonId }: AddTopicButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);
  const [isPublic, setIsPublic] = useState(false);
  const [scheduleStart, setScheduleStart] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name) return;

    setIsSubmitting(true);

    try {
      // In a real app, this would be a server action or API call
      console.log("Creating new topic", {
        name,
        description,
        orderIndex,
        isPublic,
        scheduleStart,
        marathonId,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Reset form and close modal
      setName("");
      setDescription("");
      setOrderIndex(0);
      setIsPublic(false);
      setScheduleStart("");
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to create topic", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus className="w-4 h-4 mr-2" />
        Add Topic
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Topic</DialogTitle>
            <DialogDescription>
              Create a new topic for your marathon. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Enter topic name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="order" className="text-right">
                Order
              </Label>
              <Input
                id="order"
                type="number"
                value={orderIndex + 1}
                onChange={(e) => setOrderIndex(parseInt(e.target.value) - 1)}
                className="col-span-3"
                min={1}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isPublic" className="text-right">
                Visibility
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Checkbox
                  id="isPublic"
                  checked={isPublic}
                  onCheckedChange={(checked) => setIsPublic(!!checked)}
                />
                <Label htmlFor="isPublic" className="text-sm font-normal">
                  Make topic visible to participants
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="scheduleStart" className="text-right">
                Schedule Start
              </Label>
              <div className="col-span-3">
                <Input
                  id="scheduleStart"
                  type="datetime-local"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  placeholder="Leave empty for immediate visibility"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If set, the topic will only be visible after this date and
                  time. Leave empty for immediate visibility.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3"
                rows={4}
                placeholder="Enter topic description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Topic"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
