import { Button } from "@vimmer/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { useState } from "react";

interface PreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
}

export function PreviewDialog({
  open,
  onOpenChange,
  imageUrl,
}: PreviewDialogProps) {
  const [isBroken, setIsBroken] = useState(false);

  if (!imageUrl) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl min-h-[40vh] max-h-[90vh] p-0">
        <DialogTitle className="sr-only">Image Preview</DialogTitle>
        <div className="relative">
          {!isBroken ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              onError={() => {
                setIsBroken(true);
              }}
              alt="Image Preview"
              className="w-full h-autoobject-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/60 to-muted/80">
              <span className="text-xs text-muted-foreground font-medium">
                Image not found
              </span>
            </div>
          )}
          <Button
            className="absolute bottom-4 right-4"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
