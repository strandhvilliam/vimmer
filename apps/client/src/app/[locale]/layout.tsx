import "@vimmer/ui/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { AnimatedGradientBackground } from "@vimmer/ui/components/animated-gradient-background";
import { Toaster } from "@vimmer/ui/components/sonner";

export const metadata: Metadata = {
  title: "Vimmer",
  description: "Upload your submissions",
};

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
}) {
  const { locale } = await params;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`font-neuehaasgrotesk font-normal antialiased`}
    >
      <body className="bg-muted ">
        <DotPattern />
        <Toaster />
        <Providers locale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
