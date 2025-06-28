import "@vimmer/ui/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { Toaster } from "@vimmer/ui/components/sonner";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Vimmer",
  description: "Upload your submissions",
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }];
};

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;

  const domain = (await headers()).get("x-domain");

  if (!domain) {
    return notFound();
  }

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-neuehaasgrotesk font-normal antialiased`}
    >
      <body className="bg-muted ">
        <DotPattern />
        <Toaster />
        <Providers locale={locale} domain={domain}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
