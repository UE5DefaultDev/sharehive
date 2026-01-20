import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { DesktopChatBar } from "@/components/DesktopChatbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider className="h-full min-h-0 w-full overflow-hidden">
      <DesktopChatBar />
      <SidebarInset className="h-full flex-1 min-w-0 overflow-hidden flex flex-col">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
