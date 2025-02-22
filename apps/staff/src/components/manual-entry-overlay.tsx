import { useMarathonDomain } from "@/lib/hooks/use-marathon-domain";
import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@vimmer/ui/components/sheet";
import { cn } from "@vimmer/ui/lib/utils";
import * as React from "react";
import { useRef, useState } from "react";

interface ManualEntrySheetProps {
  onEnterAction(args: QrDataArgs): void;
}

export function ManualEntrySheet({ onEnterAction }: ManualEntrySheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const domain = useMarathonDomain();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    onEnterAction({ reference: inputValue, domain });
  };

  return (
    <Sheet modal={true} onOpenChange={setIsOpen} open={isOpen}>
      <SheetTrigger className="text-black underline">
        Enter Manually
      </SheetTrigger>
      <SheetContent hideClose side="top" className="w-full max-h-[95vh] p-0">
        <form onSubmit={handleSubmit} className="pb-4">
          <div className="px-4 py-4 flex flex-row items-center justify-between">
            <Button
              onClick={() => setIsOpen(false)}
              type="button"
              variant="ghost"
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <SheetTitle className="text-base font-medium">
              Enter Participant Number
            </SheetTitle>
            <Button
              onClick={handleSubmit}
              type="submit"
              variant="ghost"
              className={cn(
                "text-primary text-sm font-medium",
                !inputValue.trim() && "opacity-50 cursor-not-allowed",
              )}
              disabled={!inputValue.trim()}
            >
              Submit
            </Button>
          </div>

          <div className="px-4">
            <Input
              autoFocus
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-lg bg-secondary rounded-sm"
              placeholder="Enter value..."
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
