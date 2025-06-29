import { DomainProvider } from "@/contexts/domain-context";
import { getDomain } from "@/lib/get-domain";
import { redirect } from "next/navigation";
import React from "react";

export default async function DomainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const domain = await getDomain();

  return <DomainProvider domain={domain}>{children}</DomainProvider>;
}
