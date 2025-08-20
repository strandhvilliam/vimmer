"use client"

import React, { Suspense, useState, useEffect } from "react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@vimmer/ui/components/tabs"
import { SubmissionsParticipantsTabSkeleton } from "@/components/admin/submissions-participants-skeleton"
import { SubmissionsParticipantsTable } from "@/components/admin/submissions-participants-table"
import { SubmissionsTopicsTable } from "@/components/admin/submissions-topics-table"
import { useDomain } from "@/contexts/domain-context"
import { useSuspenseQuery } from "@tanstack/react-query"
import { useTRPC } from "@/trpc/client"

export function SubmissionsClientPage() {
  const { domain } = useDomain()
  const trpc = useTRPC()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Search state
  const [searchTerm, setSearchTerm] = useState("")

  // Filter state
  const [statusFilters, setStatusFilters] = useState<string[]>([])
  const [classFilters, setClassFilters] = useState<number[]>([])
  const [deviceFilters, setDeviceFilters] = useState<number[]>([])

  // Reset page to 1 when search term or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilters, classFilters, deviceFilters])

  const {
    data: { data: participants, totalCount, totalPages },
  } = useSuspenseQuery(
    trpc.participants.getByDomainPaginated.queryOptions({
      domain,
      page: currentPage,
      pageSize: pageSize,
      search: searchTerm || undefined,
      status: statusFilters.length > 0 ? statusFilters : undefined,
      competitionClassId: classFilters.length > 0 ? classFilters : undefined,
      deviceGroupId: deviceFilters.length > 0 ? deviceFilters : undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    })
  )

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight font-rocgrotesk">
          Submissions
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage photo submissions from participants
        </p>
      </div>

      <Tabs defaultValue="participants">
        <TabsList className="bg-transparent rounded-none p-0 h-auto border-b border-muted-foreground/25 w-full flex justify-start">
          <TabsTrigger
            value="participants"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            By Participant
          </TabsTrigger>
          <TabsTrigger
            value="topics"
            className="px-4 py-2 bg-background rounded-none data-[state=active]:shadow-none data-[state=active]:border-primary border-b-2 border-transparent"
          >
            By Topic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participants" className="mt-6">
          <Suspense fallback={<SubmissionsParticipantsTabSkeleton />}>
            <SubmissionsParticipantsTable
              participants={participants}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              searchTerm={searchTerm}
              statusFilters={statusFilters}
              classFilters={classFilters}
              deviceFilters={deviceFilters}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              onSearchChange={setSearchTerm}
              onStatusFiltersChange={setStatusFilters}
              onClassFiltersChange={setClassFilters}
              onDeviceFiltersChange={setDeviceFilters}
            />
          </Suspense>
        </TabsContent>

        <TabsContent value="topics" className="mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <SubmissionsTopicsTable />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
