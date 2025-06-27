import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  CreditCard, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  User,
  BookOpen,
  DollarSign,
  History,
  Calculator,
  Zap,
  Target,
  PieChart
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedPaymentService } from "../../services/enhancedPaymentService";
import {
  StudentPaymentContext,
  PaymentAllocation,
  NewPaymentData,
  ValidationResult
} from "../../types/finance";

interface StudentPaymentDashboardProps {
  studentId?: string;
  onStudentSelect?: (studentId: string) => void;
  onPaymentComplete: (result: any) => void;
  onCancel: () => void;
}

const StudentPaymentDashboard: React.FC<StudentPaymentDashboardProps> = ({
  studentId: initialStudentId,
  onStudentSelect,
  onPaymentComplete,
  onCancel
}) => {
  const { profile } = useAuth();
  const [enhancedPaymentService] = useState(() => new EnhancedPaymentService());
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(initialStudentId || null);
  const [paymentContext, setPaymentContext] = useState<StudentPaymentContext | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [allocationMode, setAllocationMode] = useState<'auto' | 'manual'>('auto');
  const [autoStrategy, setAutoStrategy] = useState<'overdue_first' | 'proportional' | 'priority_based'>('overdue_first');
  const [allocations, setAllocations] = useState<PaymentAllocation[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentsWithFees, setStudentsWithFees] = useState<Array<{
    id: string;
    name: string;
    admissionNumber: string;
    totalOutstanding: number;
    isOverdue: boolean;
  }>>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  useEffect(() => {
    const schoolId = (profile as any)?.school_id;
    if (schoolId) {
      loadStudentsWithFees();
    }
  }, [profile]);

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentPaymentContext();
    }
  }, [selectedStudentId]);

  useEffect(() => {
    if (paymentAmount > 0 && paymentContext && allocationMode === 'auto') {
      generateAutoAllocation();
    }
  }, [paymentAmount, autoStrategy, allocationMode, paymentContext]);

  const loadStudentsWithFees = async () => {
    const schoolId = (profile as any)?.school_id;
    if (!schoolId) return;

    setLoadingStudents(true);
    try {
      const students = await enhancedPaymentService.getStudentsWithOutstandingFees(schoolId);
      setStudentsWithFees(students);
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students with outstanding fees');
    } finally {
      setLoadingStudents(false);
    }
  };

  const loadStudentPaymentContext = async () => {
    if (!selectedStudentId) return;

    setLoading(true);
    try {
      const context = await enhancedPaymentService.getStudentPaymentContext(selectedStudentId);
      setPaymentContext(context);
    } catch (error) {
      console.error('Error loading payment context:', error);
      toast.error('Failed to load student payment information');
    } finally {
      setLoading(false);
    }
  };

  const generateAutoAllocation = async () => {
    if (!selectedStudentId || !paymentAmount) return;

    try {
      const suggestedAllocations = await enhancedPaymentService.suggestPaymentAllocation(
        selectedStudentId,
        paymentAmount,
        autoStrategy
      );
      setAllocations(suggestedAllocations);
    } catch (error) {
      console.error('Error generating allocation:', error);
    }
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudentId(studentId);
    onStudentSelect?.(studentId);
    // Reset form state
    setPaymentAmount(0);
    setAllocations([]);
    setValidation(null);
  };

  const handleAllocationChange = (index: number, amount: number) => {
    const newAllocations = [...allocations];
    newAllocations[index].amount = Math.max(0, amount);
    setAllocations(newAllocations);
  };

  const handleAddManualAllocation = () => {
    if (!paymentContext) return;

    // Add allocation for first component with balance
    for (const structure of paymentContext.feeStructures) {
      for (const component of structure.components) {
        if (component.balance > 0) {
          const newAllocation: PaymentAllocation = {
            structureId: structure.id,
            structureName: structure.name,
            componentId: component.id,
            componentName: component.name,
            amount: 0,
            priority: component.priority
          };
          setAllocations([...allocations, newAllocation]);
          return;
        }
      }
    }
  };

  const removeAllocation = (index: number) => {
    const newAllocations = allocations.filter((_, i) => i !== index);
    setAllocations(newAllocations);
  };

  const validateAndSubmit = async () => {
    if (!selectedStudentId || !paymentContext) return;

    setIsSubmitting(true);
    try {
      // Validate allocation
      const validationResult = await enhancedPaymentService.validatePaymentAllocation(
        selectedStudentId,
        allocations
      );
      setValidation(validationResult);

      if (!validationResult.isValid) {
        toast.error('Please fix validation errors before submitting');
        setIsSubmitting(false);
        return;
      }

      // Get the first student fee record (assuming one record for now)
      const firstFeeStructure = paymentContext.feeStructures[0];
      if (!firstFeeStructure) {
        toast.error('No fee structure found for this student');
        setIsSubmitting(false);
        return;
      }

      // Create payment data with all required fields
      const paymentData: NewPaymentData = {
        studentId: selectedStudentId,
        studentFeeId: firstFeeStructure.studentFeeId || firstFeeStructure.id, // Use actual student fee ID
        totalAmount: paymentAmount,
        paymentMode: paymentMode as 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: `Payment allocation across ${allocations.length} components`,
        createdBy: (profile as any)?.id || '',
        schoolId: (profile as any)?.school_id || '',
        allocations: allocations
      };

      // Record the payment
      const result = await enhancedPaymentService.recordPaymentWithAllocation(paymentData);
      
      if (result.success) {
        toast.success(result.message);
        onPaymentComplete(result);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error('Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: "default",
      partial: "secondary",
      due: "outline",
      overdue: "destructive"
    };
    
    const colors = {
      paid: "text-green-600",
      partial: "text-yellow-600",
      due: "text-blue-600",
      overdue: "text-red-600"
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] as any} className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getQuickAmountSuggestions = () => {
    if (!paymentContext) return [];

    const suggestions = [];
    
    if (paymentContext.summary.overdueAmount > 0) {
      suggestions.push({
        label: `Pay Overdue (₹${paymentContext.summary.overdueAmount.toLocaleString()})`,
        amount: paymentContext.summary.overdueAmount
      });
    }

    // Find tuition components
    const tuitionComponents = paymentContext.feeStructures.flatMap(fs => 
      fs.components.filter(c => c.name.toLowerCase().includes('tuition') && c.balance > 0)
    );
    
    if (tuitionComponents.length > 0) {
      const totalTuition = tuitionComponents.reduce((sum, c) => sum + c.balance, 0);
      suggestions.push({
        label: `Pay All Tuition (₹${totalTuition.toLocaleString()})`,
        amount: totalTuition
      });
    }

    suggestions.push({
      label: `Pay Full Balance (₹${paymentContext.summary.overallBalance.toLocaleString()})`,
      amount: paymentContext.summary.overallBalance
    });

    return suggestions;
  };

  const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
  const remainingAmount = paymentAmount - totalAllocated;

  if (!selectedStudentId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select Student for Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label>Search and select a student</Label>
            <div className="grid gap-2">
              {studentsWithFees.map((student) => (
                <Card 
                  key={student.id} 
                  className="cursor-pointer hover:bg-accent transition-colors"
                  onClick={() => handleStudentSelect(student.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {student.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium">{student.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {student.admissionNumber}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.isOverdue && (
                          <Badge variant="destructive">
                            Overdue
                          </Badge>
                        )}
                        <Badge variant="outline">
                          ₹{student.totalOutstanding.toLocaleString()} Due
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student payment information...</p>
        </CardContent>
      </Card>
    );
  }

  if (!paymentContext) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
          <p>Failed to load student payment information</p>
          <Button onClick={onCancel} variant="outline" className="mt-4">
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="text-lg">
                  {paymentContext.student.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">{paymentContext.student.name}</CardTitle>
                <p className="text-muted-foreground">
                  {paymentContext.student.admissionNumber} • {paymentContext.student.batchName}
                </p>
              </div>
            </div>
            <Button onClick={onCancel} variant="outline">
              Change Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold">₹{paymentContext.summary.totalDue.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Fees</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">₹{paymentContext.summary.totalPaid.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Paid</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">₹{paymentContext.summary.overallBalance.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">₹{paymentContext.summary.overdueAmount.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="payment" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payment">Record Payment</TabsTrigger>
          <TabsTrigger value="details">Fee Details</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          {/* Payment Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Amount and Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Payment Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentAmount || ''}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    placeholder="Enter amount"
                    min="0"
                    step="1"
                  />
                  
                  {/* Quick Amount Suggestions */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getQuickAmountSuggestions().map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentAmount(suggestion.amount)}
                      >
                        {suggestion.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mode">Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Allocation Strategy */}
              {paymentAmount > 0 && (
                <div className="space-y-4">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Payment Allocation</h3>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={allocationMode === 'auto' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAllocationMode('auto')}
                      >
                        <Zap className="h-4 w-4 mr-1" />
                        Auto
                      </Button>
                      <Button
                        variant={allocationMode === 'manual' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setAllocationMode('manual')}
                      >
                        <Target className="h-4 w-4 mr-1" />
                        Manual
                      </Button>
                    </div>
                  </div>

                  {allocationMode === 'auto' && (
                    <div className="space-y-2">
                      <Label>Allocation Strategy</Label>
                      <Select value={autoStrategy} onValueChange={(value: any) => setAutoStrategy(value)}>
                        <SelectTrigger className="w-full md:w-64">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="overdue_first">Pay Overdue First</SelectItem>
                          <SelectItem value="priority_based">Priority Based (Tuition First)</SelectItem>
                          <SelectItem value="proportional">Proportional Distribution</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Allocation Table */}
                  {allocations.length > 0 && (
                    <div className="space-y-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Fee Structure</TableHead>
                            <TableHead>Component</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Allocation</TableHead>
                            {allocationMode === 'manual' && <TableHead>Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allocations.map((allocation, index) => {
                            const structure = paymentContext.feeStructures.find(fs => fs.id === allocation.structureId);
                            const component = structure?.components.find(c => c.id === allocation.componentId);
                            
                            return (
                              <TableRow key={index}>
                                <TableCell className="font-medium">{allocation.structureName}</TableCell>
                                <TableCell>{allocation.componentName}</TableCell>
                                <TableCell>₹{component?.balance.toLocaleString()}</TableCell>
                                <TableCell>
                                  {allocationMode === 'manual' ? (
                                    <Input
                                      type="number"
                                      value={allocation.amount}
                                      onChange={(e) => handleAllocationChange(index, Number(e.target.value))}
                                      min="0"
                                      max={component?.balance}
                                      className="w-24"
                                    />
                                  ) : (
                                    `₹${allocation.amount.toLocaleString()}`
                                  )}
                                </TableCell>
                                {allocationMode === 'manual' && (
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeAllocation(index)}
                                    >
                                      Remove
                                    </Button>
                                  </TableCell>
                                )}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      {/* Allocation Summary */}
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="text-lg font-semibold">₹{paymentAmount.toLocaleString()}</div>
                            <p className="text-sm text-muted-foreground">Payment Amount</p>
                          </div>
                          <div>
                            <div className="text-lg font-semibold">₹{totalAllocated.toLocaleString()}</div>
                            <p className="text-sm text-muted-foreground">Allocated</p>
                          </div>
                          <div>
                            <div className={`text-lg font-semibold ${remainingAmount === 0 ? 'text-green-600' : remainingAmount > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                              ₹{Math.abs(remainingAmount).toLocaleString()}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {remainingAmount === 0 ? 'Fully Allocated' : remainingAmount > 0 ? 'Unallocated' : 'Over-allocated'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {allocationMode === 'manual' && (
                        <Button onClick={handleAddManualAllocation} variant="outline">
                          Add Another Allocation
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Validation Messages */}
                  {validation && (validation.errors.length > 0 || validation.warnings.length > 0) && (
                    <div className="space-y-2">
                      {validation.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{error.message}</AlertDescription>
                        </Alert>
                      ))}
                      {validation.warnings.map((warning, index) => (
                        <Alert key={index}>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{warning.message}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button onClick={onCancel} variant="outline">
                      Cancel
                    </Button>
                    <Button 
                      onClick={validateAndSubmit}
                      disabled={isSubmitting || paymentAmount <= 0 || totalAllocated !== paymentAmount}
                      className="min-w-32"
                    >
                      {isSubmitting ? 'Recording...' : `Record Payment (₹${paymentAmount.toLocaleString()})`}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {/* Fee Structures Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Fee Structure Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="multiple" className="w-full">
                {paymentContext.feeStructures.map((structure) => (
                  <AccordionItem key={structure.id} value={structure.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <div className="text-left">
                          <h3 className="font-medium">{structure.name}</h3>
                          <p className="text-sm text-muted-foreground">{structure.academicYear}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(structure.status)}
                          <div className="text-right">
                            <div className="font-semibold">₹{structure.balance.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              ₹{structure.paidAmount.toLocaleString()} / ₹{structure.totalAmount.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Component</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Paid</TableHead>
                            <TableHead>Balance</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {structure.components.map((component) => (
                            <TableRow key={component.id}>
                              <TableCell className="font-medium">{component.name}</TableCell>
                              <TableCell>₹{component.amount.toLocaleString()}</TableCell>
                              <TableCell>₹{component.paidAmount.toLocaleString()}</TableCell>
                              <TableCell>₹{component.balance.toLocaleString()}</TableCell>
                              <TableCell>{new Date(component.dueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{getStatusBadge(component.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentContext.paymentHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payment history found
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentContext.paymentHistory.map((payment) => (
                    <Card key={payment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-semibold">₹{payment.amount.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(payment.date).toLocaleDateString()} • {payment.mode.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">Receipt: {payment.receiptNumber}</div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-sm font-medium">Allocation Details:</h4>
                          {payment.allocations.map((allocation, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              • {allocation.structureName} - {allocation.componentName}: ₹{allocation.amount.toLocaleString()}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentPaymentDashboard; 