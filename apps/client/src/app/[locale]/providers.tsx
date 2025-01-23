"use client";

import { I18nProviderClient } from "@/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";

type ProviderProps = {
  locale: string;
  children: ReactNode;
};

export function Providers({ locale, children }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <NuqsAdapter>
        {/* <ThemeProvider */}
        {/*   attribute="class" */}
        {/*   defaultTheme="system" */}
        {/*   enableSystem */}
        {/*   disableTransitionOnChange */}
        {/* > */}
        {children}
        {/* </ThemeProvider> */}
      </NuqsAdapter>
    </I18nProviderClient>
  );
}
