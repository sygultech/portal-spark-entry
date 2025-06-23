
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  FileText,
  AlertTriangle
} from 'lucide-react';

const ExpenseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  // Mock data
  const expenseCategories = [
    { id: 1, name: 'Salaries & Benefits', budgeted: 45000, spent: 42000, remaining: 3000 },
    { id: 2, name: 'Infrastructure', budgeted: 15000, spent: 8500, remaining: 6500 },
    { id: 3, name: 'Educational Materials', budgeted: 8000, spent: 6200, remaining: 1800 },
    { id: 4, name: 'Utilities', budgeted: 5000, spent: 4200, remaining: 800 },
    { id: 5, name: 'Marketing', budgeted: 3000, spent: 1500, remaining: 1500 },
  ];

  const expenses = [
    {
      id: 1,
      date: '2024-01-15',
      category: 'Salaries & Benefits',
      description: 'Monthly Salary - Teaching Staff',
      amount: 25000,
      vendor: 'Payroll',
      status: 'approved',
      requestedBy: 'HR Department',
      approvedBy: 'Principal',
      receiptUrl: '/receipt1.pdf'
    },
    {
      id: 2,
      date: '2024-01-14',
      category: 'Infrastructure',
      description: 'Classroom Renovation - Block A',
      amount: 8500,
      vendor: 'ABC Construction',
      status: 'pending',
      requestedBy: 'Facilities Manager',
      approvedBy: null,
      receiptUrl: null
    },
    {
      id: 3,
      date: '2024-01-13',
      category: 'Educational Materials',
      description: 'Science Lab Equipment',
      amount: 3200,
      vendor: 'EduSupplies Inc.',
      status: 'approved',
      requestedBy: 'Science Department',
      approvedBy: 'Academic Head',
      receiptUrl: '/receipt3.pdf'
    },
    {
      id: 4,
      date: '2024-01-12',
      category: 'Utilities',
      description: 'Electricity Bill - December',
      amount: 1800,
      vendor: 'City Electric',
      status: 'rejected',
      requestedBy: 'Admin',
      approvedBy: 'Finance Head',
      receiptUrl: '/receipt4.pdf'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Expense Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$62,400</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,300</div>
            <p className="text-xs text-muted-foreground">8 requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">82%</div>
            <p className="text-xs text-muted-foreground">Of monthly budget</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3</div>
            <p className="text-xs text-muted-foreground">Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Category-wise Budget Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual Spending</CardTitle>
          <CardDescription>Category-wise expense tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{category.name}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <span>Budgeted: ${category.budgeted.toLocaleString()}</span>
                    <span>Spent: ${category.spent.toLocaleString()}</span>
                    <span>Remaining: ${category.remaining.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className={`h-2 rounded-full ${
                        (category.spent / category.budgeted) > 0.9 ? 'bg-red-500' :
                        (category.spent / category.budgeted) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((category.spent / category.budgeted) * 100, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {Math.round((category.spent / category.budgeted) * 100)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Utilized</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense Requests</CardTitle>
              <CardDescription>Manage and track all expense requests</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                      Create a new expense request for approval
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="expenseCategory">Category</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {expenseCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expenseDescription">Description</Label>
                      <Input id="expenseDescription" placeholder="Brief description of expense" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expenseAmount">Amount</Label>
                      <Input id="expenseAmount" type="number" placeholder="0.00" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expenseVendor">Vendor/Supplier</Label>
                      <Input id="expenseVendor" placeholder="Vendor name" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expenseJustification">Justification</Label>
                      <Textarea 
                        id="expenseJustification"
                        placeholder="Explain why this expense is necessary..."
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="expenseReceipt">Receipt/Quote</Label>
                      <Button variant="outline" className="w-full">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload File
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddExpenseOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsAddExpenseOpen(false)}>
                      Submit Request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Expenses Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{expense.date}</TableCell>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
                  </TableCell>
                  <TableCell>{expense.category}</TableCell>
                  <TableCell className="font-medium">${expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>{expense.requestedBy}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(expense.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(expense.status)}
                        {expense.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {expense.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {expense.receiptUrl && (
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
