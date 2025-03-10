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
        <SidebarInset>
          <div className="flex flex-1 flex-col max-h-screen overflow-hidden">
            <AppHeader domain={domain} />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionProvider>
  );
}
