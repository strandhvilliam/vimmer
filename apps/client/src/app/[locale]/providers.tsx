"use client";

import { I18nProviderClient } from "@/lib/locales/client";
import { Toaster } from "@vimmer/ui/components/toaster";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/contexts/theme-context";
import { PostHogProvider } from "@/contexts/posthog-context";

type ProviderProps = {
  locale: string;
  children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <PostHogProvider>
        <NuqsAdapter>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </NuqsAdapter>
      </PostHogProvider>
    </I18nProviderClient>
  );
}
