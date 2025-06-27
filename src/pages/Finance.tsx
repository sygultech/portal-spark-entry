
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  CreditCard, 
  FileText, 
  TrendingUp 
} from "lucide-react";
import FeeStructures from "@/components/finance/FeeStructures";
import FeeAssignment from "@/components/finance/FeeAssignment";
import Collections from "@/components/finance/Collections";
import StudentLedger from "@/components/finance/StudentLedger";
import DuesReports from "@/components/finance/DuesReports";

const Finance = () => {
  const [activeTab, setActiveTab] = useState("structures");

  // Mock stats for overview
  const stats = {
    totalCollections: 2450000,
    pendingDues: 125000,
    paidStudents: 847,
    totalStudents: 923
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fees Management</h1>
          <p className="text-muted-foreground">
            Manage fee structures, collections, and financial reports
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Academic Year 2024-25
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collections</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalCollections.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Dues</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingDues.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              -5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidStudents}</div>
            <p className="text-xs text-muted-foreground">
              out of {stats.totalStudents} students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((stats.paidStudents / stats.totalStudents) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              +2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="assignment">Assignment</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="ledger">Student Ledger</TabsTrigger>
          <TabsTrigger value="reports">Dues & Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="structures">
          <FeeStructures />
        </TabsContent>

        <TabsContent value="assignment">
          <FeeAssignment />
        </TabsContent>

        <TabsContent value="collections">
          <Collections />
        </TabsContent>

        <TabsContent value="ledger">
          <StudentLedger />
        </TabsContent>

        <TabsContent value="reports">
          <DuesReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
