
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/toaster";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex-1 overflow-auto">
          <main className="h-full">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppLayout;
