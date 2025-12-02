"use client"

import { useState, useEffect } from "react"
import { Shuffle } from "lucide-react"
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
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Button } from "@vimmer/ui/components/button"

interface Marathon {
  domain: string
  name: string
}

interface CompetitionClass {
  id: number
  name: string
  numberOfPhotos: number
}

interface DeviceGroup {
  id: number
  name: string
}

interface SelectedUpload {
  key: string
  name: string
  thumbnail?: string
  status: "pending" | "uploading" | "success" | "error"
}

interface ControlsPanelProps {
  onRunUploadFlow: (params: {
    domain: string
    reference: string
    firstname: string
    lastname: string
    email: string
    competitionClassId: number
    deviceGroupId: number
  }) => Promise<{ presignedUrls: Array<{ key: string; url: string }> }>
  onReset: () => void
  onCompetitionClassChange?: (numberOfPhotos: number | null) => void
  selectedUploads: SelectedUpload[]
  isSummaryVisible: boolean
}

export function ControlsPanel({
  onRunUploadFlow,
  onReset,
  onCompetitionClassChange,
  selectedUploads,
  isSummaryVisible,
}: ControlsPanelProps) {
  const [domain, setDomain] = useState("")
  const [deviceGroupId, setDeviceGroupId] = useState<number | null>(null)
  const [reference, setReference] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [email, setEmail] = useState("")
  const [competitionClassId, setCompetitionClassId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form options state
  const [marathons, setMarathons] = useState<Marathon[]>([])
  const [competitionClasses, setCompetitionClasses] = useState<CompetitionClass[]>([])
  const [deviceGroups, setDeviceGroups] = useState<DeviceGroup[]>([])
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)

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
      onCompetitionClassChange?.(null)
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
        const firstCompetitionClass = data.competitionClasses?.[0]
        setCompetitionClassId(firstCompetitionClass?.id || null)
        onCompetitionClassChange?.(firstCompetitionClass?.numberOfPhotos || null)
        setDeviceGroupId(data.deviceGroups?.[0]?.id || null)
      } catch (error) {
        console.error("Error fetching options:", error)
      } finally {
        setIsLoadingOptions(false)
      }
    }
    fetchOptions()
  }, [domain, onCompetitionClassChange])

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
      await onRunUploadFlow({
        domain,
        reference,
        firstname,
        lastname,
        email,
        competitionClassId,
        deviceGroupId,
      })
    } finally {
      setIsLoading(false)
    }
  }

  function handleReset() {
    setDomain("")
    setDeviceGroupId(null)
    setReference("")
    setFirstname("")
    setLastname("")
    setEmail("")
    setCompetitionClassId(null)
    setCompetitionClasses([])
    setDeviceGroups([])
    onCompetitionClassChange?.(null)
    onReset()
  }

  async function randomizeReference() {
    const randomNum = Math.floor(Math.random() * 9000) + 1000 // 1000-9999
    setReference(randomNum.toString())
  }

  async function randomizeName() {
    try {
      const randomId = Math.floor(Math.random() * 10) + 1
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${randomId}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const user = await response.json()
      const nameParts = user.name?.split(" ") || []
      setFirstname(nameParts[0] || "")
      setLastname(nameParts.slice(1).join(" ") || "")
    } catch (error) {
      console.error("Error fetching random name:", error)
      // Fallback to simple random names
      const firstNames = ["Ada", "Alan", "Grace", "Tim", "Linus", "Margaret", "John", "Jane"]
      const lastNames = [
        "Lovelace",
        "Turing",
        "Hopper",
        "Berners-Lee",
        "Torvalds",
        "Hamilton",
        "Doe",
        "Smith",
      ]
      const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      if (randomFirstName) setFirstname(randomFirstName)
      if (randomLastName) setLastname(randomLastName)
    }
  }

  async function randomizeEmail() {
    try {
      const randomId = Math.floor(Math.random() * 10) + 1
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${randomId}`)
      if (!response.ok) throw new Error("Failed to fetch")
      const user = await response.json()
      setEmail(user.email || "")
    } catch (error) {
      console.error("Error fetching random email:", error)
      // Fallback to simple random email
      const randomNum = Math.floor(Math.random() * 10000)
      setEmail(`user${randomNum}@example.com`)
    }
  }

  const selectedMarathon = marathons.find((marathon) => marathon.domain === domain)
  const selectedClass = competitionClasses.find((cc) => cc.id === competitionClassId)
  const selectedGroup = deviceGroups.find((dg) => dg.id === deviceGroupId)

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-semibold">Observer Controls</CardTitle>
        <CardDescription>
          {isSummaryVisible ? "Review the current run" : "Configure a run and trigger actions"}
        </CardDescription>
      </CardHeader>
      {isSummaryVisible ? (
        <CardContent className="flex flex-col gap-4 overflow-auto flex-1 pb-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <SummaryItem label="Reference" value={reference || "—"} />
            <SummaryItem
              label="Domain"
              value={selectedMarathon ? `${selectedMarathon.name} (${selectedMarathon.domain})` : "—"}
            />
            <SummaryItem label="Firstname" value={firstname || "—"} />
            <SummaryItem label="Lastname" value={lastname || "—"} />
            <SummaryItem label="Email" value={email || "—"} />
            <SummaryItem label="Competition Class" value={selectedClass?.name || "—"} />
            <SummaryItem label="Device Group" value={selectedGroup?.name || "—"} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wide text-muted-foreground">
              Selected photos
            </p>
            {selectedUploads.length > 0 ? (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {selectedUploads.map((upload) => (
                  <div
                    key={upload.key}
                    className="flex flex-col items-center gap-1 w-24 flex-shrink-0"
                  >
                    <div className="w-24 h-16 rounded-md overflow-hidden border bg-muted">
                      {upload.thumbnail ? (
                        <img
                          src={upload.thumbnail}
                          alt={upload.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          No preview
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-medium truncate w-full text-center">
                      {upload.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      {upload.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full rounded-md border bg-muted/40 p-4 text-sm text-muted-foreground">
                No photos selected
              </div>
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 overflow-auto flex-1 pb-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reference">Reference</Label>
            <div className="flex gap-2">
              <Input
                id="reference"
                placeholder="1234"
                value={reference}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 4)
                  setReference(value)
                }}
                className="flex-1"
                maxLength={4}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={randomizeReference}
                className="h-10 w-10 shrink-0"
                title="Randomize reference"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
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
            <div className="flex gap-2">
              <Input
                id="firstname"
                placeholder="Ada"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={randomizeName}
                className="h-10 w-10 shrink-0"
                title="Randomize name"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="lastname">Lastname</Label>
            <div className="flex gap-2">
              <Input
                id="lastname"
                placeholder="Lovelace"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={randomizeName}
                className="h-10 w-10 shrink-0"
                title="Randomize name"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="ada@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={randomizeEmail}
                className="h-10 w-10 shrink-0"
                title="Randomize email"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="competitionClassId">Competition Class</Label>
            <Select
              value={competitionClassId?.toString() || ""}
              onValueChange={(value) => {
                const id = parseInt(value) || null
                setCompetitionClassId(id)
                const selectedClass = competitionClasses.find((cc) => cc.id === id)
                onCompetitionClassChange?.(selectedClass?.numberOfPhotos || null)
              }}
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
        </CardContent>
      )}
      <CardFooter className="flex gap-3 flex-shrink-0">
        <PrimaryButton onClick={handleRunUploadFlow} disabled={isLoading}>
          {isLoading ? "Starting..." : "Run Upload Processor"}
        </PrimaryButton>
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}

interface SummaryItemProps {
  label: string
  value: string
}

function SummaryItem({ label, value }: SummaryItemProps) {
  return (
    <div className="rounded-md border p-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold mt-0.5 break-words leading-snug">{value}</p>
    </div>
  )
}
