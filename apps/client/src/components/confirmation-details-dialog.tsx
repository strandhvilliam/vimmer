import { ConfirmationData } from "@/lib/types";
import { parseDateFromExif } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@vimmer/ui/components/dialog";
import { Loader2, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";

export function ConfirmationDetailsDialog({
  image,
  open,
  onOpenChange,
}: {
  image: ConfirmationData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
  }, [image?.id]);

  const capturedDate = parseDateFromExif(image?.exif);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            #{(image?.orderIndex ?? 0) + 1} {image?.name}
          </DialogTitle>
          <DialogDescription>Photo details</DialogDescription>
        </DialogHeader>

        <div className="relative mt-2">
          <div className="rounded-md overflow-hidden bg-black/5 aspect-square sm:aspect-auto min-h-[200px] flex items-center justify-center">
            {isLoading && image && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/5">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {image && (
              <img
                src={image.previewUrl || image.thumbnailUrl}
                alt={image.name}
                className={`w-full h-auto max-h-[60vh] object-contain transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
                onLoad={() => setIsLoading(false)}
              />
            )}
          </div>
        </div>

        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 opacity-70" />
            <div className="text-sm text-muted-foreground">
              {capturedDate ?? "Unknown"}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <div className="text-sm text-muted-foreground">
              Uploaded {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
