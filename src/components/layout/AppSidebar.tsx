import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import Logo from "@/components/Logo"; // Fixed import statement here
import { menuConfig } from "@/config/menu-config";
import { ChevronLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const AppSidebarContent = () => {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const { state } = useSidebar();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Get the appropriate menu items based on user primary role
  const primaryRole = profile?.roles?.[0];
  const menuItems = primaryRole ? menuConfig[primaryRole] || [] : [];
  
  // Debug logging
  console.log("Profile in AppSidebar:", profile);
  console.log("Menu items for role:", primaryRole, menuItems);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out from your account",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
      });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b px-4">
        <div className="flex w-full items-center gap-2">
          {state === "expanded" ? (
            <Logo size="sm" />
          ) : (
            <Logo size="sm" />
          )}
          {state === "expanded" && (
            <span className="text-lg font-semibold">EduMatrix</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton
                  isActive={location.pathname === item.path}
                  tooltip={state === "collapsed" ? item.label : undefined}
                  asChild
                >
                  <Link to={item.path} className="flex w-full items-center">
                    <item.icon className="mr-2 h-5 w-5" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto flex h-5 w-5 items-center justify-center rounded-full p-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {profile?.first_name?.[0]}
                {profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            {state === "expanded" && (
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {profile?.first_name} {profile?.last_name}
                </span>
                <span className="text-xs text-muted-foreground capitalize">
                  {profile?.roles?.[0]?.replace("_", " ")}
                </span>
              </div>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="h-8 w-8"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign out</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Sign out</TooltipContent>
          </Tooltip>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export const AppSidebar = () => {
  const [isMounted, setIsMounted] = useState(false);
  
  // Debug logging
  console.log("AppSidebar mounted state:", isMounted);
  
  // Only render on the client
  useEffect(() => {
    setIsMounted(true);
    console.log("AppSidebar mounted");
  }, []);

  if (!isMounted) {
    console.log("AppSidebar not mounted yet");
    return null;
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebarContent />
        <div className="flex flex-1 flex-col">
          <div className="flex items-center p-4">
            <SidebarTrigger />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppSidebar;
