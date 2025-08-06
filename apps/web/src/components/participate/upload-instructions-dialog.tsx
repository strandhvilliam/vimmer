"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog";
import { Button } from "@vimmer/ui/components/button";
import { useI18n } from "@/locales/client";
import { CheckCircle, Wifi, RefreshCw, AlertTriangle } from "lucide-react";
import { PrimaryButton } from "@vimmer/ui/components/primary-button";

interface UploadInstructionsDialogProps {
  open: boolean;
  onClose: () => void;
}

export function UploadInstructionsDialog({
  open,
  onClose,
}: UploadInstructionsDialogProps) {
  const t = useI18n();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="max-w-xs sm:max-w-md rounded-2xl"
      >
        <DialogHeader>
          <DialogTitle className="font-rocgrotesk text-lg">
            {t("uploadInstructions.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">
                {t("uploadInstructions.localPhotosTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("uploadInstructions.localPhotosDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wifi className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">
                {t("uploadInstructions.connectionTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("uploadInstructions.connectionDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">
                {t("uploadInstructions.doubleCheckTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("uploadInstructions.doubleCheckDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <RefreshCw className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs">
                {t("uploadInstructions.patienceTitle")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("uploadInstructions.patienceDescription")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <PrimaryButton onClick={onClose} className="w-full">
            {t("uploadInstructions.gotIt")}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
