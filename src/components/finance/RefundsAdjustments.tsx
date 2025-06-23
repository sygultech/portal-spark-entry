
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
  CreditCard, 
  ArrowLeftRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  DollarSign,
  User
} from 'lucide-react';

const RefundsAdjustments = () => {
  const [activeTab, setActiveTab] = useState('refunds');

  // Mock data
  const refundRequests = [
    {
      id: 'REF001',
      student: 'John Doe',
      class: '10A',
      amount: 5500,
      reason: 'Transfer to another school',
      requestDate: '2024-01-10',
      status: 'pending',
      approvedBy: null,
      processedDate: null,
      paymentMode: 'Bank Transfer'
    },
    {
      id: 'REF002',
      student: 'Sarah Smith',
      class: '9B',
      amount: 2400,
      reason: 'Duplicate payment',
      requestDate: '2024-01-08',
      status: 'approved',
      approvedBy: 'Admin',
      processedDate: '2024-01-12',
      paymentMode: 'Cash'
    },
    {
      id: 'REF003',
      student: 'Mike Johnson',
      class: '11A',
      amount: 1800,
      reason: 'Fee adjustment',
      requestDate: '2024-01-05',
      status: 'rejected',
      approvedBy: 'Principal',
      processedDate: '2024-01-07',
      paymentMode: null
    }
  ];

  const adjustments = [
    {
      id: 'ADJ001',
      student: 'Emily Davis',
      class: '8C',
      type: 'Credit Adjustment',
      amount: 3200,
      reason: 'Scholarship applied',
      date: '2024-01-15',
      adjustedBy: 'Finance Officer',
      status: 'completed'
    },
    {
      id: 'ADJ002',
      student: 'Robert Wilson',
      class: '12A',
      type: 'Debit Adjustment',
      amount: 800,
      reason: 'Late fee penalty',
      date: '2024-01-12',
      adjustedBy: 'Admin',
      status: 'completed'
    },
    {
      id: 'ADJ003',
      student: 'Lisa Brown',
      class: '7B',
      type: 'Credit Adjustment',
      amount: 1500,
      reason: 'Excess payment transfer',
      date: '2024-01-10',
      adjustedBy: 'Finance Officer',
      status: 'pending'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Refunds & Adjustments</h2>
          <p className="text-muted-foreground">Manage refunds and fee adjustments</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ArrowLeftRight className="h-4 w-4 mr-2" />
                New Adjustment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Fee Adjustment</DialogTitle>
                <DialogDescription>Adjust student fees for various reasons</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adj-student">Search Student</Label>
                  <Input id="adj-student" placeholder="Enter student name or ID" />
                </div>
                <div>
                  <Label htmlFor="adj-type">Adjustment Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Credit Adjustment</SelectItem>
                      <SelectItem value="debit">Debit Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="adj-amount">Amount</Label>
                  <Input id="adj-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="adj-reason">Reason</Label>
                  <Textarea id="adj-reason" placeholder="Reason for adjustment" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Create Adjustment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Process Refund
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Process Refund</DialogTitle>
                <DialogDescription>Issue a refund to a student</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="refund-student">Search Student</Label>
                  <Input id="refund-student" placeholder="Enter student name or ID" />
                </div>
                <div>
                  <Label htmlFor="refund-amount">Refund Amount</Label>
                  <Input id="refund-amount" type="number" placeholder="0" />
                </div>
                <div>
                  <Label htmlFor="refund-mode">Payment Mode</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="refund-reason">Reason for Refund</Label>
                  <Textarea id="refund-reason" placeholder="Reason for refund" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Process Refund</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Refunds</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Refunded</p>
                <p className="text-2xl font-bold">₹45,200</p>
              </div>
              <CreditCard className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Adjustments Made</p>
                <p className="text-2xl font-bold">15</p>
              </div>
              <ArrowLeftRight className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Processing Time</p>
                <p className="text-2xl font-bold">3 days</p>
              </div>
              <FileText className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">For approvals</p>
          </CardContent>
        </Card>
      </div>

      {/* Refund Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Requests</CardTitle>
          <CardDescription>Manage student refund requests and approvals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search refund requests..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refundRequests.map((refund) => (
                <TableRow key={refund.id}>
                  <TableCell className="font-mono">{refund.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{refund.student}</div>
                      <div className="text-sm text-muted-foreground">{refund.class}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-bold">₹{refund.amount.toLocaleString()}</TableCell>
                  <TableCell>{refund.reason}</TableCell>
                  <TableCell>{new Date(refund.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(refund.status)}
                      <Badge variant={getStatusColor(refund.status)}>
                        {refund.status}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>{refund.approvedBy || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {refund.status === 'pending' && (
                        <>
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fee Adjustments */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Adjustments</CardTitle>
          <CardDescription>Track all fee adjustments and account modifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search adjustments..." className="max-w-sm" />
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
                <SelectItem value="debit">Debit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Adjustment ID</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Adjusted By</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adjustments.map((adjustment) => (
                <TableRow key={adjustment.id}>
                  <TableCell className="font-mono">{adjustment.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{adjustment.student}</div>
                      <div className="text-sm text-muted-foreground">{adjustment.class}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={adjustment.type === 'Credit Adjustment' ? 'default' : 'secondary'}>
                      {adjustment.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`font-bold ${
                    adjustment.type === 'Credit Adjustment' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {adjustment.type === 'Credit Adjustment' ? '+' : '-'}₹{adjustment.amount.toLocaleString()}
                  </TableCell>
                  <TableCell>{adjustment.reason}</TableCell>
                  <TableCell>{new Date(adjustment.date).toLocaleDateString()}</TableCell>
                  <TableCell>{adjustment.adjustedBy}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(adjustment.status)}>
                      {adjustment.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Refund Processing Workflow */}
      <Card>
        <CardHeader>
          <CardTitle>Refund Processing Workflow</CardTitle>
          <CardDescription>Standard process for handling refund requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div className="font-medium">Request Submitted</div>
              <div className="text-sm text-muted-foreground">Student or parent submits refund request</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FileText className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="font-medium">Review & Verification</div>
              <div className="text-sm text-muted-foreground">Finance team reviews the request</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="font-medium">Approval</div>
              <div className="text-sm text-muted-foreground">Admin or principal approves</div>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="font-medium">Payment Processed</div>
              <div className="text-sm text-muted-foreground">Refund issued to student</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RefundsAdjustments;
