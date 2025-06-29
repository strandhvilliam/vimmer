"use client";

import { I18nProviderClient } from "@/locales/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { TRPCReactProvider } from "@/trpc/client";
import { Session } from "better-auth";
import { User } from "better-auth";
import { SessionProvider } from "@/lib/hooks/use-session";

type ProviderProps = {
  locale: string;
  children: ReactNode;
  sessionPromise: Promise<{ session: Session; user: User } | null>;
};

export function Providers({ locale, children, sessionPromise }: ProviderProps) {
  return (
    <I18nProviderClient locale={locale}>
      <NuqsAdapter>
        <TRPCReactProvider>
          <SessionProvider sessionPromise={sessionPromise}>
            {children}
          </SessionProvider>
        </TRPCReactProvider>
      </NuqsAdapter>
    </I18nProviderClient>
  );
}
