
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import staff module components
import StaffDirectory from "@/components/staff/StaffDirectory";
import StaffProfileForm from "@/components/staff/StaffProfileForm";
import RoleDepartmentManagement from "@/components/staff/RoleDepartmentManagement";
import AttendanceTracking from "@/components/staff/AttendanceTracking";
import LeaveManagement from "@/components/staff/LeaveManagement";
import DocumentManagement from "@/components/staff/DocumentManagement";
import ResignationExit from "@/components/staff/ResignationExit";
import LoginAccessManagement from "@/components/staff/LoginAccessManagement";
import PayrollManagement from "@/components/staff/PayrollManagement";

const StaffManagement = () => {
  const { profile, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("directory");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not school_admin
  if (profile?.role !== "school_admin") {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff & HR Management</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/school-admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink>Staff & HR</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 w-full h-auto">
          <TabsTrigger value="directory" className="text-xs md:text-sm py-2 px-3">Directory</TabsTrigger>
          <TabsTrigger value="profile" className="text-xs md:text-sm py-2 px-3">Add Staff</TabsTrigger>
          <TabsTrigger value="roles" className="text-xs md:text-sm py-2 px-3">Roles & Depts</TabsTrigger>
          <TabsTrigger value="attendance" className="text-xs md:text-sm py-2 px-3">Attendance</TabsTrigger>
          <TabsTrigger value="leave" className="text-xs md:text-sm py-2 px-3">Leave</TabsTrigger>
          <TabsTrigger value="payroll" className="text-xs md:text-sm py-2 px-3">Payroll</TabsTrigger>
          <TabsTrigger value="documents" className="text-xs md:text-sm py-2 px-3">Documents</TabsTrigger>
          <TabsTrigger value="performance" className="text-xs md:text-sm py-2 px-3">Performance</TabsTrigger>
          <TabsTrigger value="resignation" className="text-xs md:text-sm py-2 px-3">Resignation</TabsTrigger>
          <TabsTrigger value="access" className="text-xs md:text-sm py-2 px-3">Access</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="directory" className="mt-0">
            <StaffDirectory />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0">
            <StaffProfileForm />
          </TabsContent>
          
          <TabsContent value="roles" className="mt-0">
            <RoleDepartmentManagement />
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-0">
            <AttendanceTracking />
          </TabsContent>
          
          <TabsContent value="leave" className="mt-0">
            <LeaveManagement />
          </TabsContent>
          
          <TabsContent value="payroll" className="mt-0">
            <PayrollManagement />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0">
            <DocumentManagement />
          </TabsContent>
          
          <TabsContent value="performance" className="mt-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium mb-4">Performance & Evaluation</h2>
              <p className="text-muted-foreground">
                Configure staff performance evaluation metrics, conduct appraisals, and track professional development.
              </p>
              <div className="mt-6 grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>The Performance & Evaluation module is currently under development.</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="resignation" className="mt-0">
            <ResignationExit />
          </TabsContent>
          
          <TabsContent value="access" className="mt-0">
            <LoginAccessManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default StaffManagement;
