import SettingsForm from "./_components/settings-form";
import { Suspense } from "react";
import { getDomain } from "@/lib/get-domain";
import { prefetch, trpc } from "@/trpc/server";

export default async function SettingsPage() {
  const domain = await getDomain();

  prefetch(
    trpc.marathons.getByDomain.queryOptions({
      domain,
    })
  );

  return (
    <div className="container max-w-[1400px] mx-auto py-8">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-2xl font-semibold font-rocgrotesk">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure your marathon settings here.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
