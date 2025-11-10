"use client"

import { useState, useEffect } from "react"
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
import { PrimaryButton } from "@vimmer/ui/components/primary-button"
import { Button } from "@vimmer/ui/components/button"

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
}

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
}

export function ControlsPanel({ onRunUploadFlow, onReset, onCompetitionClassChange }: ControlsPanelProps) {
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
    setShouldValidate(true)
    setShouldGenerateContactSheet(true)
    setShouldZip(false)
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

  return (
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
        <Button variant="secondary" onClick={handleReset}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
