import { QrDataArgs } from "@/lib/schemas/verification-data-schema";
import { Button } from "@vimmer/ui/components/button";
import { Input } from "@vimmer/ui/components/input";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";
import { Sheet, SheetContent, SheetTitle } from "@vimmer/ui/components/sheet";
import { cn } from "@vimmer/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { useDomain } from "@/contexts/domain-context";

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
  const { domain } = useDomain();

  const form = useForm({
    defaultValues: {
      reference: "",
    },
    onSubmit: ({ value }) => {
      onOpenChange(false);

      const formattedValue = value.reference.trim().padStart(4, "0");

      onEnterAction({ reference: formattedValue, domain });
    },
  });

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Sheet modal={true} onOpenChange={onOpenChange} open={open}>
      <SheetContent hideClose side="top" className="w-full max-h-[95vh] p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="pb-4"
        >
          <div className="px-4 py-4 flex flex-row items-center justify-between">
            <Button
              onClick={handleCancel}
              type="button"
              variant="ghost"
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <SheetTitle className="text-base font-medium">
              Enter Participant Number
            </SheetTitle>
            <form.Field
              name="reference"
              children={(field) => (
                <PrimaryButton
                  type="submit"
                  className={cn(
                    "text-sm font-medium",
                    !field.state.value.trim() &&
                      "opacity-50 cursor-not-allowed",
                  )}
                  disabled={!field.state.value.trim()}
                >
                  Submit
                </PrimaryButton>
              )}
            />
          </div>

          <div className="px-4">
            <form.Field
              name="reference"
              children={(field) => (
                <Input
                  autoFocus
                  type="number"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full text-lg bg-secondary rounded-full"
                  placeholder="123"
                  enterKeyHint="done"
                />
              )}
            />
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
