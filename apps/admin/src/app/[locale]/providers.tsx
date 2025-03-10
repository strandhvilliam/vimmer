"use client";

import { getSession } from "@/lib/auth";
import { SessionProvider } from "@/lib/hooks/use-session";
import { I18nProviderClient } from "@/locales/client";
import { Toaster } from "@vimmer/ui/components/toaster";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { ThemeProvider } from "@/lib/contexts/theme-context";
import type { ReactNode } from "react";

type ProviderProps = {
  locale: string;
  children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <NuqsAdapter>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </NuqsAdapter>
    </I18nProviderClient>
  );
}
