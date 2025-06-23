
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { FeeAssignment } from "@/types/finance";

interface FeeAssignmentWizardProps {
  onSubmit: (data: Omit<FeeAssignment, 'id'>) => void;
  onCancel: () => void;
}

const FeeAssignmentWizard: React.FC<FeeAssignmentWizardProps> = ({
  onSubmit,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedStructure, setSelectedStructure] = useState<any>(null);
  const [assignmentType, setAssignmentType] = useState<'batch' | 'student'>('batch');
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Mock data
  const feeStructures = [
    {
      id: "1",
      name: "Grade 1-5 Fee Structure",
      academicYear: "2024-25",
      totalAmount: 18500,
      components: ["Tuition Fee", "Library Fee", "Exam Fee"]
    },
    {
      id: "2",
      name: "Grade 6-10 Fee Structure",
      academicYear: "2024-25",
      totalAmount: 25500,
      components: ["Tuition Fee", "Lab Fee", "Sports Fee"]
    }
  ];

  const batches = [
    { id: "batch1", name: "Grade 1A", studentCount: 32 },
    { id: "batch2", name: "Grade 2B", studentCount: 28 },
    { id: "batch3", name: "Grade 6A", studentCount: 35 },
    { id: "batch4", name: "Grade 7B", studentCount: 30 }
  ];

  const students = [
    { id: "student1", name: "John Doe", admissionNumber: "2024001", batchName: "Grade 1A" },
    { id: "student2", name: "Jane Smith", admissionNumber: "2024002", batchName: "Grade 1A" },
    { id: "student3", name: "Mike Johnson", admissionNumber: "2024003", batchName: "Grade 2B" },
    { id: "student4", name: "Sarah Wilson", admissionNumber: "2024004", batchName: "Grade 2B" },
    { id: "student5", name: "David Brown", admissionNumber: "2024005", batchName: "Grade 6A" }
  ];

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!selectedStructure) return;

    const assignmentData: Omit<FeeAssignment, 'id'> = {
      structureId: selectedStructure.id,
      structureName: selectedStructure.name,
      assignmentType,
      assignedDate: new Date().toISOString(),
      totalAmount: assignmentType === 'batch' 
        ? selectedStructure.totalAmount * (selectedBatch?.studentCount || 0)
        : selectedStructure.totalAmount * selectedStudents.length,
      paidAmount: 0,
      balance: assignmentType === 'batch' 
        ? selectedStructure.totalAmount * (selectedBatch?.studentCount || 0)
        : selectedStructure.totalAmount * selectedStudents.length
    };

    if (assignmentType === 'batch' && selectedBatch) {
      assignmentData.batchId = selectedBatch.id;
      assignmentData.batchName = selectedBatch.name;
    } else if (assignmentType === 'student') {
      assignmentData.studentIds = selectedStudents;
    }

    onSubmit(assignmentData);
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
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
              ${step <= currentStep 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
              }
            `}>
              {step < currentStep ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < 3 && (
              <div className={`
                w-12 h-1 mx-2
                ${step < currentStep ? 'bg-primary' : 'bg-muted'}
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
            {feeStructures.map((structure) => (
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
                          {component}
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
            ))}
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
                    ${assignmentType === 'student' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                    }
                  `}
                  onClick={() => setAssignmentType('student')}
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
              </div>
            )}

            {/* Student Selection */}
            {assignmentType === 'student' && (
              <div className="space-y-4">
                <Label>Select Students</Label>
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
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.admissionNumber} • {student.batchName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
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
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Confirm Assignment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <p className="font-medium">{selectedBatch.name} ({selectedBatch.studentCount} students)</p>
                </div>
              )}

              {assignmentType === 'student' && (
                <div>
                  <Label>Selected Students</Label>
                  <p className="font-medium">{selectedStudents.length} students</p>
                </div>
              )}

              <div>
                <Label>Total Amount</Label>
                <p className="text-2xl font-bold">
                  ₹{(
                    selectedStructure?.totalAmount * 
                    (assignmentType === 'batch' 
                      ? selectedBatch?.studentCount || 0 
                      : selectedStudents.length
                    )
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                (currentStep === 1 && !selectedStructure) ||
                (currentStep === 2 && assignmentType === 'batch' && !selectedBatch) ||
                (currentStep === 2 && assignmentType === 'student' && selectedStudents.length === 0)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <Check className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeeAssignmentWizard;
