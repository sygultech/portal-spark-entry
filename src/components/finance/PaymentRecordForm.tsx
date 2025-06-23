
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PaymentRecord } from "@/types/finance";

interface PaymentRecordFormProps {
  initialData?: PaymentRecord;
  onSubmit: (data: Partial<PaymentRecord>) => void;
  onCancel: () => void;
}

const PaymentRecordForm: React.FC<PaymentRecordFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    studentId: "",
    studentName: "",
    admissionNumber: "",
    batchName: "",
    structureId: "",
    structureName: "",
    amountDue: 0,
    amountPaid: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: "cash" as PaymentRecord['paymentMode'],
    remarks: ""
  });

  // Mock students for selection
  const students = [
    {
      id: "student1",
      name: "John Doe",
      admissionNumber: "2024001",
      batchName: "Grade 1A",
      structureName: "Grade 1-5 Fee Structure",
      amountDue: 18500,
      amountPaid: 15000
    },
    {
      id: "student2",
      name: "Jane Smith",
      admissionNumber: "2024002",
      batchName: "Grade 1A",
      structureName: "Grade 1-5 Fee Structure",
      amountDue: 18500,
      amountPaid: 0
    },
    {
      id: "student3",
      name: "Mike Johnson",
      admissionNumber: "2024003",
      batchName: "Grade 2B",
      structureName: "Grade 1-5 Fee Structure",
      amountDue: 18500,
      amountPaid: 0
    }
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        studentId: initialData.studentId,
        studentName: initialData.studentName,
        admissionNumber: initialData.admissionNumber,
        batchName: initialData.batchName,
        structureId: initialData.structureId,
        structureName: initialData.structureName,
        amountDue: initialData.amountDue,
        amountPaid: initialData.amountPaid,
        paymentDate: initialData.paymentDate ? initialData.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
        paymentMode: initialData.paymentMode,
        remarks: initialData.remarks || ""
      });
    }
  }, [initialData]);

  const handleStudentSelect = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        studentId: student.id,
        studentName: student.name,
        admissionNumber: student.admissionNumber,
        batchName: student.batchName,
        structureName: student.structureName,
        amountDue: student.amountDue,
        amountPaid: student.amountPaid
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Selection */}
      {!initialData && (
        <div>
          <Label htmlFor="student">Select Student *</Label>
          <Select onValueChange={handleStudentSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  {student.name} - {student.admissionNumber} ({student.batchName})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Student Information (Read-only when editing) */}
      {formData.studentName && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Student Name</Label>
            <Input value={formData.studentName} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Admission Number</Label>
            <Input value={formData.admissionNumber} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Batch</Label>
            <Input value={formData.batchName} readOnly className="bg-muted" />
          </div>
          <div>
            <Label>Fee Structure</Label>
            <Input value={formData.structureName} readOnly className="bg-muted" />
          </div>
        </div>
      )}

      {/* Payment Information */}
      {formData.studentName && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Total Amount Due</Label>
              <Input 
                value={`₹${formData.amountDue.toLocaleString()}`} 
                readOnly 
                className="bg-muted" 
              />
            </div>
            <div>
              <Label>Previously Paid</Label>
              <Input 
                value={`₹${(formData.amountPaid || 0).toLocaleString()}`} 
                readOnly 
                className="bg-muted" 
              />
            </div>
            <div>
              <Label>Balance Due</Label>
              <Input 
                value={`₹${(formData.amountDue - (formData.amountPaid || 0)).toLocaleString()}`} 
                readOnly 
                className="bg-muted" 
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentAmount">Payment Amount *</Label>
              <Input
                id="paymentAmount"
                type="number"
                value={formData.amountPaid || ''}
                onChange={(e) => setFormData({ ...formData, amountPaid: Number(e.target.value) })}
                placeholder="Enter amount"
                required
                max={formData.amountDue}
              />
            </div>
            <div>
              <Label htmlFor="paymentDate">Payment Date *</Label>
              <Input
                id="paymentDate"
                type="date"
                value={formData.paymentDate}
                onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="paymentMode">Payment Mode *</Label>
              <Select
                value={formData.paymentMode}
                onValueChange={(value) => setFormData({ ...formData, paymentMode: value as PaymentRecord['paymentMode'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Payment Summary</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>Amount Being Paid: <span className="font-medium">₹{(formData.amountPaid || 0).toLocaleString()}</span></div>
              <div>Remaining Balance: <span className="font-medium">₹{(formData.amountDue - (formData.amountPaid || 0)).toLocaleString()}</span></div>
            </div>
          </div>
        </>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.studentName || !formData.amountPaid}>
          {initialData ? "Update Payment" : "Record Payment"}
        </Button>
      </div>
    </form>
  );
};

export default PaymentRecordForm;
