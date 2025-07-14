"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Marathon } from "@vimmer/api/db/types";

interface OnboardingGuardProps {
  marathon: Marathon | null;
  domain: string;
  children: React.ReactNode;
}

export function OnboardingGuard({
  marathon,
  domain,
  children,
}: OnboardingGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (
      marathon &&
      !marathon.setupCompleted &&
      pathname !== `/admin/onboarding`
    ) {
      router.push(`/admin/onboarding`);
    }
  }, [marathon, domain, router, pathname]);

  if (!marathon || !marathon.setupCompleted) {
    return null;
  }

  return <>{children}</>;
}
