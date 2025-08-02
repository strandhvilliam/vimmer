import { Metadata } from "next";
import {
  LandingHeader,
  LandingHeroSection,
  LandingTrustLogos,
  LandingFeatures,
  LandingTestimonials,
  LandingPricing,
  LandingFooter,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "Blikka - Photo Marathon Platform for the People",
  description:
    "Create, manage, and judge photo marathon competitions with real-time submissions, automated validation, and comprehensive analytics. Built for photographers, organizers, and communities.",
  keywords: [
    "photo marathon",
    "photography competition",
    "photo contest platform",
    "real-time submissions",
    "photo judging",
    "photography events",
    "digital photography",
    "photo validation",
    "competition management",
  ],
  openGraph: {
    title: "Blikka - Photo Marathon Platform for the People",
    description:
      "The complete platform for organizing and managing photo marathon competitions with real-time submissions and automated judging.",
    type: "website",
    url: "https://blikka.app",
    images: [
      {
        url: "/vimmer-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Blikka Photo Marathon Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blikka - Photo Marathon Platform for the People",
    description:
      "Create, manage, and judge photo marathon competitions with real-time submissions and automated validation.",
    images: ["/vimmer-twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LandingHeader />
      <main>
        <LandingHeroSection />
        <LandingTrustLogos />
        <LandingFeatures />
        <LandingTestimonials />
        <LandingPricing />
      </main>
      <LandingFooter />
    </div>
  );
}
