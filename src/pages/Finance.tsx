
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Receipt, 
  Calculator,
  FileText,
  CreditCard,
  Building,
  AlertTriangle,
  PieChart,
  BarChart3,
  Settings
} from 'lucide-react';
import FinanceDashboard from '@/components/finance/FinanceDashboard';
import FeeManagement from '@/components/finance/FeeManagement';
import ExpenseManagement from '@/components/finance/ExpenseManagement';
import TransactionRegister from '@/components/finance/TransactionRegister';
import BudgetingForecasting from '@/components/finance/BudgetingForecasting';
import ReportsAnalytics from '@/components/finance/ReportsAnalytics';
import RefundsAdjustments from '@/components/finance/RefundsAdjustments';
import AuditingCompliance from '@/components/finance/AuditingCompliance';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive financial management for your school
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
          <TabsTrigger value="dashboard" className="text-xs">
            <BarChart3 className="h-4 w-4 mr-1" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="fees" className="text-xs">
            <DollarSign className="h-4 w-4 mr-1" />
            Fee Management
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs">
            <TrendingDown className="h-4 w-4 mr-1" />
            Expenses
          </TabsTrigger>
          <TabsTrigger value="transactions" className="text-xs">
            <Receipt className="h-4 w-4 mr-1" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="budget" className="text-xs">
            <Calculator className="h-4 w-4 mr-1" />
            Budget
          </TabsTrigger>
          <TabsTrigger value="refunds" className="text-xs">
            <CreditCard className="h-4 w-4 mr-1" />
            Refunds
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs">
            <Building className="h-4 w-4 mr-1" />
            Audit
          </TabsTrigger>
          <TabsTrigger value="reports" className="text-xs">
            <PieChart className="h-4 w-4 mr-1" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <FinanceDashboard />
        </TabsContent>

        <TabsContent value="fees" className="space-y-6">
          <FeeManagement />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <ExpenseManagement />
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <TransactionRegister />
        </TabsContent>

        <TabsContent value="budget" className="space-y-6">
          <BudgetingForecasting />
        </TabsContent>

        <TabsContent value="refunds" className="space-y-6">
          <RefundsAdjustments />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditingCompliance />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <ReportsAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
