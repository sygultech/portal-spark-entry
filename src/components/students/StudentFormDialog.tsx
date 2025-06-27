import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Student, Guardian, StudentDocument, StudentCategory, PreviousSchoolInfo } from "@/types/student";
import { ImageUploader } from "../common/ImageUploader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Plus, Trash2 } from "lucide-react";
import { CreatableSelect } from "../ui/creatable-select";
import {
  nationalityOptions,
  motherTongueOptions,
  religionOptions,
  casteOptions,
  bloodGroupOptions,
  categoryOptions,
} from "@/data/student-form-options";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import { useAuth } from "@/contexts/AuthContext";
import { addStudentToBatch, removeStudentFromBatch } from "@/services/studentService";
import { toast } from "sonner";

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  student?: Student;
}

export function StudentFormDialog({ open, onClose, onSave, student }: StudentFormDialogProps) {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("basic");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(student?.academic_year || "");
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  
  const [formData, setFormData] = useState<Student>(student || {
    id: "",
    admission_number: "",
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "male",
    address: "",
    batch_id: "",
    nationality: "",
    mother_tongue: "",
    status: "active",
    school_id: "",
    guardians: []
  } as Student);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Fetch academic data
  const { academicYears } = useAcademicYears();
  const currentAcademicYear = academicYears.find(year => year.is_current);
  const { courses } = useCourses(selectedAcademicYear || currentAcademicYear?.id);
  const { batches } = useBatches(selectedAcademicYear || currentAcademicYear?.id, selectedCourse);

  // Add state for managing options
  const [customNationalities, setCustomNationalities] = useState<string[]>([]);
  const [customMotherTongues, setCustomMotherTongues] = useState<string[]>([]);
  const [customReligions, setCustomReligions] = useState<string[]>([]);
  const [customCastes, setCustomCastes] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  // Initialize course and academic year selection when editing a student
  useEffect(() => {
    if (student && open) {
      // Set academic year if available
      if (student.academic_year && academicYears.length > 0) {
        const academicYear = academicYears.find(year => year.name === student.academic_year);
        if (academicYear && academicYear.id !== selectedAcademicYear) {
          setSelectedAcademicYear(academicYear.id);
        }
      }
      
      // Find the course for the student's current batch
      if (batches.length > 0 && courses.length > 0 && student.batch_id) {
        const studentBatch = batches.find(batch => batch.id === student.batch_id);
        if (studentBatch && studentBatch.course_id !== selectedCourse) {
          setSelectedCourse(studentBatch.course_id);
        }
      }
    }
  }, [student, open, academicYears.length, batches.length, courses.length]);

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // When batch changes, update related academic information
      if (field === 'batch_id' && value) {
        const selectedBatch = batches.find(batch => batch.id === value);
        if (selectedBatch) {
          updated.batch_name = selectedBatch.name;
          updated.academic_year = academicYears.find(year => year.id === (selectedAcademicYear || currentAcademicYear?.id))?.name;
          updated.course_name = courses.find(course => course.id === selectedCourse)?.name;
        }
      }
      
      return updated;
    });
  };

  const handleGuardianChange = (index: number, field: keyof Guardian, value: any) => {
    if (!formData.guardians) return;
    
    const newGuardians = [...formData.guardians];
    newGuardians[index] = { ...newGuardians[index], [field]: value };
    handleInputChange('guardians', newGuardians);
  };

  const addGuardian = () => {
    const newGuardian: Guardian = {
      id: Date.now().toString(),
      first_name: "",
      last_name: "",
      relation: "",
      occupation: "",
      phone: "",
      address: "",
      is_emergency_contact: false,
      can_pickup: false,
      school_id: formData.school_id
    };
    
    const guardians = formData.guardians || [];
    handleInputChange('guardians', [...guardians, newGuardian]);
  };

  const removeGuardian = (index: number) => {
    if (!formData.guardians) return;
    
    const newGuardians = formData.guardians.filter((_, i) => i !== index);
    handleInputChange('guardians', newGuardians);
  };

  const handleSave = async () => {
    try {
      // Check if batch assignment has changed for existing students
      const batchChanged = student && student.batch_id !== formData.batch_id;
      
      // Save the student data first
      onSave(formData);
      
      // Handle batch assignment changes if this is an existing student
      if (student && batchChanged) {
        // Remove from old batch if there was one
        if (student.batch_id) {
          await removeStudentFromBatch(student.id, student.batch_id);
        }
        
        // Add to new batch if selected
        if (formData.batch_id) {
          await addStudentToBatch(student.id, formData.batch_id);
          toast.success("Student batch assignment updated successfully");
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error updating student batch assignment:', error);
      toast.error("Failed to update batch assignment. Student data was saved but batch assignment failed.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] md:max-w-[85vw] lg:max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{student ? "Edit Student" : "Add New Student"}</DialogTitle>
          <DialogDescription>
            {student ? "Update the student's information" : "Enter the student's information"}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="academic">Academic</TabsTrigger>
            <TabsTrigger value="guardian">Guardian</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
            <TabsTrigger value="additional">Additional</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 px-1">
            <TabsContent value="basic" className="space-y-4 p-2 md:p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Photo</Label>
                  <ImageUploader
                    currentImage={formData.avatar_url}
                    onImageSelected={setPhotoFile}
                    aspectRatio={1}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Admission Number</Label>
                    <Input
                      value={formData.admission_number}
                      onChange={(e) => handleInputChange("admission_number", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => handleInputChange("first_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => handleInputChange("last_name", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => handleInputChange("gender", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Nationality</Label>
                  <CreatableSelect
                    value={formData.nationality}
                    onValueChange={(value) => handleInputChange("nationality", value)}
                    options={[
                      ...nationalityOptions,
                      ...customNationalities.map(n => ({ value: n, label: n }))
                    ]}
                    onCreateOption={(value) => {
                      setCustomNationalities(prev => [...prev, value]);
                    }}
                    placeholder="Select or enter nationality"
                  />
                </div>
                <div>
                  <Label>Mother Tongue</Label>
                  <CreatableSelect
                    value={formData.mother_tongue}
                    onValueChange={(value) => handleInputChange("mother_tongue", value)}
                    options={[
                      ...motherTongueOptions,
                      ...customMotherTongues.map(m => ({ value: m, label: m }))
                    ]}
                    onCreateOption={(value) => {
                      setCustomMotherTongues(prev => [...prev, value]);
                    }}
                    placeholder="Select or enter mother tongue"
                  />
                </div>
                <div>
                  <Label>Religion</Label>
                  <CreatableSelect
                    value={formData.religion}
                    onValueChange={(value) => handleInputChange("religion", value)}
                    options={[
                      ...religionOptions,
                      ...customReligions.map(r => ({ value: r, label: r }))
                    ]}
                    onCreateOption={(value) => {
                      setCustomReligions(prev => [...prev, value]);
                    }}
                    placeholder="Select or enter religion"
                  />
                </div>
                <div>
                  <Label>Caste</Label>
                  <CreatableSelect
                    value={formData.caste}
                    onValueChange={(value) => handleInputChange("caste", value)}
                    options={[
                      ...casteOptions,
                      ...customCastes.map(c => ({ value: c, label: c }))
                    ]}
                    onCreateOption={(value) => {
                      setCustomCastes(prev => [...prev, value]);
                    }}
                    placeholder="Select or enter caste"
                  />
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <CreatableSelect
                    value={formData.blood_group}
                    onValueChange={(value) => handleInputChange("blood_group", value)}
                    options={bloodGroupOptions}
                    onCreateOption={(value) => {
                      if (/^(A|B|AB|O)[+-]$/.test(value)) {
                        handleInputChange("blood_group", value);
                      }
                    }}
                    placeholder="Select blood group"
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <CreatableSelect
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                    options={[
                      ...categoryOptions,
                      ...customCategories.map(c => ({ value: c, label: c }))
                    ]}
                    onCreateOption={(value) => {
                      setCustomCategories(prev => [...prev, value]);
                    }}
                    placeholder="Select or enter category"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4 p-2 md:p-4">
              <Card>
                <CardHeader>
                  <CardTitle>Current Academic Assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Academic Year</Label>
                      <Select
                        value={selectedAcademicYear || currentAcademicYear?.id || ""}
                        onValueChange={(value) => {
                          setSelectedAcademicYear(value);
                          setSelectedCourse(""); // Reset course selection
                          handleInputChange("batch_id", ""); // Reset batch selection
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year.id} value={year.id}>
                              {year.name} {year.is_current && "(Current)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Course</Label>
                      <Select
                        value={selectedCourse}
                        onValueChange={(value) => {
                          setSelectedCourse(value);
                          handleInputChange("batch_id", ""); // Reset batch selection
                        }}
                        disabled={!selectedAcademicYear && !currentAcademicYear?.id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((course) => (
                            <SelectItem key={course.id} value={course.id}>
                              {course.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Batch/Section</Label>
                      <Select
                        value={formData.batch_id || ""}
                        onValueChange={(value) => handleInputChange("batch_id", value)}
                        disabled={!selectedCourse}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                        <SelectContent>
                          {batches.map((batch) => (
                            <SelectItem key={batch.id} value={batch.id}>
                              {batch.name} {batch.code && `(${batch.code})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {formData.batch_id && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm text-blue-800">
                        <strong>Selected Assignment:</strong> {" "}
                        {batches.find(b => b.id === formData.batch_id)?.name} - {" "}
                        {courses.find(c => c.id === selectedCourse)?.name} - {" "}
                        {academicYears.find(y => y.id === (selectedAcademicYear || currentAcademicYear?.id))?.name}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Previous School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>School Name</Label>
                      <Input
                        value={formData.previous_school_name}
                        onChange={(e) =>
                          handleInputChange("previous_school_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Board</Label>
                      <Input
                        value={formData.previous_school_board}
                        onChange={(e) =>
                          handleInputChange("previous_school_board", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Year of Passing</Label>
                      <Input
                        value={formData.previous_school_year}
                        onChange={(e) =>
                          handleInputChange("previous_school_year", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <Label>Percentage</Label>
                      <Input
                        type="number"
                        value={formData.previous_school_percentage}
                        onChange={(e) =>
                          handleInputChange("previous_school_percentage", parseFloat(e.target.value))
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="guardian" className="space-y-4 p-2 md:p-4">
              <div className="flex justify-end">
                <Button onClick={addGuardian} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guardian
                </Button>
              </div>
              
              {formData.guardians && formData.guardians.map((guardian, index) => (
                <Card key={guardian.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={() => removeGuardian(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  <CardHeader>
                    <CardTitle>Guardian {index + 1}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Relation</Label>
                        <Input
                          value={guardian.relation}
                          onChange={(e) => handleGuardianChange(index, "relation", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>First Name</Label>
                        <Input
                          value={guardian.first_name}
                          onChange={(e) => handleGuardianChange(index, "first_name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={guardian.last_name}
                          onChange={(e) => handleGuardianChange(index, "last_name", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Occupation</Label>
                        <Input
                          value={guardian.occupation}
                          onChange={(e) => handleGuardianChange(index, "occupation", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={guardian.phone}
                          onChange={(e) => handleGuardianChange(index, "phone", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          value={guardian.email}
                          onChange={(e) => handleGuardianChange(index, "email", e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Textarea
                        value={guardian.address}
                        onChange={(e) => handleGuardianChange(index, "address", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={guardian.is_emergency_contact}
                          onChange={(e) =>
                            handleGuardianChange(index, "is_emergency_contact", e.target.checked)
                          }
                        />
                        Emergency Contact
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={guardian.can_pickup}
                          onChange={(e) =>
                            handleGuardianChange(index, "can_pickup", e.target.checked)
                          }
                        />
                        Can Pickup Student
                      </label>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 p-4">
              {/* Medical Records UI will be implemented here */}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4 p-4">
              {/* Documents UI will be implemented here */}
            </TabsContent>

            <TabsContent value="disciplinary" className="space-y-4 p-4">
              {/* Disciplinary Records UI will be implemented here */}
            </TabsContent>

            <TabsContent value="additional" className="space-y-4 p-4">
              {/* Additional Information UI will be implemented here */}
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
