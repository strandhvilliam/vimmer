import "@vimmer/ui/globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { Toaster } from "@vimmer/ui/components/sonner";
import { getDomain } from "@/lib/get-domain";
import { Resource } from "sst";

export const metadata: Metadata = {
  title: "Blikka",
  description: "Upload your submissions",
};

export const generateStaticParams = async () => {
  return [{ locale: "en" }];
};

interface RootLayoutProps {
  params: Promise<{
    locale: string;
  }>;
  children: React.ReactNode;
}

export default async function RootLayout({
  params,
  children,
}: RootLayoutProps) {
  const { locale } = await params;

  let domain: string | null = null;
  try {
    domain = await getDomain();
  } catch (_) {
    // expected error
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
        <Providers domain={domain} locale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
