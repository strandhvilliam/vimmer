"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@vimmer/ui/components/card"
import { ScrollArea } from "@vimmer/ui/components/scroll-area"
import { Atom, Result, useAtomValue } from "@effect-atom/atom-react"
import { useMounted } from "@/hooks/use-mounted"
import { sseAtom } from "@/lib/atoms"

const loggerAtom = Atom.make((get) => get(sseAtom("dev:logger:*")))

export function LogsPanel() {
  const mounted = useMounted()
  const result = useAtomValue(loggerAtom)

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Logs</CardTitle>
        <CardDescription>Streamed output from dev:logger:*</CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto flex-1">
        <ScrollArea className="h-full">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
            {!mounted
              ? "Loading..."
              : Result.match(result, {
                  onInitial: () => "Waiting for logs...",
                  onFailure: () => "Error",
                  onSuccess: (result) => result.value.map((message) => message.payload).join("\n"),
                })}
          </pre>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
