import { DomainList } from "./domains-list";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getMarathonsByUserId } from "@vimmer/supabase/queries";
import { createClient } from "@vimmer/supabase/server";
import { EmptyDomainsState } from "./empty-domains-state";

export default async function DomainsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) return [];
  const supabase = await createClient();
  const marathons = await getMarathonsByUserId(supabase, session.user.id);

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="mb-6 text-3xl font-bold">Your Domains</h1>

      {marathons.length > 0 ? (
        <DomainList marathons={marathons} />
      ) : (
        <EmptyDomainsState />
      )}
    </div>
  );
}
