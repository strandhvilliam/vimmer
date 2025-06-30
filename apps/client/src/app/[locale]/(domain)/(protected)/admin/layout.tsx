import { AppSidebar } from "./_components/app-sidebar";
import { AppHeader } from "./_components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { getSession } from "@/lib/auth";
import { Toaster } from "@vimmer/ui/components/sonner";
import { redirect } from "next/navigation";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { SessionProvider } from "@/hooks/use-session";
import { createServerApiClient } from "@/trpc/server";
import { getDomain } from "@/lib/get-domain";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const domain = await getDomain();
  const sessionPromise = getSession();

  const serverApi = createServerApiClient();

  const data = await serverApi.marathons.getByDomain.query({ domain });

  if (!data.setupCompleted) {
    return redirect(`/onboarding`);
  }

  return (
    <SessionProvider sessionPromise={sessionPromise}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className=" flex flex-1 flex-col max-h-screen overflow-hidden relative">
          <AppHeader />
          <div className="border rounded-tl-2xl overflow-y-auto h-full overflow-hidden relative z-0">
            <DotPattern className="opacity-10" />
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
