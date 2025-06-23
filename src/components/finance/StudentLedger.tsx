
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Download, FileText, User } from "lucide-react";
import { StudentFinancialRecord, StudentTransaction } from "@/types/finance";

const StudentLedger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentFinancialRecord | null>(null);

  // Mock students data
  const students = [
    {
      studentId: "student1",
      studentName: "John Doe",
      admissionNumber: "2024001",
      batchName: "Grade 1A",
      appliedStructures: ["Grade 1-5 Fee Structure"],
      totalFees: 18500,
      paidAmount: 15000,
      balance: 3500,
      lastPaymentDate: "2024-03-20",
      transactions: [
        {
          id: "1",
          date: "2024-03-01",
          description: "Fee Structure Assignment - Grade 1-5",
          debit: 18500,
          credit: 0,
          balance: 18500,
          paymentMode: "",
          receiptNumber: ""
        },
        {
          id: "2",
          date: "2024-03-15",
          description: "Payment - Tuition Fee (Partial)",
          debit: 0,
          credit: 10000,
          balance: 8500,
          paymentMode: "UPI",
          receiptNumber: "RCP001"
        },
        {
          id: "3",
          date: "2024-03-20",
          description: "Payment - Library Fee",
          debit: 0,
          credit: 5000,
          balance: 3500,
          paymentMode: "Bank Transfer",
          receiptNumber: "RCP002"
        }
      ]
    },
    {
      studentId: "student2",
      studentName: "Jane Smith",
      admissionNumber: "2024002",
      batchName: "Grade 1A",
      appliedStructures: ["Grade 1-5 Fee Structure"],
      totalFees: 18500,
      paidAmount: 18500,
      balance: 0,
      lastPaymentDate: "2024-03-15",
      transactions: [
        {
          id: "4",
          date: "2024-03-01",
          description: "Fee Structure Assignment - Grade 1-5",
          debit: 18500,
          credit: 0,
          balance: 18500,
          paymentMode: "",
          receiptNumber: ""
        },
        {
          id: "5",
          date: "2024-03-15",
          description: "Payment - Full Fee Payment",
          debit: 0,
          credit: 18500,
          balance: 0,
          paymentMode: "Bank Transfer",
          receiptNumber: "RCP003"
        }
      ]
    },
    {
      studentId: "student3",
      studentName: "Mike Johnson",
      admissionNumber: "2024003",
      batchName: "Grade 2B",
      appliedStructures: ["Grade 1-5 Fee Structure"],
      totalFees: 18500,
      paidAmount: 0,
      balance: 18500,
      lastPaymentDate: undefined,
      transactions: [
        {
          id: "6",
          date: "2024-03-01",
          description: "Fee Structure Assignment - Grade 1-5",
          debit: 18500,
          credit: 0,
          balance: 18500,
          paymentMode: "",
          receiptNumber: ""
        }
      ]
    }
  ];

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.includes(searchTerm) ||
    student.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge variant="success">Paid</Badge>;
    } else if (balance > 0) {
      return <Badge variant="destructive">Due</Badge>;
    }
    return <Badge variant="secondary">N/A</Badge>;
  };

  const handleDownloadStatement = (student: StudentFinancialRecord) => {
    // This would typically generate and download a PDF statement
    console.log("Downloading statement for:", student.studentName);
  };

  return (
    <div className="space-y-6">
      {!selectedStudent ? (
        // Student Selection View
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Ledger</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View detailed financial transactions for individual students
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name, admission number, or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>

            {/* Students List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.map((student) => (
                <Card 
                  key={student.studentId} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedStudent(student)}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {student.studentName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{student.studentName}</h3>
                        <p className="text-sm text-muted-foreground">{student.admissionNumber}</p>
                        <p className="text-sm text-muted-foreground">{student.batchName}</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Fees:</span>
                        <span className="font-medium">₹{student.totalFees.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Paid:</span>
                        <span className="font-medium">₹{student.paidAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Balance:</span>
                        <span className="font-medium">₹{student.balance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status:</span>
                        {getStatusBadge(student.balance)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        // Student Ledger Detail View
        <div className="space-y-6">
          {/* Back Button and Student Info */}
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedStudent(null)}
            >
              ← Back to Students
            </Button>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                onClick={() => handleDownloadStatement(selectedStudent)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Print Statement
              </Button>
            </div>
          </div>

          {/* Student Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Student Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg">
                      {selectedStudent.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedStudent.studentName}</h3>
                    <p className="text-muted-foreground">{selectedStudent.admissionNumber}</p>
                    <p className="text-muted-foreground">{selectedStudent.batchName}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-2xl">₹{selectedStudent.totalFees.toLocaleString()}</h4>
                  <p className="text-sm text-muted-foreground">Total Fees</p>
                </div>

                <div>
                  <h4 className="font-semibold text-2xl">₹{selectedStudent.paidAmount.toLocaleString()}</h4>
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                </div>

                <div>
                  <h4 className="font-semibold text-2xl">₹{selectedStudent.balance.toLocaleString()}</h4>
                  <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Applied Fee Structures</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedStudent.appliedStructures.map((structure, index) => (
                    <Badge key={index} variant="outline">
                      {structure}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Debit (₹)</TableHead>
                    <TableHead>Credit (₹)</TableHead>
                    <TableHead>Balance (₹)</TableHead>
                    <TableHead>Payment Mode</TableHead>
                    <TableHead>Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedStudent.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>
                        {transaction.debit > 0 && (
                          <span className="text-red-600">
                            {transaction.debit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.credit > 0 && (
                          <span className="text-green-600">
                            {transaction.credit.toLocaleString()}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {transaction.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>{transaction.paymentMode || '-'}</TableCell>
                      <TableCell>
                        {transaction.receiptNumber ? (
                          <Button variant="ghost" size="sm">
                            {transaction.receiptNumber}
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentLedger;
