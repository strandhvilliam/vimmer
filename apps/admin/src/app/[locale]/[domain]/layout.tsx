import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { auth, getSession } from "@/lib/auth";
import { SessionProvider } from "@/lib/hooks/use-session";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
}

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps) {
  const { domain } = await params;

  const sessionPromise = getSession();

  return (
    <SessionProvider sessionPromise={sessionPromise}>
      <SidebarProvider>
        <AppSidebar />
        {/* <div className="relative min-h-full border border-red-500 pt-px md:rounded-tl-2xl md:border md:border-b-0 md:border-r-0 md:border-neutral-200/80 md:bg-white"></div> */}
        <SidebarInset className="bg-sidebar flex flex-1 flex-col max-h-screen overflow-hidden">
          <AppHeader domain={domain} />
          <div className="border rounded-tl-2xl bg-background overflow-y-auto h-full">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
