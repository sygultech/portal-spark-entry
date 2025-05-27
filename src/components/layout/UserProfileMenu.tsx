
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, User as UserIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const UserProfileMenu = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  // Get user initials for avatar fallback
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`;
    } else if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  // Format role label for display
  const formatRoleLabel = (role: string) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleProfileSettings = () => {
    navigate("/profile/settings");
  };

  const handleLogout = async () => {
    await signOut();
  };

  const displayName = profile ? 
    `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 
    user?.email?.split('@')[0] || 'User';

  const primaryRole = profile?.role?.[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center rounded-full outline-none ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="font-medium leading-none">{displayName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
            {primaryRole && (
              <Badge variant="outline" className="w-fit mt-1">
                {formatRoleLabel(primaryRole)}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleProfileSettings}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Profile Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileMenu;
