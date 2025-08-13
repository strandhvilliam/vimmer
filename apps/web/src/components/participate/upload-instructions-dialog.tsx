"use client"

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog"
import { useI18n } from "@/locales/client"
import { CheckCircle, Wifi, RefreshCw, AlertTriangle } from "lucide-react"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"

interface UploadInstructionsDialogProps {
  open: boolean
  onClose: () => void
}

export function UploadInstructionsDialog({
  open,
  onClose,
}: UploadInstructionsDialogProps) {
  const t = useI18n()

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl rounded-2xl lg:p-8"
      >
        <DialogHeader>
          <DialogTitle className="font-rocgrotesk text-lg sm:text-xl lg:text-2xl">
            {t("uploadInstructions.title")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 lg:space-y-6">
          <div className="flex items-start gap-3 lg:gap-4">
            <AlertTriangle className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-amber-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm lg:text-lg">
                {t("uploadInstructions.localPhotosTitle")}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                {t("uploadInstructions.localPhotosDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 lg:gap-4">
            <Wifi className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm lg:text-lg">
                {t("uploadInstructions.connectionTitle")}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                {t("uploadInstructions.connectionDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 lg:gap-4">
            <CheckCircle className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-green-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm lg:text-lg">
                {t("uploadInstructions.doubleCheckTitle")}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                {t("uploadInstructions.doubleCheckDescription")}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 lg:gap-4">
            <RefreshCw className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-purple-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-xs sm:text-sm lg:text-lg">
                {t("uploadInstructions.patienceTitle")}
              </p>
              <p className="text-xs sm:text-sm lg:text-base text-muted-foreground">
                {t("uploadInstructions.patienceDescription")}
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <PrimaryButton
            onClick={onClose}
            className="w-full lg:h-12 lg:text-lg"
          >
            {t("uploadInstructions.gotIt")}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
