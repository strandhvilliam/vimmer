"use client";

// import { I18nProviderClient } from "@/lib/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode } from "react";
import { PostHogProvider } from "@/contexts/posthog-context";
import { TRPCReactProvider } from "@/trpc/client";
import { I18nProviderClient } from "@/locales/client";
// import { DomainProvider } from "@/contexts/domain-context";

type ProviderProps = {
  // locale: string;
  children: ReactNode;
  domain: string | null;
  locale: string;
};

export function Providers({ children, domain, locale }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      {/* <PostHogProvider> */}
      <NuqsAdapter>
        <TRPCReactProvider domain={domain}>{children}</TRPCReactProvider>
      </NuqsAdapter>
      {/* </PostHogProvider> */}
    </I18nProviderClient>
  );
}
