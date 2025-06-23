
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
  Filter,
  Download,
  Plus,
  Eye,
  CreditCard,
  DollarSign,
  Calendar,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send
} from 'lucide-react';

const FeeCollection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Mock data
  const feeStructure = [
    { id: 1, category: 'Tuition Fee', amount: 1500, frequency: 'Monthly', dueDate: '1st of every month' },
    { id: 2, category: 'Laboratory Fee', amount: 200, frequency: 'Quarterly', dueDate: 'Every 3 months' },
    { id: 3, category: 'Library Fee', amount: 100, frequency: 'Annual', dueDate: 'Once per year' },
    { id: 4, category: 'Transport Fee', amount: 300, frequency: 'Monthly', dueDate: '1st of every month' },
  ];

  const students = [
    {
      id: 1,
      admissionNo: 'STU001',
      name: 'John Smith',
      batch: 'Grade 10-A',
      totalDue: 3200,
      paidAmount: 1500,
      pendingAmount: 1700,
      lastPayment: '2024-01-15',
      status: 'partial',
      phone: '+1234567890',
      email: 'john.smith@email.com'
    },
    {
      id: 2,
      admissionNo: 'STU002',
      name: 'Alice Johnson',
      batch: 'Grade 10-B',
      totalDue: 3200,
      paidAmount: 3200,
      pendingAmount: 0,
      lastPayment: '2024-01-10',
      status: 'paid',
      phone: '+1234567891',
      email: 'alice.johnson@email.com'
    },
    {
      id: 3,
      admissionNo: 'STU003',
      name: 'Bob Wilson',
      batch: 'Grade 9-A',
      totalDue: 3200,
      paidAmount: 0,
      pendingAmount: 3200,
      lastPayment: null,
      status: 'pending',
      phone: '+1234567892',
      email: 'bob.wilson@email.com'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesBatch = batchFilter === 'all' || student.batch === batchFilter;
    
    return matchesSearch && matchesStatus && matchesBatch;
  });

  return (
    <div className="space-y-6">
      {/* Fee Collection Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collection</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,320</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$15,670</div>
            <p className="text-xs text-muted-foreground">45 students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8,450</div>
            <p className="text-xs text-muted-foreground">23 students</p>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structure */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structure</CardTitle>
          <CardDescription>Current academic year fee categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {feeStructure.map((fee) => (
              <div key={fee.id} className="p-4 border rounded-lg">
                <h4 className="font-medium">{fee.category}</h4>
                <p className="text-2xl font-bold mt-1">${fee.amount}</p>
                <p className="text-sm text-muted-foreground">{fee.frequency}</p>
                <p className="text-xs text-muted-foreground mt-1">Due: {fee.dueDate}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Collection Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Student Fee Status</CardTitle>
              <CardDescription>Manage individual student fee collections</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Fee Reminders</DialogTitle>
                    <DialogDescription>
                      Send payment reminders to students with pending fees
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="reminderType">Reminder Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reminder type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="both">Email & SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="message">Custom Message</Label>
                      <Textarea 
                        id="message"
                        placeholder="Enter custom reminder message..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Send Reminders</Button>
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
                placeholder="Search by name or admission number..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={batchFilter} onValueChange={setBatchFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Batch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Batches</SelectItem>
                <SelectItem value="Grade 10-A">Grade 10-A</SelectItem>
                <SelectItem value="Grade 10-B">Grade 10-B</SelectItem>
                <SelectItem value="Grade 9-A">Grade 9-A</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Students Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Total Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Pending</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-muted-foreground">{student.admissionNo}</div>
                    </div>
                  </TableCell>
                  <TableCell>{student.batch}</TableCell>
                  <TableCell>${student.totalDue.toLocaleString()}</TableCell>
                  <TableCell className="text-green-600">${student.paidAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-red-600">${student.pendingAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(student.status)}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{student.lastPayment || 'No payment'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <CreditCard className="h-4 w-4" />
                      </Button>
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

export default FeeCollection;
