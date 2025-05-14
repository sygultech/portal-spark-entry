
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const { profile } = useAuth();
  
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6">
        <div className="container mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
