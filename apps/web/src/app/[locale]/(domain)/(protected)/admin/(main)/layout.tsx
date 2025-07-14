import { AppSidebar } from "../_components/app-sidebar";
import { AppHeader } from "../_components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { getDomain } from "@/lib/get-domain";
import { createServerApiClient } from "@/trpc/server";
import { redirect } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
}

export default async function DashboardLayout({ children }: LayoutProps) {
  const domain = await getDomain();
  const serverApi = createServerApiClient();
  const data = await serverApi.marathons.getByDomain.query({ domain });

  if (!data.setupCompleted) {
    redirect(`/admin/onboarding`);
  }

  return (
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
  );
}
