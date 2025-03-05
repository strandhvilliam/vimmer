import { AppSidebar } from "../../../components/app-sidebar";
import { AppHeader } from "../../../components/app-header";
import { SidebarInset, SidebarProvider } from "@vimmer/ui/components/sidebar";
import { Suspense } from "react";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{
    domain: string;
  }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { domain } = await params;

  return (
    <SidebarProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <AppHeader domain={domain} />
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
