import { getSession } from "@/lib/auth";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { OnboardingFlow } from "./_components/onboarding-flow";

export default async function OnboardingPage() {
  const session = await getSession();

  if (!session) {
    return redirect("/login");
  }

  const cookieStore = await cookies();
  const domain = cookieStore.get("activeDomain")?.value;
  if (!domain) {
    return notFound();
  }

  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    return notFound();
  }

  // if (marathon.setupCompleted) {
  //   redirect(`/${domain}/dashboard`);
  // }

  return <OnboardingFlow marathon={marathon} />;
}
