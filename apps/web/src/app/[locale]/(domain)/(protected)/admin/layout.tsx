import { RealtimeProvider } from "@/contexts/realtime-context";
import { SessionProvider } from "@/contexts/session-context";
import { getSession } from "@/lib/auth";
import React from "react";
import { Resource } from "sst";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionPromise = getSession();

  const realtimeConfig = {
    endpoint: Resource.Realtime.endpoint,
    authorizer: Resource.Realtime.authorizer,
    topic: `${Resource.App.name}/${Resource.App.stage}/revalidate`,
  };
  return (
    <SessionProvider sessionPromise={sessionPromise}>
      <RealtimeProvider realtimeConfig={realtimeConfig}>
        {children}
      </RealtimeProvider>
    </SessionProvider>
  );
}
