
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, Filter, FileText, TrendingUp } from "lucide-react";
import { DuesSummary } from "@/types/finance";

const DuesReports = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Mock data
  const duesData: DuesSummary[] = [
    {
      studentId: "student1",
      studentName: "John Doe",
      admissionNumber: "2024001",
      batchName: "Grade 1A",
      totalFees: 18500,
      paidAmount: 15000,
      balance: 3500,
      lastPaymentDate: "2024-03-20",
      status: "partial",
      daysPastDue: 5
    },
    {
      studentId: "student2",
      studentName: "Jane Smith",
      admissionNumber: "2024002",
      batchName: "Grade 1A",
      totalFees: 18500,
      paidAmount: 18500,
      balance: 0,
      lastPaymentDate: "2024-03-15",
      status: "paid"
    },
    {
      studentId: "student3",
      studentName: "Mike Johnson",
      admissionNumber: "2024003",
      batchName: "Grade 2B",
      totalFees: 18500,
      paidAmount: 0,
      balance: 18500,
      lastPaymentDate: undefined,
      status: "overdue",
      daysPastDue: 15
    },
    {
      studentId: "student4",
      studentName: "Sarah Wilson",
      admissionNumber: "2024004",
      batchName: "Grade 2B",
      totalFees: 18500,
      paidAmount: 9250,
      balance: 9250,
      lastPaymentDate: "2024-03-10",
      status: "partial",
      daysPastDue: 10
    },
    {
      studentId: "student5",
      studentName: "David Brown",
      admissionNumber: "2024005",
      batchName: "Grade 6A",
      totalFees: 25500,
      paidAmount: 25500,
      balance: 0,
      lastPaymentDate: "2024-03-18",
      status: "paid"
    }
  ];

  const batches = ["Grade 1A", "Grade 2B", "Grade 6A", "Grade 7B"];

  const filteredData = duesData.filter(record => {
    const matchesSearch = 
      record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.admissionNumber.includes(searchTerm) ||
      record.batchName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBatch = batchFilter === "all" || record.batchName === batchFilter;
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesBatch && matchesStatus;
  });

  const getStatusBadge = (status: DuesSummary['status']) => {
    const variants = {
      paid: "success",
      partial: "secondary",
      overdue: "destructive"
    };
    
    const labels = {
      paid: "Paid",
      partial: "Partial",
      overdue: "Overdue"
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  // Calculate summary statistics
  const totalStudents = filteredData.length;
  const paidStudents = filteredData.filter(d => d.status === 'paid').length;
  const partialPayments = filteredData.filter(d => d.status === 'partial').length;
  const overdueStudents = filteredData.filter(d => d.status === 'overdue').length;
  const totalCollected = filteredData.reduce((sum, d) => sum + d.paidAmount, 0);
  const totalOutstanding = filteredData.reduce((sum, d) => sum + d.balance, 0);

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    console.log(`Exporting dues report in ${format} format`);
    // Implementation would go here
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{paidStudents}</p>
                <p className="text-xs text-muted-foreground">Fully Paid</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{partialPayments}</p>
                <p className="text-xs text-muted-foreground">Partial Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div>
                <p className="text-2xl font-bold">{overdueStudents}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Collections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ₹{totalCollected.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Collection Rate: {totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Outstanding Dues</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">
              ₹{totalOutstanding.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {overdueStudents + partialPayments} students with pending dues
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Dues Summary Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dues Summary</CardTitle>
              <p className="text-sm text-muted-foreground">
                Track pending dues and payment status by student
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleExport('pdf')}>
                <FileText className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 flex-1 min-w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map(batch => (
                    <SelectItem key={batch} value={batch}>{batch}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Admission No.</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Total Fees</TableHead>
                <TableHead>Paid Amount</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>Days Past Due</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow key={record.studentId}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>{record.admissionNumber}</TableCell>
                  <TableCell>{record.batchName}</TableCell>
                  <TableCell>₹{record.totalFees.toLocaleString()}</TableCell>
                  <TableCell>₹{record.paidAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={record.balance > 0 ? "text-red-600 font-medium" : "text-green-600"}>
                      ₹{record.balance.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {record.lastPaymentDate 
                      ? new Date(record.lastPaymentDate).toLocaleDateString() 
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    {record.daysPastDue ? (
                      <span className="text-red-600 font-medium">
                        {record.daysPastDue} days
                      </span>
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuesReports;
