import { useEffect, useMemo, useRef, useState } from "react"
import { FlowStep, StepStatus } from "@/lib/types"

/**
 * Hook that ensures pending state is shown for at least 1 second before switching to completed
 * for all steps except the first one.
 */
export function useDelayedStepStatuses(steps: FlowStep[]): FlowStep[] {
  const [delayedStatuses, setDelayedStatuses] = useState<Map<string, StepStatus>>(new Map())
  const pendingStartTimes = useRef<Map<string, number>>(new Map())
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map())
  const previousStatuses = useRef<Map<string, StepStatus>>(new Map())

  useEffect(() => {
    // Cleanup function - capture the ref at effect setup time
    const timeoutMap = timeoutRefs.current
    return () => {
      timeoutMap.forEach((timeout) => clearTimeout(timeout))
    }
  }, [])

  useEffect(() => {
    steps.forEach((step, index) => {
      // Skip the first step (index 0)
      if (index === 0) {
        return
      }

      const stepId = step.id
      const currentStatus = step.status
      const previousStatus = previousStatuses.current.get(stepId)

      // Track previous status for next iteration
      previousStatuses.current.set(stepId, currentStatus)

      // Get current delayed status from state
      setDelayedStatuses((prev) => {
        const delayedStatus = prev.get(stepId) ?? currentStatus

        // If step transitions to pending, record the start time
        if (currentStatus === "pending" && previousStatus !== "pending") {
          pendingStartTimes.current.set(stepId, Date.now())
          // Clear any existing timeout
          const existingTimeout = timeoutRefs.current.get(stepId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
            timeoutRefs.current.delete(stepId)
          }
          const next = new Map(prev)
          next.set(stepId, "pending")
          return next
        }

        // If step transitions from pending to success, enforce minimum delay
        if (currentStatus === "success" && delayedStatus === "pending") {
          const pendingStartTime = pendingStartTimes.current.get(stepId) ?? Date.now()
          const elapsed = Date.now() - pendingStartTime
          const remainingDelay = Math.max(0, 1000 - elapsed)

          // Clear any existing timeout for this step
          const existingTimeout = timeoutRefs.current.get(stepId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }

          // Set timeout to transition to success after remaining delay
          const timeout = setTimeout(() => {
            setDelayedStatuses((prevDelayed) => {
              const next = new Map(prevDelayed)
              next.set(stepId, "success")
              return next
            })
            pendingStartTimes.current.delete(stepId)
            timeoutRefs.current.delete(stepId)
          }, remainingDelay)

          timeoutRefs.current.set(stepId, timeout)
          return prev // Keep pending status until timeout fires
        }

        // If step transitions to error or running, update immediately
        if (currentStatus === "error" || currentStatus === "running") {
          // Clear any pending timeout
          const existingTimeout = timeoutRefs.current.get(stepId)
          if (existingTimeout) {
            clearTimeout(existingTimeout)
          }
          timeoutRefs.current.delete(stepId)
          pendingStartTimes.current.delete(stepId)

          const next = new Map(prev)
          next.set(stepId, currentStatus)
          return next
        }

        // If step is already success and delayed status is also success, no action needed
        if (currentStatus === "success" && delayedStatus === "success") {
          return prev
        }

        // For any other case, sync the delayed status with current status
        if (delayedStatus !== currentStatus) {
          const next = new Map(prev)
          next.set(stepId, currentStatus)
          return next
        }

        return prev
      })
    })
  }, [steps])

  // Create steps with delayed statuses for non-first steps
  return useMemo(() => {
    return steps.map((step, index) => {
      if (index === 0) {
        return step
      }
      const delayedStatus = delayedStatuses.get(step.id) ?? step.status
      return {
        ...step,
        status: delayedStatus,
      }
    })
  }, [steps, delayedStatuses])
}

