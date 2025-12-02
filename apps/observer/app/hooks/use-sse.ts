import { useEffect, useRef, useState } from "react"
import { Stream } from "effect"

interface PubSubMessage {
  channel: string
  payload: unknown
  timestamp: number
  messageId: string
}

interface UseSSEOptions {
  enabled?: boolean
  onMessage?: (message: PubSubMessage) => void
  onConnect?: (message: PubSubMessage) => void
  onError?: (error: Event) => void
}

export function useSSE(channel: string | null, options: UseSSEOptions = {}) {
  const { enabled = true, onMessage, onConnect, onError } = options
  const [isConnected, setIsConnected] = useState(false)
  const eventSourceRef = useRef<EventSource | null>(null)
  const callbacksRef = useRef({ onMessage, onConnect, onError })

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onMessage, onConnect, onError }
  }, [onMessage, onConnect, onError])

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
        const message = event.data
        if (typeof message !== "string") {
          throw new Error("Message is not a string")
        }

        const parsedMessage = JSON.parse(
          JSON.stringify(JSON.parse(message.replace("data: ", "")))
        ) as PubSubMessage

        console.log("parsedMessage", parsedMessage)
        if ((parsedMessage.payload as { message: string })?.message === "connected") {
          console.log("Connected")
          return
        }

        callbacksRef.current.onMessage?.(parsedMessage as PubSubMessage)
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
