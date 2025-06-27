
import React, { useState, useEffect } from "react";
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
import { Search, Download, FileText, User, Loader2, ArrowLeft } from "lucide-react";
import { StudentFinancialRecord, StudentTransaction } from "@/types/finance";
import { studentLedgerService } from "@/services/studentLedgerService";
import { useAuth } from "@/hooks/useAuth";

const StudentLedger = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentFinancialRecord | null>(null);
  const [students, setStudents] = useState<StudentFinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const { profile } = useAuth();

  useEffect(() => {
    loadStudentFinancialRecords();
  }, [profile?.school_id]);

  const loadStudentFinancialRecords = async () => {
    if (!profile?.school_id) {
      console.log('No school_id in profile');
      setLoading(false);
      return;
    }

    console.log('Loading student financial records for school:', profile.school_id);
    setLoading(true);
    try {
      const records = await studentLedgerService.getStudentFinancialRecords(profile.school_id);
      console.log('Loaded student records:', records);
      setStudents(records);
    } catch (error) {
      console.error('Error loading student records:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNumber.includes(searchTerm) ||
    student.batchName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectStudent = async (student: StudentFinancialRecord) => {
    setLoadingDetails(true);
    try {
      console.log('Loading detailed record for student:', student.studentId);
      const detailedRecord = await studentLedgerService.getStudentFinancialRecord(student.studentId);
      if (detailedRecord) {
        setSelectedStudent(detailedRecord);
      } else {
        console.error('Failed to load detailed record');
        setSelectedStudent(student); // Fallback to basic record
      }
    } catch (error) {
      console.error('Error loading student details:', error);
      setSelectedStudent(student); // Fallback to basic record
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusBadge = (balance: number) => {
    if (balance === 0) {
      return <Badge variant="success">Paid</Badge>;
    } else if (balance > 0) {
      return <Badge variant="destructive">Due</Badge>;
    }
    return <Badge variant="secondary">N/A</Badge>;
  };

  const handleDownloadStatement = async (student: StudentFinancialRecord) => {
    try {
      console.log("Downloading statement for:", student.studentName);
      const pdfBlob = await studentLedgerService.generateStatementPDF(student.studentId);
      if (pdfBlob) {
        // Create download link
        const url = window.URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${student.studentName}_Statement.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert('PDF generation is not available yet');
      }
    } catch (error) {
      console.error('Error downloading statement:', error);
      alert('Failed to download statement');
    }
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
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No students found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStudents.map((student) => (
                  <Card 
                    key={student.studentId} 
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => handleSelectStudent(student)}
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
            )}
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
              disabled={loadingDetails}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
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
              {loadingDetails ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading transaction history...</span>
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StudentLedger;
