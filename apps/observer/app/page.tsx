"use client"

import { useEffect, useMemo, useState } from "react"
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

interface Step {
  id: string
  name: string
  description: string
}

const MOCK_STEPS: Step[] = [
  { id: "upload-processor", name: "Upload Processor", description: "Process uploads" },
  { id: "bus", name: "Bus", description: "Publish events" },
  { id: "validator", name: "Validator", description: "Validate photos" },
  { id: "contact-sheet", name: "Contact Sheet", description: "Generate sheet" },
  { id: "zip-worker", name: "Zip Worker", description: "Create export zip" },
]

const MOCK_LOGS: string[] = Array.from({ length: 60 }).map(
  (_, i) => `${"2025-10-23T12:00:00.000Z"}  [upload-processor] event-${i} processed \u2713`
)

const MOCK_IMAGES: { id: string; fileName: string }[] = [
  { id: "1", fileName: "IMG_0001.JPG" },
  { id: "2", fileName: "IMG_0002.JPG" },
  { id: "3", fileName: "IMG_0003.JPG" },
  { id: "4", fileName: "IMG_0004.JPG" },
  { id: "5", fileName: "IMG_0005.JPG" },
]

export default function ObserverDashboard() {
  const [activeStepIndex, setActiveStepIndex] = useState(0)
  const [domain, setDomain] = useState("uppis")
  const [deviceGroup, setDeviceGroup] = useState("default")
  const [shouldValidate, setShouldValidate] = useState(true)
  const [shouldGenerateContactSheet, setShouldGenerateContactSheet] = useState(true)
  const [shouldZip, setShouldZip] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setActiveStepIndex((i) => (i + 1) % MOCK_STEPS.length)
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const activeStep = useMemo(() => MOCK_STEPS[activeStepIndex]?.id, [activeStepIndex])

  useEffect(() => {
    const eventSource = new EventSource("/api/subscribe/dev:upload-flow:test")
    eventSource.onmessage = (event) => {
      console.log(event.data)
    }
    return () => eventSource.close()
  }, [])

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
                    <Input id="reference" placeholder="P-99812" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="domain">Domain</Label>
                    <Select value={domain} onValueChange={setDomain}>
                      <SelectTrigger id="domain">
                        <SelectValue placeholder="Choose domain" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uppis">uppis</SelectItem>
                        <SelectItem value="gymnasiet">gymnasiet</SelectItem>
                        <SelectItem value="demo">demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="firstname">Firstname</Label>
                    <Input id="firstname" placeholder="Ada" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="lastname">Lastname</Label>
                    <Input id="lastname" placeholder="Lovelace" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="class">Class</Label>
                    <Input id="class" placeholder="9B" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="deviceGroup">Device Group</Label>
                    <Select value={deviceGroup} onValueChange={setDeviceGroup}>
                      <SelectTrigger id="deviceGroup">
                        <SelectValue placeholder="Choose group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">default</SelectItem>
                        <SelectItem value="beta">beta</SelectItem>
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
                  <PrimaryButton
                    onClick={() => {
                      /* mock action */
                    }}
                  >
                    Run Upload Processor
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
                    {MOCK_STEPS.map((step, index) => {
                      const isActive = activeStep === step.id
                      const isDone = index < activeStepIndex
                      return (
                        <div key={step.id} className="flex items-center gap-4">
                          <div
                            className={[
                              "rounded-md border px-3 py-2 text-sm",
                              isActive && "border-amber-500 bg-amber-50",
                              isDone && "border-emerald-500 bg-emerald-50",
                            ]
                              .filter(Boolean)
                              .join(" ")}
                          >
                            <p className="font-medium">{step.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {isDone ? "done" : isActive ? "running" : "queued"}
                            </p>
                          </div>
                          {index < MOCK_STEPS.length - 1 && (
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
                  <CardDescription>Streamed output (mock)</CardDescription>
                </CardHeader>
                <CardContent className="overflow-auto flex-1">
                  <ScrollArea className="h-full">
                    <pre className="text-xs leading-relaxed whitespace-pre-wrap font-mono">
                      {MOCK_LOGS.join("\n")}
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
