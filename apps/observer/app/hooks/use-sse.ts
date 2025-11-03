import { useEffect, useRef, useState } from "react"

interface PubSubMessage {
  channel: string
  payload: unknown
  timestamp: number
  messageId: string
}

interface UseSSEOptions {
  enabled?: boolean
  onMessage?: (message: PubSubMessage) => void
  onError?: (error: Event) => void
}

export function useSSE(channel: string | null, options: UseSSEOptions = {}) {
  const { enabled = true, onMessage, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const callbacksRef = useRef({ onMessage, onError })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onMessage, onError }
  }, [onMessage, onError])

  useEffect(() => {
    if (!enabled || !channel) {
      return
    }

    const url = `/api/subscribe?channel=${encodeURIComponent(channel)}`
    const eventSource = new EventSource(url)

    eventSource.onopen = () => {
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const message: PubSubMessage = JSON.parse(event.data)
        callbacksRef.current.onMessage?.(message)
      } catch (error) {
        console.error("Failed to parse SSE message:", error)
      }
    }

    eventSource.onerror = (error) => {
      setIsConnected(false)
      callbacksRef.current.onError?.(error)
    }

    eventSourceRef.current = eventSource

    return () => {
      eventSource.close()
      setIsConnected(false)
    }
  }, [channel, enabled])

  return { isConnected }
}
