import React, { Suspense } from "react";
import { AlertsTable } from "./_components/alerts-table";
import { getDomain } from "@/lib/get-domain";
import { trpc, batchPrefetch } from "@/trpc/server";

export default async function AlertsPage() {
  const domain = await getDomain();

  batchPrefetch([
    trpc.marathons.getByDomain.queryOptions({ domain }),
    trpc.competitionClasses.getByDomain.queryOptions({ domain }),
    trpc.deviceGroups.getByDomain.queryOptions({ domain }),
    trpc.participants.getByDomain.queryOptions({ domain }),
  ]);

  return (
    <div className="space-y-4 container py-6">
      <div className="flex justify-between flex-col">
        <h1 className="text-2xl font-semibold font-rocgrotesk">
          Validation Alerts
        </h1>
        <p className="text-sm text-muted-foreground">
          Showing all validation issues for the marathon.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-8 text-muted-foreground">
            Loading alerts...
          </div>
        }
      >
        <AlertsTable />
      </Suspense>
    </div>
  );
}
