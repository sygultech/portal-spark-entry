
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebarContent } from "@/components/layout/AppSidebar";
import { Toaster } from "@/components/ui/toaster";
import { UserProfileMenu } from "@/components/layout/UserProfileMenu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex-1 overflow-auto flex flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-end">
              <UserProfileMenu />
            </div>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
};

export default AppLayout;
