import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { getSession } from "@/lib/auth";
import { SessionProvider } from "@/lib/hooks/use-session";
import { Toaster } from "@vimmer/ui/components/sonner";
import { getMarathonByDomain } from "@vimmer/supabase/cached-queries";
import { notFound, redirect } from "next/navigation";
import { DotPattern } from "@vimmer/ui/components/dot-pattern";
import { connection } from "next/server";

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
  await connection();
  const { domain } = await params;

  const sessionPromise = getSession();
  const marathon = await getMarathonByDomain(domain);

  if (!marathon) {
    return notFound();
  }
  if (!marathon.setupCompleted) {
    return redirect(`/admin/onboarding`);
  }

  return (
    <SessionProvider sessionPromise={sessionPromise}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className=" flex flex-1 flex-col max-h-screen overflow-hidden relative">
          <AppHeader domain={domain} />
          <div className="border rounded-tl-2xl overflow-y-auto h-full overflow-hidden relative z-0">
            <DotPattern className="opacity-10" />
            {children}
          </div>
        </SidebarInset>
        <Toaster />
      </SidebarProvider>
    </SessionProvider>
  );
}
