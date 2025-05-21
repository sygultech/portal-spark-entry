
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar from "./AppSidebar";

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { profile } = useAuth();
  
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default Layout;
