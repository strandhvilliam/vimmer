"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@vimmer/ui/components/card"
import { Input } from "@vimmer/ui/components/input"
import { Label } from "@vimmer/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@vimmer/ui/components/select"
import { Switch } from "@vimmer/ui/components/switch"
import { ScrollArea } from "@vimmer/ui/components/scroll-area"
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@vimmer/ui/components/resizable"
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Button } from "@vimmer/ui/components/button"
import { UploadDialog } from "./components/upload-dialog"
import { useSSE } from "./hooks/use-sse"

interface Step {
  id: string
  name: string
  description: string
}

const STEPS: Step[] = [
  { id: "upload-processor", name: "Upload Processor", description: "Process uploads" },
  { id: "bus", name: "Bus", description: "Publish events" },
  { id: "validator", name: "Validator", description: "Validate photos" },
  { id: "contact-sheet", name: "Contact Sheet", description: "Generate sheet" },
  { id: "zip-worker", name: "Zip Worker", description: "Create export zip" },
]

interface RunStateEvent {
  state: "start" | "end"
  taskName: string
  timestamp: number
  error: string | null
  duration: number | null
}

const MOCK_IMAGES: { id: string; fileName: string }[] = [
  { id: "1", fileName: "IMG_0001.JPG" },
  { id: "2", fileName: "IMG_0002.JPG" },
  { id: "3", fileName: "IMG_0003.JPG" },
  { id: "4", fileName: "IMG_0004.JPG" },
  { id: "5", fileName: "IMG_0005.JPG" },
]

export default function ObserverDashboard() {
  const [domain, setDomain] = useState("")
  const [deviceGroupId, setDeviceGroupId] = useState<number | null>(null)
  const [shouldValidate, setShouldValidate] = useState(true)
  const [shouldGenerateContactSheet, setShouldGenerateContactSheet] = useState(true)
  const [shouldZip, setShouldZip] = useState(false)
  const [reference, setReference] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [competitionClassId, setCompetitionClassId] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [presignedUrls, setPresignedUrls] = useState<Array<{ key: string; url: string }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Form options state
  const [marathons, setMarathons] = useState<Array<{ domain: string; name: string }>>([])
  const [competitionClasses, setCompetitionClasses] = useState<Array<{ id: number; name: string }>>(
    []
  )
  const [deviceGroups, setDeviceGroups] = useState<Array<{ id: number; name: string }>>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [stepStates, setStepStates] = useState<
    Record<string, "pending" | "running" | "done" | "error">
  >({})

  // Subscribe to logger events
  useSSE("dev:logger:*", {
    onMessage: (message) => {
      if (typeof message.payload === "string") {
        setLogs((prev) => [...prev.slice(-199), message.payload as string])
      }
    },
    onError: (error) => {
      console.error("SSE logger error:", error)
    },
  })

  // Subscribe to upload flow status events
  const uploadFlowChannel = reference ? `dev:upload-flow:${reference}` : null
  useSSE(uploadFlowChannel, {
    onMessage: (message) => {
      const payload = message.payload as RunStateEvent
      if (payload.state === "start") {
        setStepStates((prev) => ({ ...prev, [payload.taskName]: "running" }))
      } else if (payload.state === "end") {
        setStepStates((prev) => ({
          ...prev,
          [payload.taskName]: payload.error ? "error" : "done",
        }))
      }
    },
    onError: (error) => {
      console.error("SSE upload flow error:", error)
    },
  })

  // Initialize step states
  useEffect(() => {
    const initialStates: Record<string, "pending"> = {}
    STEPS.forEach((step) => {
      initialStates[step.id] = "pending"
    })
    setStepStates(initialStates)
  }, [])

  // Fetch marathons on mount
  useEffect(() => {
    async function fetchMarathons() {
      try {
        const response = await fetch("/api/form-options")
        if (!response.ok) throw new Error("Failed to fetch marathons")
        const data = await response.json()
        setMarathons(data.marathons || [])
      } catch (error) {
        console.error("Error fetching marathons:", error)
      }
    }
    fetchMarathons()
  }, [])

  // Fetch competition classes and device groups when domain changes
  useEffect(() => {
    if (!domain) {
      setCompetitionClasses([])
      setDeviceGroups([])
      setCompetitionClassId(null)
      setDeviceGroupId(null)
      return
    }

    setIsLoadingOptions(true)
    async function fetchOptions() {
      try {
        const response = await fetch(`/api/form-options?domain=${encodeURIComponent(domain)}`)
        if (!response.ok) throw new Error("Failed to fetch options")
        const data = await response.json()
        setCompetitionClasses(data.competitionClasses || [])
        setDeviceGroups(data.deviceGroups || [])
        // Reset selections when domain changes
        setCompetitionClassId(data.competitionClasses?.[0]?.id || null)
        setDeviceGroupId(data.deviceGroups?.[0]?.id || null)
      } catch (error) {
        console.error("Error fetching options:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [domain])

  async function handleRunUploadFlow() {
    if (
      !reference ||
      !firstname ||
      !lastname ||
      !email ||
      !domain ||
      !competitionClassId ||
      !deviceGroupId
    ) {
      alert("Please fill in all required fields")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/run-upload-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          domain,
          reference,
          firstname,
          lastname,
          email,
          competitionClassId,
          deviceGroupId,
        }),
      })

      if (!response.ok) {
        const error = response.statusText
        console.error(error)
        throw new Error(error || "Failed to start upload flow")
      }

      const data = await response.json()
      setPresignedUrls(data.presignedUrls || [])
      setIsDialogOpen(true)
    } catch (error) {
      console.error("Error starting upload flow:", error)
      alert(error instanceof Error ? error.message : "Failed to start upload flow")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-screen bg-background p-4 sm:p-6">
      <ResizablePanelGroup direction="vertical" className="h-full gap-2">
        <ResizablePanel defaultSize={55} minSize={40}>
          <ResizablePanelGroup direction="horizontal" className="gap-2">
            <ResizablePanel defaultSize={50} minSize={35} className="overflow-hidden">
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-semibold">Observer Controls</CardTitle>
                  <CardDescription>Configure a run and trigger actions</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 overflow-auto flex-1">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="reference">Reference</Label>
                    <Input
                      id="reference"
                      placeholder="P-99812"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger id="domain">
                        <SelectValue placeholder="Choose domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {marathons.map((marathon) => (
                          <SelectItem key={marathon.domain} value={marathon.domain}>
                            {marathon.name} ({marathon.domain})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstname">Firstname</Label>
                    <Input
                      id="firstname"
                      placeholder="Ada"
                      value={firstname}
                      onChange={(e) => setFirstname(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastname">Lastname</Label>
                    <Input
                      id="lastname"
                      placeholder="Lovelace"
                      value={lastname}
                      onChange={(e) => setLastname(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ada@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="competitionClassId">Competition Class</Label>
                    <Select
                      value={competitionClassId?.toString() || ""}
                      onValueChange={(value) => setCompetitionClassId(parseInt(value) || null)}
                      disabled={!domain || isLoadingOptions}
                    >
                      <SelectTrigger id="competitionClassId">
                        <SelectValue placeholder="Choose competition class" />
                      </SelectTrigger>
                      <SelectContent>
                        {competitionClasses.map((cc) => (
                          <SelectItem key={cc.id} value={cc.id.toString()}>
                            {cc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="deviceGroup">Device Group</Label>
                    <Select
                      value={deviceGroupId?.toString() || ""}
                      onValueChange={(value) => setDeviceGroupId(parseInt(value) || null)}
                      disabled={!domain || isLoadingOptions}
                    >
                      <SelectTrigger id="deviceGroup">
                        <SelectValue placeholder="Choose group" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceGroups.map((dg) => (
                          <SelectItem key={dg.id} value={dg.id.toString()}>
                            {dg.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-1 sm:col-span-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">Validate</p>
                        <p className="text-xs text-muted-foreground">Run photo validation</p>
                      </div>
                      <Switch checked={shouldValidate} onCheckedChange={setShouldValidate} />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">Contact Sheet</p>
                        <p className="text-xs text-muted-foreground">Generate sheet preview</p>
                      </div>
                      <Switch
                        checked={shouldGenerateContactSheet}
                        onCheckedChange={setShouldGenerateContactSheet}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="text-sm font-medium">Zip Export</p>
                        <p className="text-xs text-muted-foreground">Create participant zip</p>
                      </div>
                      <Switch checked={shouldZip} onCheckedChange={setShouldZip} />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-3 flex-shrink-0">
                  <PrimaryButton onClick={handleRunUploadFlow} disabled={isLoading}>
                    {isLoading ? "Starting..." : "Run Upload Processor"}
                  </PrimaryButton>
                  <Button variant="secondary">Reset</Button>
                </CardFooter>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={35} className="overflow-hidden">
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-semibold">Flow Visualisation</CardTitle>
                  <CardDescription>Live status of @upload-processor pipeline</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto flex-1">
                  <div className="flex items-center gap-4">
                    {STEPS.map((step, index) => {
                      const stepState = stepStates[step.id] || "pending"
                      const isActive = stepState === "running"
                      const isDone = stepState === "done"
                      const hasError = stepState === "error"
                      return (
                        <div key={step.id} className="flex items-center gap-4">
                          <div
                            className={[
                              "rounded-md border px-3 py-2 text-sm",
                              isActive && "border-amber-500 bg-amber-50",
                              isDone && "border-emerald-500 bg-emerald-50",
                              hasError && "border-red-500 bg-red-50",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {hasError
                                ? "error"
                                : isDone
                                  ? "done"
                                  : isActive
                                    ? "running"
                                    : "queued"}
                            </p>
                          </div>
                          {index < STEPS.length - 1 && (
                            <span className="text-muted-foreground">→</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={45} minSize={35}>
          <ResizablePanelGroup direction="horizontal" className="gap-2">
            <ResizablePanel defaultSize={55} minSize={35} className="overflow-hidden">
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-semibold">Results</CardTitle>
                  <CardDescription>Artifacts and data emitted by the engine</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 overflow-auto flex-1">
                  <div className="flex gap-3 flex-shrink-0">
                    <Button size="sm" variant="outline">
                      Zip File
                    </Button>
                    <Button size="sm" variant="outline">
                      Contact Sheet
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 flex-1 min-h-0">
                    <Card className="flex flex-col overflow-hidden">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-base">Validation Results</CardTitle>
                      </CardHeader>
                      <CardContent className="overflow-auto flex-1">
                        <ul className="list-disc pl-5 text-sm space-y-1">
                          <li>No duplicates found</li>
                          <li>Expected count: 5, received: 5</li>
                          <li>All EXIF timestamps within contest window</li>
                          <li>Thumbnails generated for 5 images</li>
                        </ul>
                      </CardContent>
                    </Card>
                    <Card className="flex flex-col overflow-hidden">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-base">Images</CardTitle>
                        <CardDescription>Uploaded files</CardDescription>
                      </CardHeader>
                      <CardContent className="overflow-auto flex-1">
                        <div className="grid grid-cols-2 gap-3">
                          {MOCK_IMAGES.map((img) => (
                            <div
                              key={img.id}
                              className="aspect-square w-full rounded-md border bg-muted flex items-center justify-center text-xs"
                            >
                              {img.fileName}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={45} minSize={30} className="overflow-hidden">
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="font-semibold">Logs</CardTitle>
                  <CardDescription>Streamed output from dev:logger:*</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto flex-1">
                  <ScrollArea className="h-full">
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {logs.length === 0 ? "Waiting for logs..." : logs.join("\n")}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
      <UploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        presignedUrls={presignedUrls}
      />
    </div>
  )
}
