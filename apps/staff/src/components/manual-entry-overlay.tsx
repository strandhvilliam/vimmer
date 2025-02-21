"use client";

import { useEffect, useRef } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@vimmer/ui/components/sheet";
import { Input } from "@vimmer/ui/components/input";
import { Button } from "@vimmer/ui/components/button";
import * as React from "react";
import { cn } from "@vimmer/ui/lib/utils";

interface ManualEntrySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function ManualEntrySheet({
  isOpen,
  onClose,
  onSubmit,
}: ManualEntrySheetProps) {
  const [inputValue, setInputValue] = React.useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputValue);
    setInputValue("");
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose} modal={true}>
      <SheetContent hideClose side="top" className="w-full max-h-[95vh] p-0">
        <form onSubmit={handleSubmit} className="pb-4">
          <div className="px-4 py-4 flex flex-row items-center justify-between">
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              className="text-gray-500 text-sm font-medium h-auto p-0"
            >
              Cancel
            </Button>
            <SheetTitle className="text-base font-medium">
              Enter Value
            </SheetTitle>
            <Button
              type="submit"
              variant="ghost"
              className={cn(
                "text-primary text-sm font-medium h-auto p-0",
                !inputValue.trim() && "opacity-50 cursor-not-allowed",
              )}
              disabled={!inputValue.trim()}
            >
              Submit
            </Button>
          </div>

          <div className="px-6">
            <Input
              autoFocus={isOpen}
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full text-lg bg-secondary"
              placeholder="Enter value..."
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
