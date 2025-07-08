"use client";

// import { I18nProviderClient } from "@/lib/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode } from "react";
import { PostHogProvider } from "@/contexts/posthog-context";
import { TRPCReactProvider } from "@/trpc/client";
// import { DomainProvider } from "@/contexts/domain-context";

type ProviderProps = {
  // locale: string;
  children: ReactNode;
};

export function Providers({ children }: ProviderProps) {
  return (
    // <I18nProviderClient locale={locale}>
    <PostHogProvider>
      <NuqsAdapter>
        <TRPCReactProvider>
          {children}
          {/* <DomainProvider domain={domain}>{children}</DomainProvider> */}
        </TRPCReactProvider>
      </NuqsAdapter>
    </PostHogProvider>
    // </I18nProviderClient>
  );
}
