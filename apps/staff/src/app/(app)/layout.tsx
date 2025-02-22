import AppSidebar from "@/components/app-sidebar";
import CurrentPageHeader from "@/components/current-page-header";
import { Separator } from "@vimmer/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@vimmer/ui/components/sidebar";

export default async function StaffAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "350px",
        } as React.CSSProperties
      }
    >
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 flex shrink-0 items-center gap-2 border-b bg-background p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <CurrentPageHeader />
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
