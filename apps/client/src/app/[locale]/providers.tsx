"use client";

import { I18nProviderClient } from "@/lib/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode } from "react";
import { PostHogProvider } from "@/contexts/posthog-context";
import { TRPCReactProvider } from "@/trpc/client";
import { DomainProvider } from "@/contexts/domain-context";

type ProviderProps = {
  locale: string;
  children: ReactNode;
  domain: string;
};

export function Providers({ locale, children, domain }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <PostHogProvider>
        <NuqsAdapter>
          <TRPCReactProvider>
            {/* <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          > */}
            <DomainProvider domain={domain}>{children}</DomainProvider>
            {/* </ThemeProvider> */}
          </TRPCReactProvider>
        </NuqsAdapter>
      </PostHogProvider>
    </I18nProviderClient>
  );
}
