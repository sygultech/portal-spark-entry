
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Paperclip,
  Calendar,
  TrendingDown,
  Building,
  Zap,
  Car,
  Wrench,
  ShoppingCart,
  Users
} from 'lucide-react';

const ExpenseManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const expenseCategories = [
    { id: 1, name: 'Salaries', icon: Users, color: 'bg-blue-100 text-blue-600', count: 45 },
    { id: 2, name: 'Utilities', icon: Zap, color: 'bg-yellow-100 text-yellow-600', count: 12 },
    { id: 3, name: 'Maintenance', icon: Wrench, color: 'bg-green-100 text-green-600', count: 8 },
    { id: 4, name: 'Supplies', icon: ShoppingCart, color: 'bg-purple-100 text-purple-600', count: 23 },
    { id: 5, name: 'Transport', icon: Car, color: 'bg-red-100 text-red-600', count: 6 },
    { id: 6, name: 'Infrastructure', icon: Building, color: 'bg-gray-100 text-gray-600', count: 4 },
  ];

  const expenses = [
    { 
      id: 1, 
      date: '2024-01-15', 
      category: 'Salaries', 
      description: 'Monthly teacher salaries', 
      amount: 125000, 
      department: 'Academic', 
      status: 'approved',
      paymentMode: 'Bank Transfer',
      vendor: 'Staff Payroll',
      receipt: true
    },
    { 
      id: 2, 
      date: '2024-01-14', 
      category: 'Utilities', 
      description: 'Electricity bill - January', 
      amount: 8500, 
      department: 'Administration', 
      status: 'pending',
      paymentMode: 'Online',
      vendor: 'State Electricity Board',
      receipt: true
    },
    { 
      id: 3, 
      date: '2024-01-13', 
      category: 'Supplies', 
      description: 'Stationery for office', 
      amount: 2400, 
      department: 'Administration', 
      status: 'approved',
      paymentMode: 'Cash',
      vendor: 'Office Mart',
      receipt: false
    },
    { 
      id: 4, 
      date: '2024-01-12', 
      category: 'Maintenance', 
      description: 'AC repair in classroom', 
      amount: 3200, 
      department: 'Facilities', 
      status: 'rejected',
      paymentMode: 'Cheque',
      vendor: 'Cool Air Services',
      receipt: true
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
          <p className="text-muted-foreground">Track and manage all school expenses</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>Record a new expense for the school</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expense-date">Date</Label>
                  <Input id="expense-date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label htmlFor="expense-category">Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name.toLowerCase()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expense-description">Description</Label>
                  <Input id="expense-description" placeholder="Brief description of the expense" />
                </div>
                <div>
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input id="expense-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="expense-department">Department</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="administration">Administration</SelectItem>
                      <SelectItem value="facilities">Facilities</SelectItem>
                      <SelectItem value="transport">Transport</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expense-vendor">Vendor/Supplier</Label>
                  <Input id="expense-vendor" placeholder="Vendor name" />
                </div>
                <div>
                  <Label htmlFor="expense-payment">Payment Mode</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="online">Online Payment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expense-notes">Additional Notes</Label>
                  <Textarea id="expense-notes" placeholder="Any additional information" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="expense-receipt">Attach Receipt/Bill</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Paperclip className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Add Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Expense Categories Overview */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        {expenseCategories.map((category) => (
          <Card key={category.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs text-muted-foreground">{category.count} expenses</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Expense Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="text-2xl font-bold">₹1,83,400</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-600 mt-1">↓ 8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-orange-600 mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Largest Category</p>
                <p className="text-xl font-bold">Salaries</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">₹1,25,000 (68%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg per Day</p>
                <p className="text-2xl font-bold">₹6,113</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-purple-600 mt-1">Based on 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
          <CardDescription>All expenses recorded in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {expenseCategories.map((category) => (
                  <SelectItem key={category.id} value={category.name.toLowerCase()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>₹{expense.amount.toLocaleString()}</TableCell>
                  <TableCell>{expense.department}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(expense.status)}>
                      {expense.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {expense.receipt ? (
                      <Paperclip className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="text-red-500 text-xs">Missing</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reimbursements Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Reimbursements</CardTitle>
          <CardDescription>Staff expense reimbursements awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { staff: 'John Smith', amount: 2500, category: 'Travel', date: '2024-01-10', description: 'Conference travel expenses' },
              { staff: 'Sarah Johnson', amount: 800, category: 'Supplies', date: '2024-01-12', description: 'Teaching materials purchased' },
              { staff: 'Mike Davis', amount: 1200, category: 'Training', date: '2024-01-14', description: 'Professional development course' },
            ].map((reimbursement, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{reimbursement.staff}</div>
                  <div className="text-sm text-muted-foreground">{reimbursement.description}</div>
                  <div className="text-xs text-muted-foreground">{reimbursement.category} • {reimbursement.date}</div>
                </div>
                <div className="text-right mr-4">
                  <div className="font-bold">₹{reimbursement.amount.toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Reject</Button>
                  <Button size="sm">Approve</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
