
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Users, 
  DollarSign,
  Receipt,
  Send,
  FileText,
  CreditCard
} from 'lucide-react';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data
  const feeCategories = [
    { id: 1, name: 'Tuition Fee', description: 'Monthly tuition charges', amount: 5000, status: 'active' },
    { id: 2, name: 'Lab Fee', description: 'Laboratory usage charges', amount: 500, status: 'active' },
    { id: 3, name: 'Transport Fee', description: 'School bus charges', amount: 1500, status: 'active' },
    { id: 4, name: 'Activity Fee', description: 'Extracurricular activities', amount: 300, status: 'active' },
  ];

  const feeStructures = [
    { id: 1, name: 'Grade 1-5 Standard', grade: '1-5', category: 'Regular', frequency: 'Monthly', total: 6800 },
    { id: 2, name: 'Grade 6-8 Standard', grade: '6-8', category: 'Regular', frequency: 'Monthly', total: 7300 },
    { id: 3, name: 'Grade 9-10 Standard', grade: '9-10', category: 'Regular', frequency: 'Monthly', total: 8500 },
    { id: 4, name: 'Grade 11-12 Science', grade: '11-12', category: 'Science', frequency: 'Monthly', total: 9800 },
  ];

  const studentFees = [
    { id: 1, student: 'John Doe', class: '10A', rollNo: '001', totalDue: 25500, paid: 20000, pending: 5500, status: 'partial' },
    { id: 2, student: 'Sarah Smith', class: '9B', rollNo: '002', totalDue: 24600, paid: 24600, pending: 0, status: 'paid' },
    { id: 3, student: 'Mike Johnson', class: '11A', rollNo: '003', totalDue: 29400, paid: 15000, pending: 14400, status: 'overdue' },
    { id: 4, student: 'Emily Davis', class: '8C', rollNo: '004', totalDue: 21900, paid: 21900, pending: 0, status: 'paid' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Management</h2>
          <p className="text-muted-foreground">Manage fee categories, structures, and student payments</p>
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
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Fee Category</DialogTitle>
                <DialogDescription>Create a new fee category for your school</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Category Name</Label>
                  <Input id="category-name" placeholder="e.g., Tuition Fee" />
                </div>
                <div>
                  <Label htmlFor="category-description">Description</Label>
                  <Textarea id="category-description" placeholder="Brief description" />
                </div>
                <div>
                  <Label htmlFor="category-amount">Default Amount</Label>
                  <Input id="category-amount" type="number" placeholder="0" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="category-active" />
                  <Label htmlFor="category-active">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline">Cancel</Button>
                <Button>Save Category</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">Fee Categories</TabsTrigger>
          <TabsTrigger value="structures">Fee Structures</TabsTrigger>
          <TabsTrigger value="students">Student Fees</TabsTrigger>
          <TabsTrigger value="collection">Fee Collection</TabsTrigger>
        </TabsList>

        {/* Fee Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Categories</CardTitle>
              <CardDescription>Manage different types of fees charged by the school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-4">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Default Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeCategories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.description}</TableCell>
                      <TableCell>₹{category.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                          {category.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
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
        </TabsContent>

        {/* Fee Structures Tab */}
        <TabsContent value="structures" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Fee Structures</CardTitle>
              <CardDescription>Define fee structures for different grades and categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search structures..."
                    className="max-w-sm"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      New Structure
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Fee Structure</DialogTitle>
                      <DialogDescription>Define a new fee structure for a grade or category</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="structure-name">Structure Name</Label>
                        <Input id="structure-name" placeholder="e.g., Grade 10 Standard" />
                      </div>
                      <div>
                        <Label htmlFor="structure-grade">Grade/Class</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select grade" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-5">Grade 1-5</SelectItem>
                            <SelectItem value="6-8">Grade 6-8</SelectItem>
                            <SelectItem value="9-10">Grade 9-10</SelectItem>
                            <SelectItem value="11-12">Grade 11-12</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="structure-category">Student Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="regular">Regular</SelectItem>
                            <SelectItem value="scholarship">Scholarship</SelectItem>
                            <SelectItem value="international">International</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="structure-frequency">Payment Frequency</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label>Fee Categories</Label>
                      <div className="space-y-2 mt-2">
                        {feeCategories.map((category) => (
                          <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-2">
                              <input type="checkbox" defaultChecked />
                              <span>{category.name}</span>
                            </div>
                            <Input type="number" defaultValue={category.amount} className="w-24" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button>Create Structure</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Structure Name</TableHead>
                    <TableHead>Grade/Class</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((structure) => (
                    <TableRow key={structure.id}>
                      <TableCell className="font-medium">{structure.name}</TableCell>
                      <TableCell>{structure.grade}</TableCell>
                      <TableCell>{structure.category}</TableCell>
                      <TableCell>{structure.frequency}</TableCell>
                      <TableCell>₹{structure.total.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Users className="h-4 w-4" />
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
        </TabsContent>

        {/* Student Fees Tab */}
        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Fee Management</CardTitle>
              <CardDescription>Track and manage individual student fee payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    className="max-w-sm"
                  />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      <SelectItem value="10A">10A</SelectItem>
                      <SelectItem value="9B">9B</SelectItem>
                      <SelectItem value="11A">11A</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    Send Reminders
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export List
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Total Due</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Pending</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {studentFees.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.student}</TableCell>
                      <TableCell>{student.class}</TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>₹{student.totalDue.toLocaleString()}</TableCell>
                      <TableCell>₹{student.paid.toLocaleString()}</TableCell>
                      <TableCell>₹{student.pending.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={
                          student.status === 'paid' ? 'default' : 
                          student.status === 'partial' ? 'secondary' : 'destructive'
                        }>
                          {student.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Collection Tab */}
        <TabsContent value="collection" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Manual Fee Collection */}
            <Card>
              <CardHeader>
                <CardTitle>Manual Fee Collection</CardTitle>
                <CardDescription>Record offline payments (cash, cheque, bank transfer)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="student-search">Search Student</Label>
                  <Input id="student-search" placeholder="Enter student name or admission number" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" placeholder="0" />
                  </div>
                  <div>
                    <Label htmlFor="payment-mode">Payment Mode</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="cheque">Cheque</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input id="reference" placeholder="Cheque/Transaction number" />
                </div>
                <div>
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea id="remarks" placeholder="Additional notes" />
                </div>
                <Button className="w-full">
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </CardContent>
            </Card>

            {/* Online Payment Integration */}
            <Card>
              <CardHeader>
                <CardTitle>Online Payment Gateway</CardTitle>
                <CardDescription>Configure and manage online payment options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-blue-500" />
                    <div>
                      <div className="font-medium">Razorpay Integration</div>
                      <div className="text-sm text-muted-foreground">Enabled</div>
                    </div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-8 w-8 text-purple-500" />
                    <div>
                      <div className="font-medium">Stripe Integration</div>
                      <div className="text-sm text-muted-foreground">Disabled</div>
                    </div>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Payment Gateway Settings</Label>
                  <Button variant="outline" className="w-full">
                    Configure Gateway
                  </Button>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="font-medium text-sm">Today's Online Collections</div>
                  <div className="text-2xl font-bold text-blue-600">₹12,450</div>
                  <div className="text-sm text-muted-foreground">8 transactions processed</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Collection Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Collection Summary</CardTitle>
              <CardDescription>Today's fee collection breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-medium text-sm text-muted-foreground">Cash</div>
                  <div className="text-2xl font-bold">₹4,200</div>
                  <div className="text-sm text-muted-foreground">12 transactions</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-medium text-sm text-muted-foreground">Online</div>
                  <div className="text-2xl font-bold">₹12,450</div>
                  <div className="text-sm text-muted-foreground">8 transactions</div>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <div className="font-medium text-sm text-muted-foreground">Cheque</div>
                  <div className="text-2xl font-bold">₹8,500</div>
                  <div className="text-sm text-muted-foreground">3 transactions</div>
                </div>
                <div className="p-4 border rounded-lg text-center bg-green-50">
                  <div className="font-medium text-sm text-muted-foreground">Total</div>
                  <div className="text-2xl font-bold text-green-600">₹25,150</div>
                  <div className="text-sm text-muted-foreground">23 transactions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeeManagement;
