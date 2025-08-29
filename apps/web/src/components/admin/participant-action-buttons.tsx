import { useDomain } from "@/contexts/domain-context"
import { runSheetGenerationQueue } from "@/actions/run-sheet-generation-queue"
import { useTRPC } from "@/trpc/client"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAction } from "next-safe-action/hooks"
import { Button } from "@vimmer/ui/components/button"
import {
  Download,
  MoreHorizontal,
  RefreshCcw,
  ScrollIcon,
  Trash,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@vimmer/ui/components/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@vimmer/ui/components/dropdown-menu"
import {
  Participant,
  CompetitionClass,
  DeviceGroup,
  Submission,
  ZippedSubmission,
} from "@vimmer/api/db/types"

interface ParticipantActionButtonsProps {
  participant: Participant & {
    competitionClass: CompetitionClass | null
    deviceGroup: DeviceGroup | null
    submissions?: Submission[]
    zippedSubmissions?: ZippedSubmission[]
  }
  exportStatus: string
  getPresignedExportUrl: (params: { zipKey: string }) => void
}

export function ParticipantActionButtons({
  participant,
  exportStatus,
  getPresignedExportUrl,
}: ParticipantActionButtonsProps) {
  const { domain } = useDomain()
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { execute: createContactSheet, isExecuting: isGeneratingContactSheet } =
    useAction(runSheetGenerationQueue, {
      onSuccess: async () => {
        toast.success("Contact sheet is being generated")
        await queryClient.invalidateQueries({
          queryKey: trpc.participants.pathKey(),
        })
      },
    })

  const { mutate: runValidations, isPending: isRunningValidations } =
    useMutation(
      trpc.validations.runValidations.mutationOptions({
        onSuccess: () => {
          toast.success("Validations run successfully")
        },
        onError: (error) => {
          console.error(error)
          toast.error("Failed to run validations")
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: trpc.validations.pathKey(),
          })
          queryClient.invalidateQueries({
            queryKey: trpc.participants.pathKey(),
          })
        },
      })
    )

  const { mutate: deleteParticipant, isPending: isDeletingParticipant } =
    useMutation(
      trpc.participants.delete.mutationOptions({
        onSettled: () => {
          toast.success("Participant deleted")
          queryClient.invalidateQueries({
            queryKey: trpc.participants.pathKey(),
          })
          queryClient.invalidateQueries({
            queryKey: trpc.validations.pathKey(),
          })
          queryClient.invalidateQueries({
            queryKey: trpc.submissions.pathKey(),
          })
        },
        onError: (error) => {
          console.error(error)
          toast.error("Failed to delete participant")
        },
      })
    )

  return (
    <div className="flex flex-wrap gap-2">
      {participant.zippedSubmissions?.at(-1)?.zipKey && (
        <Button
          size="sm"
          variant="default"
          disabled={exportStatus === "executing"}
          onClick={() => {
            if (!participant.zippedSubmissions?.at(-1)?.zipKey) {
              toast.error("No zip file available")
              return
            }
            getPresignedExportUrl({
              zipKey: participant.zippedSubmissions?.at(-1)?.zipKey ?? "",
            })
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          {exportStatus === "executing" ? "Exporting..." : "Export"}
        </Button>
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    runValidations({ participantId: participant.id })
                  }
                  disabled={isRunningValidations}
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  <span>
                    {isRunningValidations ? "Running..." : "Run Validations"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    createContactSheet({
                      domain,
                      participantRef: participant.reference,
                    })
                  }
                  disabled={isGeneratingContactSheet}
                >
                  <ScrollIcon className="h-4 w-4 mr-2" />
                  <span>
                    {isRunningValidations
                      ? "Generating......"
                      : "Generate Contact Sheet"}
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    deleteParticipant({
                      id: participant.id,
                    })
                  }
                >
                  <Trash className="h-4 w-4 mr-2 text-destructive" />
                  <span className="text-destructive">
                    {isDeletingParticipant
                      ? "Deleting..."
                      : "Delete Participant"}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent>
            <p>More actions</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
