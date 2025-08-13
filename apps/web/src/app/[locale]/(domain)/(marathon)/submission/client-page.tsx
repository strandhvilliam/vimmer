"use client"

import { AnimatedStepWrapper } from "@/components/participate/animated-step-wrapper"
import { ClassSelectionStep } from "@/components/participate/class-selection-step"
import { DeviceSelectionStep } from "@/components/participate/device-selection-step"
import { ParticipantNumberStep } from "@/components/participate/participant-number-step"
import { ParticipantDetailsStep } from "@/components/participate/participant-details-step"
import { StepNavigator } from "@/components/participate/step-navigator"
import { UploadSubmissionsStep } from "@/components/participate/upload-submissions-step"
import { PARTICIPANT_SUBMISSION_STEPS } from "@/lib/constants"
import { AnimatePresence } from "motion/react"
import { notFound, useRouter } from "next/navigation"
import { useCallback, useEffect } from "react"
import { submissionQueryClientParamSerializer } from "@/lib/schemas/submission-query-client-schema"
import { useSubmissionQueryState } from "@/hooks/use-submission-query-state"
import { useSuspenseQueries } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"
import { useDomain } from "@/contexts/domain-context"
import { mapDbRuleConfigsToValidationConfigs } from "@/lib/utils"
import { useParticipantSubmissionStep } from "@/hooks/use-participant-submission-step"
import dynamic from "next/dynamic"

const NetworkStatusBanner = dynamic(
  () =>
    import("@/components/network-status-banner").then((mod) => ({
      default: mod.NetworkStatusBanner,
    })),
  { ssr: false }
)

export function SubmissionClientPage() {
  const trpc = useTRPC()
  const router = useRouter()
  const { handleNextStep, handlePrevStep, handleSetStep, step, direction } =
    useParticipantSubmissionStep()
  const { submissionState } = useSubmissionQueryState()
  const { domain } = useDomain()

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      return "Are you sure you want to leave? All progress will be lost."
    }

    const isOnIOS =
      navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPhone/i)

    if (isOnIOS) {
      window.addEventListener("pagehide", handleBeforeUnload)
    } else {
      window.addEventListener("beforeunload", handleBeforeUnload)
    }

    return () => {
      if (isOnIOS) {
        window.removeEventListener("pagehide", handleBeforeUnload)
      } else {
        window.removeEventListener("beforeunload", handleBeforeUnload)
      }
    }
  }, [])

  const [
    { data: marathon },
    { data: competitionClasses },
    { data: deviceGroups },
    { data: ruleConfigs },
    { data: topics },
  ] = useSuspenseQueries({
    queries: [
      trpc.marathons.getByDomain.queryOptions({ domain }),
      trpc.competitionClasses.getByDomain.queryOptions({
        domain,
      }),
      trpc.deviceGroups.getByDomain.queryOptions({
        domain,
      }),
      trpc.rules.getByDomain.queryOptions({
        domain,
      }),
      trpc.topics.getPublicByDomain.queryOptions({
        domain,
      }),
    ],
  })

  const handleNavigateToVerification = useCallback(() => {
    const params = submissionQueryClientParamSerializer(submissionState)
    router.push(`/verification${params}`)
  }, [router, submissionState])

  if (!marathon) {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-4">
      <NetworkStatusBanner />
      <div className="mb-12 px-4 sm:px-0">
        <StepNavigator currentStep={step} handleSetStep={handleSetStep} />
      </div>
      <AnimatePresence initial={false} custom={direction} mode="wait">
        {step === PARTICIPANT_SUBMISSION_STEPS.ParticipantNumberStep && (
          <AnimatedStepWrapper
            key={PARTICIPANT_SUBMISSION_STEPS.ParticipantNumberStep}
            direction={direction}
          >
            <ParticipantNumberStep
              onNextStep={handleNextStep}
              marathon={marathon}
            />
          </AnimatedStepWrapper>
        )}
        {step === PARTICIPANT_SUBMISSION_STEPS.ParticipantDetailsStep && (
          <AnimatedStepWrapper
            key={PARTICIPANT_SUBMISSION_STEPS.ParticipantDetailsStep}
            direction={direction}
          >
            <ParticipantDetailsStep
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === PARTICIPANT_SUBMISSION_STEPS.ClassSelectionStep && (
          <AnimatedStepWrapper
            key={PARTICIPANT_SUBMISSION_STEPS.ClassSelectionStep}
            direction={direction}
          >
            <ClassSelectionStep
              competitionClasses={competitionClasses}
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
            />
          </AnimatedStepWrapper>
        )}
        {step === PARTICIPANT_SUBMISSION_STEPS.DeviceSelectionStep && (
          <AnimatedStepWrapper
            key={PARTICIPANT_SUBMISSION_STEPS.DeviceSelectionStep}
            direction={direction}
          >
            <DeviceSelectionStep
              onNextStep={handleNextStep}
              onPrevStep={handlePrevStep}
              deviceGroups={deviceGroups}
            />
          </AnimatedStepWrapper>
        )}
        {step === PARTICIPANT_SUBMISSION_STEPS.UploadSubmissionStep && (
          <AnimatedStepWrapper
            key={PARTICIPANT_SUBMISSION_STEPS.UploadSubmissionStep}
            direction={direction}
          >
            <UploadSubmissionsStep
              marathon={marathon}
              competitionClasses={competitionClasses}
              topics={topics}
              ruleConfigs={mapDbRuleConfigsToValidationConfigs(ruleConfigs)}
              onPrevStep={handlePrevStep}
              onNextStep={handleNavigateToVerification}
            />
          </AnimatedStepWrapper>
        )}
      </AnimatePresence>
    </div>
  )
}
