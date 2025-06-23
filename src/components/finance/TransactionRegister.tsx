
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  CreditCard,
  Banknote,
  Building
} from 'lucide-react';
import { format } from 'date-fns';

const TransactionRegister = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Mock transaction data
  const transactions = [
    {
      id: 'TXN001',
      date: '2024-01-15',
      time: '14:30',
      type: 'income',
      category: 'Fee Collection',
      description: 'John Doe - Monthly Fee Payment',
      amount: 5500,
      paymentMode: 'Online',
      referenceNo: 'RZP_12345',
      status: 'completed',
      student: 'John Doe',
      class: '10A'
    },
    {
      id: 'TXN002',
      date: '2024-01-15',
      time: '11:15',
      type: 'expense',
      category: 'Salary',
      description: 'Monthly Teacher Salary - January',
      amount: 45000,
      paymentMode: 'Bank Transfer',
      referenceNo: 'NEFT_98765',
      status: 'completed',
      vendor: 'Staff Payroll'
    },
    {
      id: 'TXN003',
      date: '2024-01-14',
      time: '16:45',
      type: 'income',
      category: 'Fee Collection',
      description: 'Sarah Smith - Lab Fee Payment',
      amount: 1200,
      paymentMode: 'Cash',
      referenceNo: 'CASH_001',
      status: 'completed',
      student: 'Sarah Smith',
      class: '9B'
    },
    {
      id: 'TXN004',
      date: '2024-01-14',
      time: '10:20',
      type: 'expense',
      category: 'Utilities',
      description: 'Electricity Bill Payment',
      amount: 8500,
      paymentMode: 'Online',
      referenceNo: 'BILL_789',
      status: 'pending',
      vendor: 'State Electricity Board'
    },
    {
      id: 'TXN005',
      date: '2024-01-13',
      time: '13:30',
      type: 'income',
      category: 'Fee Collection',
      description: 'Mike Johnson - Transport Fee',
      amount: 2500,
      paymentMode: 'Cheque',
      referenceNo: 'CHQ_456',
      status: 'completed',
      student: 'Mike Johnson',
      class: '11A'
    },
    {
      id: 'TXN006',
      date: '2024-01-13',
      time: '09:45',
      type: 'expense',
      category: 'Supplies',
      description: 'Office Stationery Purchase',
      amount: 2400,
      paymentMode: 'Cash',
      referenceNo: 'CASH_002',
      status: 'completed',
      vendor: 'Office Mart'
    }
  ];

  const getTransactionIcon = (type: string, paymentMode: string) => {
    if (type === 'income') {
      switch (paymentMode.toLowerCase()) {
        case 'cash': return <Banknote className="h-4 w-4 text-green-600" />;
        case 'online': return <CreditCard className="h-4 w-4 text-blue-600" />;
        case 'cheque': return <Receipt className="h-4 w-4 text-purple-600" />;
        default: return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      }
    } else {
      return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    return type === 'income' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  // Calculate summary statistics
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transaction Register</h2>
          <p className="text-muted-foreground">Complete ledger of all financial transactions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-2" />
            Print Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Income</p>
                <p className="text-2xl font-bold text-green-600">₹{totalIncome.toLocaleString()}</p>
              </div>
              <ArrowUpRight className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">₹{totalExpense.toLocaleString()}</p>
              </div>
              <ArrowDownRight className="h-8 w-8 text-red-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{netFlow.toLocaleString()}
                </p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Current balance</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{transactions.length}</p>
              </div>
              <Receipt className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This period</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Transactions</CardTitle>
          <CardDescription>Search and filter transactions by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Transaction Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="income">Income</SelectItem>
                <SelectItem value="expense">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Modes</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateFrom ? format(dateFrom, 'MMM dd') : 'From Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={setDateFrom}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-40">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {dateTo ? format(dateTo, 'MMM dd') : 'To Date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={setDateTo}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Detailed view of all transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{new Date(transaction.date).toLocaleDateString()}</div>
                      <div className="text-xs text-muted-foreground">{transaction.time}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.id}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getTransactionIcon(transaction.type, transaction.paymentMode)}
                      <span className="capitalize">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{transaction.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      {transaction.student && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.student} - {transaction.class}
                        </div>
                      )}
                      {transaction.vendor && (
                        <div className="text-xs text-muted-foreground">
                          {transaction.vendor}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-bold ${getAmountColor(transaction.type)}`}>
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{transaction.paymentMode}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{transaction.referenceNo}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Summary by Category */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Income by Category</CardTitle>
            <CardDescription>Breakdown of income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Fee Collection</span>
                </div>
                <span className="font-bold text-green-600">₹{totalIncome.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Breakdown of expense categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Salary', amount: 45000, color: 'bg-blue-500' },
                { name: 'Utilities', amount: 8500, color: 'bg-yellow-500' },
                { name: 'Supplies', amount: 2400, color: 'bg-purple-500' },
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 ${category.color} rounded-full`}></div>
                    <span>{category.name}</span>
                  </div>
                  <span className="font-bold text-red-600">₹{category.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionRegister;
