import { useDomain } from "@/hooks/use-domain";
import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@vimmer/ui/components/sheet";
import { cn } from "@vimmer/ui/lib/utils";
import * as React from "react";
import { toast } from "sonner";

interface ManualEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEnterAction(args: QrDataArgs): void;
}

export function ManualEntrySheet({
  open,
  onOpenChange,
  onEnterAction,
}: ManualEntrySheetProps) {
  const [inputValue, setInputValue] = React.useState("");
  const domain = useDomain();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    if (!domain) {
      toast.error("Unable to determine domain");
      return;
    }

    // Pad 3-digit numbers with leading zero
    const formattedValue =
      inputValue.trim().length === 3
        ? `0${inputValue.trim()}`
        : inputValue.trim();

    onEnterAction({ reference: formattedValue, domain });
  };

  return (
    <Sheet modal={true} onOpenChange={onOpenChange} open={open}>
      <SheetContent hideClose side="top" className="w-full max-h-[95vh] p-0">
        <form onSubmit={handleSubmit} className="pb-4">
          <div className="px-4 py-4 flex flex-row items-center justify-between">
            <Button
              onClick={() => onOpenChange(false)}
              type="button"
              variant="ghost"
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <SheetTitle className="text-base font-medium">
              Enter Participant Number
            </SheetTitle>
            <PrimaryButton
              type="submit"
              className={cn(
                "text-sm font-medium",
                !inputValue.trim() && "opacity-50 cursor-not-allowed"
              )}
              disabled={!inputValue.trim()}
            >
              Submit
            </PrimaryButton>
          </div>

          <div className="px-4">
            <Input
              autoFocus
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-lg bg-secondary rounded-full"
              placeholder="Enter value..."
              enterKeyHint="done"
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
