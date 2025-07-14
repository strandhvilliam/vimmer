import "@vimmer/ui/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { Toaster } from "@vimmer/ui/components/sonner";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getDomain } from "@/lib/get-domain";
import { Resource } from "sst";

export const metadata: Metadata = {
  title: "Vimmer",
  description: "Upload your submissions",
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }];
};

export default async function RootLayout({
  // params,
  children,
}: {
  // params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  // const { locale } = await params;

  // const domain = (await headers()).get("x-domain");

  let domain: string | null = null;
  try {
    domain = await getDomain();
  } catch (e) {
    // expected error
  }

  // if (!domain) {
  //   return notFound();
  // }

  const realtimeConfig = {
    endpoint: Resource.Realtime.endpoint,
    authorizer: Resource.Realtime.authorizer,
    topic: `${Resource.App.name}/${Resource.App.stage}/revalidate`,
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-neuehaasgrotesk font-normal antialiased`}
    >
      <body className="bg-muted ">
        <DotPattern />
        <Toaster />
        <Providers domain={domain} realtimeConfig={realtimeConfig}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
