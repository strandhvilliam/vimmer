import { SessionProvider } from "@/contexts/session-context";
import { getSession } from "@/lib/auth";
import React from "react";

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const sessionPromise = getSession();
  return (
    // <SessionProvider sessionPromise={sessionPromise}>
    children
    // </SessionProvider>
  );
}
