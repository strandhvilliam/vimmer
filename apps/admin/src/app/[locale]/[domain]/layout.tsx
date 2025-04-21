import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { auth, getSession } from "@/lib/auth";
import { SessionProvider } from "@/lib/hooks/use-session";
import { Toaster } from "@vimmer/ui/components/sonner";

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
        <SidebarInset className=" bg-sidebar flex flex-1 flex-col max-h-screen overflow-hidden">
          <AppHeader domain={domain} />
          <div className="border rounded-tl-2xl bg-background overflow-y-auto h-full">
            {children}
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </SessionProvider>
  );
}
