import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { FeeAssignment } from "@/types/finance";
import { useFeeStructures } from "@/hooks/useFeeStructures";
import { useBatchesForFeeAssignment } from "@/hooks/useBatches";
import { useStudentsWithBatchInfo } from "@/hooks/useStudentManagement";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { feeAssignmentService, AssignmentResult, AssignmentPreview } from "@/services/feeAssignmentService";
import { toast } from "sonner";

interface FeeAssignmentWizardProps {
  onSubmit: (result: AssignmentResult) => void;
  onCancel: () => void;
}

const FeeAssignmentWizard: React.FC<FeeAssignmentWizardProps> = ({
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [assignmentType, setAssignmentType] = useState<'batch' | 'individual'>('batch');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignmentPreview, setAssignmentPreview] = useState<AssignmentPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Get current academic year
  const { selectedAcademicYear } = useAcademicYearSelector();

  // Use real fee structures from backend
  const { feeStructures, loading: feeStructuresLoading, error: feeStructuresError } = useFeeStructures();

  // Use real batches and students from backend
  const { batches, isLoading: batchesLoading, error: batchesError } = useBatchesForFeeAssignment(selectedAcademicYear);
  const { students, isLoading: studentsLoading, error: studentsError } = useStudentsWithBatchInfo();

  const nextStep = async () => {
    if (currentStep < 3) {
      if (currentStep === 2) {
        // Moving to step 3, load assignment preview
        await loadAssignmentPreview();
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const loadAssignmentPreview = async () => {
    if (!selectedStructure) return;

    setPreviewLoading(true);
    try {
      const assignmentData = {
        feeStructureId: selectedStructure.id,
        assignmentType,
        selectedBatches: assignmentType === 'batch' && selectedBatch ? [selectedBatch.id] : [],
        selectedStudents: assignmentType === 'individual' ? selectedStudents : [],
      };

      const preview = await feeAssignmentService.getAssignmentPreview(assignmentData);
      setAssignmentPreview(preview);
    } catch (error) {
      console.error('Error loading assignment preview:', error);
      toast.error('Failed to load assignment preview');
    } finally {
      setPreviewLoading(false);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStructure) return;

    setIsSubmitting(true);
    try {
      const assignmentData = {
        feeStructureId: selectedStructure.id,
        assignmentType,
        selectedBatches: assignmentType === 'batch' && selectedBatch ? [selectedBatch.id] : [],
        selectedStudents: assignmentType === 'individual' ? selectedStudents : [],
        notes: `Assignment created from wizard - ${assignmentType} assignment`
      };

      const result = await feeAssignmentService.assignFeeStructure(assignmentData);
      
      if (result.success) {
        const message = result.newAssignments > 0 
          ? `Successfully assigned fees to ${result.newAssignments} new student${result.newAssignments > 1 ? 's' : ''}.`
          : 'Assignment completed successfully.';
        
        const skipMessage = result.skippedStudentsCount > 0 
          ? ` ${result.skippedStudentsCount} student${result.skippedStudentsCount > 1 ? 's' : ''} already had this fee structure.`
          : '';

        const totalMessage = result.totalStudents > 0
          ? ` Total students in selection: ${result.totalStudents}.`
          : '';

        toast.success(message + skipMessage + totalMessage);
        onSubmit(result);
      } else {
        toast.error('Failed to assign fees');
      }
    } catch (error) {
      console.error('Error assigning fees:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign fees');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {[
          { number: 1, title: 'Select Fee Structure' },
          { number: 2, title: 'Choose Students' },
          { number: 3, title: 'Confirm Assignment' }
        ].map((step) => (
          <div key={step.number} className="flex items-center">
            <div className="text-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mx-auto
                ${step.number <= currentStep 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
                }
              `}>
                {step.number < currentStep ? <Check className="h-4 w-4" /> : step.number}
              </div>
              <p className="text-xs mt-1 text-muted-foreground">{step.title}</p>
            </div>
            {step.number < 3 && (
              <div className={`
                w-12 h-1 mx-2
                ${step.number < currentStep ? 'bg-primary' : 'bg-muted'}
              `} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Select Fee Structure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feeStructuresLoading ? (
              // Loading state
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-32" />
                        <div className="flex gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-24" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-4 w-20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : feeStructuresError ? (
              // Error state
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to load fee structures: {feeStructuresError}
                </AlertDescription>
              </Alert>
            ) : feeStructures.length === 0 ? (
              // Empty state
              <div className="text-center py-8">
                <p className="text-muted-foreground">No fee structures found.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a fee structure first before making assignments.
                </p>
              </div>
            ) : (
              // Fee structures list
              feeStructures.map((structure) => (
                <div
                  key={structure.id}
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${selectedStructure?.id === structure.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => setSelectedStructure(structure)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{structure.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Academic Year: {structure.academicYear}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {structure.components.map((component, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {component.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">₹{structure.totalAmount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">per student</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Select Assignment Type</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Assignment Type Selection */}
            <div className="space-y-4">
              <Label>Assignment Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${assignmentType === 'batch' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => setAssignmentType('batch')}
                >
                  <h3 className="font-semibold">Batch Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign to entire batch/class
                  </p>
                </div>
                <div
                  className={`
                    p-4 border rounded-lg cursor-pointer transition-colors
                    ${assignmentType === 'individual' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => setAssignmentType('individual')}
                >
                  <h3 className="font-semibold">Individual Assignment</h3>
                  <p className="text-sm text-muted-foreground">
                    Assign to specific students
                  </p>
                </div>
              </div>
            </div>

            {/* Batch Selection */}
            {assignmentType === 'batch' && (
              <div className="space-y-4">
                <Label>Select Batch</Label>
                {batchesLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    ))}
                  </div>
                ) : batchesError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load batches: {batchesError.message}
                    </AlertDescription>
                  </Alert>
                ) : batches.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No batches found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {batches.map((batch) => (
                      <div
                        key={batch.id}
                        className={`
                          p-4 border rounded-lg cursor-pointer transition-colors
                          ${selectedBatch?.id === batch.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                          }
                        `}
                        onClick={() => setSelectedBatch(batch)}
                      >
                        <h3 className="font-semibold">{batch.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {batch.studentCount} students
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Student Selection */}
            {assignmentType === 'individual' && (
              <div className="space-y-4">
                <Label>Select Students</Label>
                {studentsLoading ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-2 p-2 border rounded">
                        <Skeleton className="h-4 w-4" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : studentsError ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Failed to load students: {studentsError.message}
                    </AlertDescription>
                  </Alert>
                ) : students.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No students found.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center space-x-2 p-2 border rounded"
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{student.first_name} {student.last_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {student.admission_number} • {student.batch_name || 'No batch assigned'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedStudents.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedStudents.length} students selected
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Confirm Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {previewLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-48" />
                </div>
              ) : assignmentPreview ? (
                <div className="space-y-6">
                  {/* Assignment Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border">
                      <p className="text-2xl font-bold text-blue-600">{assignmentPreview.totalStudents}</p>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg border">
                      <p className="text-2xl font-bold text-green-600">{assignmentPreview.newAssignments}</p>
                      <p className="text-sm text-muted-foreground">New Assignments</p>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg border">
                      <p className="text-2xl font-bold text-orange-600">{assignmentPreview.alreadyAssigned}</p>
                      <p className="text-sm text-muted-foreground">Already Assigned</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg border">
                      <p className="text-lg font-bold text-purple-600">₹{assignmentPreview.newAssignmentAmount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">New Amount</p>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="space-y-4">
                    <div>
                      <Label>Fee Structure</Label>
                      <p className="font-medium">{selectedStructure?.name}</p>
                    </div>
                    
                    <div>
                      <Label>Assignment Type</Label>
                      <p className="font-medium capitalize">{assignmentType}</p>
                    </div>

                    {assignmentType === 'batch' && selectedBatch && (
                      <div>
                        <Label>Target Batch</Label>
                        <p className="font-medium">{selectedBatch.name}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label>Total Assignment Amount</Label>
                        <p className="text-xl font-bold text-muted-foreground">
                          ₹{assignmentPreview.totalAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({assignmentPreview.totalStudents} students × ₹{selectedStructure?.totalAmount.toLocaleString()})
                        </p>
                      </div>
                      <div>
                        <Label>New Assignment Amount</Label>
                        <p className="text-xl font-bold text-green-600">
                          ₹{assignmentPreview.newAssignmentAmount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          ({assignmentPreview.newAssignments} new students × ₹{selectedStructure?.totalAmount.toLocaleString()})
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Students to be assigned */}
                  {assignmentPreview.newAssignments > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Badge variant="default" className="bg-green-100 text-green-700">
                            {assignmentPreview.newAssignments}
                          </Badge>
                          Students to be assigned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {assignmentPreview.studentsToAssign.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.admissionNumber} • {student.batchName}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-green-600">New</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Already assigned students */}
                  {assignmentPreview.alreadyAssigned > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {assignmentPreview.alreadyAssigned}
                          </Badge>
                          Students already assigned
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {assignmentPreview.alreadyAssignedStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-2 bg-orange-50 rounded border">
                              <div>
                                <p className="font-medium">{student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.admissionNumber} • {student.batchName}
                                </p>
                              </div>
                              <div className="text-right">
                                <Badge variant="outline" className="text-orange-600">Assigned</Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(student.assignedDate).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {assignmentPreview.newAssignments === 0 && (
                    <Alert>
                      <AlertDescription>
                        All selected students already have this fee structure assigned. No new assignments will be created.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    Failed to load assignment preview. Please try again.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
          )}
        </div>
        
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          
          {currentStep < 3 ? (
            <Button 
              onClick={nextStep}
              disabled={
                previewLoading ||
                (currentStep === 1 && (!selectedStructure || feeStructuresLoading)) ||
                (currentStep === 2 && assignmentType === 'batch' && (!selectedBatch || batchesLoading)) ||
                (currentStep === 2 && assignmentType === 'individual' && (selectedStudents.length === 0 || studentsLoading))
              }
            >
              {previewLoading && currentStep === 2 ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !assignmentPreview || assignmentPreview.newAssignments === 0}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isSubmitting ? 'Creating Assignment...' : 
               assignmentPreview?.newAssignments === 0 ? 'No New Assignments' : 
               `Create Assignment (${assignmentPreview?.newAssignments || 0} students)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeAssignmentWizard;
