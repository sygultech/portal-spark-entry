
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  FileText,
  CreditCard,
  Wallet,
  PieChart,
  AlertTriangle,
  Plus,
  Filter,
  Download,
  Eye
} from 'lucide-react';
import FeeCollection from '@/components/finance/FeeCollection';
import ExpenseManagement from '@/components/finance/ExpenseManagement';
import Transactions from '@/components/finance/Transactions';
import BudgetPlanning from '@/components/finance/BudgetPlanning';
import FinancialReports from '@/components/finance/FinancialReports';

const Finance = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview cards
  const financialMetrics = {
    totalRevenue: 125000,
    totalExpenses: 85000,
    pendingFees: 35000,
    cashFlow: 40000,
    studentsPaid: 245,
    totalStudents: 300,
    thisMonthCollection: 45000,
    lastMonthCollection: 42000
  };

  const recentTransactions = [
    { id: 1, type: 'Fee Payment', student: 'John Smith', amount: 1500, date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'Salary Payment', staff: 'Jane Doe', amount: -4500, date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'Equipment Purchase', vendor: 'Tech Supplies', amount: -2300, date: '2024-01-13', status: 'pending' },
    { id: 4, type: 'Fee Payment', student: 'Alice Johnson', amount: 1200, date: '2024-01-12', status: 'completed' },
  ];

  const pendingApprovals = [
    { id: 1, type: 'Equipment Purchase', amount: 15000, requestedBy: 'IT Department', date: '2024-01-10' },
    { id: 2, type: 'Maintenance', amount: 5000, requestedBy: 'Facilities', date: '2024-01-09' },
    { id: 3, type: 'Marketing Campaign', amount: 8000, requestedBy: 'Admin', date: '2024-01-08' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive financial management for your school
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fees">Fee Collection</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budget">Budget & Planning</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Financial Metrics Overview */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12%</span> from last month
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.totalExpenses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-red-600">+5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.pendingFees.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {financialMetrics.totalStudents - financialMetrics.studentsPaid} students pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Cash Flow</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${financialMetrics.cashFlow.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Revenue - Expenses
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Pending Approvals */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.amount > 0 ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium">{transaction.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {'student' in transaction ? transaction.student : 
                             'staff' in transaction ? transaction.staff : transaction.vendor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Transactions
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Expenses awaiting approval</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingApprovals.map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{approval.type}</p>
                        <p className="text-xs text-muted-foreground">
                          Requested by {approval.requestedBy}
                        </p>
                        <p className="text-xs text-muted-foreground">{approval.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${approval.amount.toLocaleString()}</p>
                        <div className="flex gap-1 mt-1">
                          <Button size="sm" variant="outline" className="h-6 px-2">
                            Reject
                          </Button>
                          <Button size="sm" className="h-6 px-2">
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Collection Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Fee Collection Progress</CardTitle>
              <CardDescription>Collection status for current month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {financialMetrics.studentsPaid}
                  </div>
                  <p className="text-sm text-muted-foreground">Students Paid</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {financialMetrics.totalStudents - financialMetrics.studentsPaid}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending Payments</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round((financialMetrics.studentsPaid / financialMetrics.totalStudents) * 100)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Collection Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fees">
          <FeeCollection />
        </TabsContent>

        <TabsContent value="expenses">
          <ExpenseManagement />
        </TabsContent>

        <TabsContent value="transactions">
          <Transactions />
        </TabsContent>

        <TabsContent value="budget">
          <BudgetPlanning />
        </TabsContent>

        <TabsContent value="reports">
          <FinancialReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
