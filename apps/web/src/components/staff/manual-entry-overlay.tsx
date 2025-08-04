import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { useDomain } from "@/contexts/domain-context";
import { useState, useEffect } from "react";
import { cn } from "@vimmer/ui/lib/utils";
import { geistMono } from "@/lib/fonts";

interface ManualEntryOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnterAction(args: QrDataArgs): void;
}

export function ManualEntryOverlay({
  open,
  onOpenChange,
  onEnterAction,
}: ManualEntryOverlayProps) {
  const { domain } = useDomain();
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (open) {
      setReference("");
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (reference.trim()) {
      const formattedValue = reference.trim().padStart(4, "0");
      onEnterAction({ reference: formattedValue, domain });
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setReference("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideCloseButton
        className="bg-transparent border-none shadow-none top-[40%]"
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-medium">
            Enter Participant Number
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
          <Input
            autoFocus
            type="number"
            inputMode="numeric"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            className={cn(
              "text-center text-4xl h-16 font-bold font-mono tracking-widest",
              geistMono.className,
            )}
            placeholder="0000"
            enterKeyHint="done"
          />

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleCancel}
              variant="outline"
              className="flex-1 h-12 rounded-full"
            >
              Cancel
            </Button>
            <PrimaryButton
              type="submit"
              disabled={!reference.trim()}
              className="flex-1 h-12 text-base font-medium rounded-full"
            >
              Submit
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
