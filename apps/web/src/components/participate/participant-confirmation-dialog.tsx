"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@vimmer/ui/components/dialog"
import { Button } from "@vimmer/ui/components/button"
import { Input } from "@vimmer/ui/components/input"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { cn } from "@vimmer/ui/lib/utils"
import { geistMono } from "@/lib/fonts"
import { AlertTriangle } from "lucide-react"

interface ParticipantConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  expectedParticipantRef: string
}

export function ParticipantConfirmationDialog({
  open,
  onClose,
  onConfirm,
  expectedParticipantRef,
}: ParticipantConfirmationDialogProps) {
  const [enteredRef, setEnteredRef] = useState("")
  const [showError, setShowError] = useState(false)

  useEffect(() => {
    if (open) {
      setEnteredRef("")
      setShowError(false)
    }
  }, [open])

  const handleSubmit = () => {
    if (enteredRef.trim() === expectedParticipantRef) {
      setShowError(false)
      onConfirm()
    } else {
      setShowError(true)
    }
  }

  const handleCancel = () => {
    setEnteredRef("")
    setShowError(false)
    onClose()
  }

  const handleInputChange = (value: string) => {
    setEnteredRef(value)
    if (showError) {
      setShowError(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        className="bg-transparent border-none shadow-none top-[40%]"
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-lg font-medium">
            Confirm Participant Number
          </DialogTitle>
        </DialogHeader>

        <form className="flex flex-col gap-4 py-4">
          <Input
            autoFocus
            type="text"
            inputMode="numeric"
            value={enteredRef}
            onChange={(e) => handleInputChange(e.target.value)}
            className={cn(
              "text-center text-4xl h-16 font-bold font-mono tracking-widest",
              geistMono.className,
              showError && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder={expectedParticipantRef}
            enterKeyHint="done"
          />

          {showError && (
            <div className="flex items-center justify-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Participant number doesn&apos;t match</span>
            </div>
          )}

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
              disabled={!enteredRef.trim()}
              onClick={(e) => {
                e.preventDefault()
                handleSubmit()
              }}
              className="flex-1 h-12 text-base font-medium rounded-full"
            >
              Confirm & Upload
            </PrimaryButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
