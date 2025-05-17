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
import { Student, Guardian, PreviousSchool, Document, Category } from "@/types/student";
import { useState } from "react";
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

interface StudentFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  student?: Student;
}

export function StudentFormDialog({ open, onClose, onSave, student }: StudentFormDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<Student>(student || {
    id: "",
    admissionNo: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
    batch: "",
    nationality: "",
    motherTongue: "",
    academicRecords: [],
    medicalRecords: [],
    documents: [],
    disciplinaryRecords: [],
    guardians: [],
    transferRecords: []
  } as Student);

  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Add state for managing options
  const [customNationalities, setCustomNationalities] = useState<string[]>([]);
  const [customMotherTongues, setCustomMotherTongues] = useState<string[]>([]);
  const [customReligions, setCustomReligions] = useState<string[]>([]);
  const [customCastes, setCustomCastes] = useState<string[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);

  const handleInputChange = (field: keyof Student, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardianChange = (index: number, field: keyof Guardian, value: any) => {
    const newGuardians = [...formData.guardians];
    newGuardians[index] = { ...newGuardians[index], [field]: value };
    handleInputChange('guardians', newGuardians);
  };

  const addGuardian = () => {
    const newGuardian: Guardian = {
      id: Date.now().toString(),
      relation: "",
      firstName: "",
      lastName: "",
      occupation: "",
      phone: "",
      address: "",
      isEmergencyContact: false,
      canPickup: false
    };
    handleInputChange('guardians', [...formData.guardians, newGuardian]);
  };

  const removeGuardian = (index: number) => {
    const newGuardians = formData.guardians.filter((_, i) => i !== index);
    handleInputChange('guardians', newGuardians);
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
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
                    currentImage={formData.photo}
                    onImageSelected={setPhotoFile}
                    aspectRatio={1}
                  />
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Admission Number</Label>
                    <Input
                      value={formData.admissionNo}
                      onChange={(e) => handleInputChange("admissionNo", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>First Name</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
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
                    value={formData.motherTongue}
                    onValueChange={(value) => handleInputChange("motherTongue", value)}
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
                    value={formData.bloodGroup}
                    onValueChange={(value) => handleInputChange("bloodGroup", value)}
                    options={bloodGroupOptions}
                    onCreateOption={(value) => {
                      if (/^(A|B|AB|O)[+-]$/.test(value)) {
                        handleInputChange("bloodGroup", value);
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
                  <CardTitle>Previous School Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>School Name</Label>
                      <Input
                        value={formData.previousSchool?.name}
                        onChange={(e) =>
                          handleInputChange("previousSchool", {
                            ...formData.previousSchool,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Board</Label>
                      <Input
                        value={formData.previousSchool?.board}
                        onChange={(e) =>
                          handleInputChange("previousSchool", {
                            ...formData.previousSchool,
                            board: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Year of Passing</Label>
                      <Input
                        value={formData.previousSchool?.yearOfPassing}
                        onChange={(e) =>
                          handleInputChange("previousSchool", {
                            ...formData.previousSchool,
                            yearOfPassing: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label>Percentage</Label>
                      <Input
                        type="number"
                        value={formData.previousSchool?.percentage}
                        onChange={(e) =>
                          handleInputChange("previousSchool", {
                            ...formData.previousSchool,
                            percentage: parseFloat(e.target.value),
                          })
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
              
              {formData.guardians.map((guardian, index) => (
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
                          value={guardian.firstName}
                          onChange={(e) => handleGuardianChange(index, "firstName", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Last Name</Label>
                        <Input
                          value={guardian.lastName}
                          onChange={(e) => handleGuardianChange(index, "lastName", e.target.value)}
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
                          checked={guardian.isEmergencyContact}
                          onChange={(e) =>
                            handleGuardianChange(index, "isEmergencyContact", e.target.checked)
                          }
                        />
                        Emergency Contact
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={guardian.canPickup}
                          onChange={(e) =>
                            handleGuardianChange(index, "canPickup", e.target.checked)
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
