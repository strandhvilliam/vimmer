"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "./lib/trpc/react"

export default function ClientPage() {
  const trpc = useTRPC()
  const domain = "uppis"
  const { data: participants } = useSuspenseQuery(
    trpc.participants.getByDomainInfinite.queryOptions({ domain })
  )
  return <pre>{JSON.stringify(participants, null, 2)}</pre>
}
