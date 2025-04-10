import { notFound } from "next/navigation";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import SettingsForm from "./_components/settings-form";

interface SettingsPageProps {
  params: Promise<{
    domain: string;
    locale: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { domain } = await params;
  const marathonData = await getMarathonByDomain(domain);

  if (!marathonData) {
    notFound();
  }

  return (
    <div className="container max-w-[1400px] mx-auto py-8">
      <div className="flex flex-col mb-8 gap-1">
        <h1 className="text-2xl font-semibold font-rocgrotesk">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Configure your marathon settings here.
        </p>
      </div>

      <SettingsForm domain={domain} initialData={marathonData} />
    </div>
  );
}
