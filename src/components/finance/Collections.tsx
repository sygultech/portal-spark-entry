
import React, { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Filter, Download } from "lucide-react";
import { PaymentRecord } from "@/types/finance";
import StudentPaymentDashboard from "./StudentPaymentDashboard";
import { useAuth } from "@/hooks/useAuth";
import { EnhancedPaymentService } from "@/services/enhancedPaymentService";

const Collections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);
  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  const paymentService = new EnhancedPaymentService();

  useEffect(() => {
    loadPaymentCollections();
  }, [profile?.school_id]);

  const loadPaymentCollections = async () => {
    console.log('Profile:', profile);
    if (!profile?.school_id) {
      console.log('No school_id in profile, not loading collections');
      setLoading(false);
      return;
    }
    
    console.log('Loading collections for school:', profile.school_id);
    setLoading(true);
    try {
      const collections = await paymentService.getPaymentCollections(profile.school_id);
      console.log('Collections result:', collections);
      
      // Transform the data to match PaymentRecord interface
      const records: PaymentRecord[] = collections.map(collection => ({
        id: collection.id,
        studentId: collection.studentId,
        studentName: collection.studentName,
        admissionNumber: collection.admissionNumber,
        batchName: collection.batchName,
        structureId: collection.structureId,
        structureName: collection.structureName,
        amountDue: collection.amountDue,
        amountPaid: collection.amountPaid,
        paymentDate: collection.lastPaymentDate || "",
        paymentMode: (collection.lastPaymentMode as any) || "cash",
        receiptNumber: collection.lastReceiptNumber || "",
        status: collection.status
      }));
      
      setPaymentRecords(records);
    } catch (error) {
      console.error('Error loading payment collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = paymentRecords.filter(record => {
    const matchesSearch = 
      record.studentName?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
      record.admissionNumber?.includes(searchTerm) ||
      record.batchName?.toLowerCase()?.includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handlePaymentRecord = (paymentData: Partial<PaymentRecord>) => {
    // Refresh the data after payment is recorded
    loadPaymentCollections();
    setIsPaymentModalOpen(false);
    setSelectedRecord(null);
  };

  const getPaymentStatus = (paid: number, due: number): PaymentRecord['status'] => {
    if (paid === 0) return 'overdue';
    if (paid >= due) return 'paid';
    return 'partial';
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    const variants = {
      paid: "success",
      partial: "secondary",
      due: "outline",
      overdue: "destructive"
    };
    
    const labels = {
      paid: "Paid",
      partial: "Partial",
      due: "Due",
      overdue: "Overdue"
    };

    return (
      <Badge variant={variants[status] as any}>
        {labels[status]}
      </Badge>
    );
  };

  const getPaymentModeLabel = (mode: PaymentRecord['paymentMode']) => {
    const labels = {
      cash: "Cash",
      upi: "UPI",
      card: "Card",
      bank_transfer: "Bank Transfer"
    };
    return labels[mode];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Collections</CardTitle>
            <p className="text-sm text-muted-foreground">
              Record and track student fee payments
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {selectedRecord ? "Update Payment" : "Record New Payment"}
                  </DialogTitle>
                  <DialogDescription>
                    {selectedRecord 
                      ? "Update the payment information for the selected student's fee record." 
                      : "Select a student and enter payment details to record a new fee payment."}
                  </DialogDescription>
                </DialogHeader>
                <StudentPaymentDashboard
                  studentId={selectedRecord?.studentId}
                  onPaymentComplete={(result) => {
                    handlePaymentRecord(result);
                    setIsPaymentModalOpen(false);
                    setSelectedRecord(null);
                  }}
                  onCancel={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedRecord(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 flex-1">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student name, admission number, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="due">Due</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRecords.filter(r => r.status === 'paid').length}
              </div>
              <p className="text-xs text-muted-foreground">Fully Paid</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRecords.filter(r => r.status === 'partial').length}
              </div>
              <p className="text-xs text-muted-foreground">Partial Payments</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredRecords.filter(r => r.status === 'overdue').length}
              </div>
              <p className="text-xs text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                ₹{filteredRecords.reduce((sum, r) => sum + r.amountPaid, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Fee Structure</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  Loading payment records...
                </TableCell>
              </TableRow>
            ) : filteredRecords.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-4">
                  No payment records found
                </TableCell>
              </TableRow>
            ) : (
              filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.studentName}</p>
                      <p className="text-sm text-muted-foreground">{record.admissionNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>{record.batchName}</TableCell>
                  <TableCell>{record.structureName}</TableCell>
                  <TableCell>₹{record.amountDue.toLocaleString()}</TableCell>
                  <TableCell>₹{record.amountPaid.toLocaleString()}</TableCell>
                  <TableCell>₹{(record.amountDue - record.amountPaid).toLocaleString()}</TableCell>
                  <TableCell>
                    {record.paymentDate ? new Date(record.paymentDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    {record.paymentMode ? getPaymentModeLabel(record.paymentMode) : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setIsPaymentModalOpen(true);
                        }}
                      >
                        Update
                      </Button>
                      {record.receiptNumber && (
                        <Button variant="ghost" size="sm">
                          Receipt
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Collections;
