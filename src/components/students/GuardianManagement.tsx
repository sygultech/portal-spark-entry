
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, User, Mail, Phone, Briefcase } from "lucide-react";
import { Guardian } from "@/types/student";

interface GuardianManagementProps {
  guardians: Guardian[];
  onGuardiansChange: (guardians: Guardian[]) => void;
  schoolId: string;
}

export function GuardianManagement({ guardians, onGuardiansChange, schoolId }: GuardianManagementProps) {
  const addGuardian = () => {
    const newGuardian: Guardian = {
      id: Date.now().toString(),
      first_name: "",
      last_name: "",
      relation: "",
      occupation: "",
      email: "",
      phone: "",
      address: "",
      is_emergency_contact: false,
      can_pickup: false,
      is_primary: guardians.length === 0, // First guardian is primary by default
      school_id: schoolId
    };
    
    onGuardiansChange([...guardians, newGuardian]);
  };

  const removeGuardian = (index: number) => {
    const updatedGuardians = guardians.filter((_, i) => i !== index);
    // If removing primary guardian, make first remaining guardian primary
    if (updatedGuardians.length > 0 && guardians[index].is_primary) {
      updatedGuardians[0].is_primary = true;
    }
    onGuardiansChange(updatedGuardians);
  };

  const updateGuardian = (index: number, field: keyof Guardian, value: any) => {
    const updatedGuardians = [...guardians];
    updatedGuardians[index] = { ...updatedGuardians[index], [field]: value };
    
    // Ensure only one primary guardian
    if (field === 'is_primary' && value === true) {
      updatedGuardians.forEach((guardian, i) => {
        if (i !== index) {
          guardian.is_primary = false;
        }
      });
    }
    
    onGuardiansChange(updatedGuardians);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Guardian Information</h3>
          <p className="text-sm text-muted-foreground">
            Add and manage guardian details for the student
          </p>
        </div>
        <Button onClick={addGuardian} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Guardian
        </Button>
      </div>

      {guardians.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <User className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              No guardians added yet. Click "Add Guardian" to start.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {guardians.map((guardian, index) => (
            <Card key={guardian.id} className="relative">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Guardian {index + 1}
                    {guardian.is_primary && (
                      <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGuardian(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-first-name`}>First Name *</Label>
                    <Input
                      id={`guardian-${index}-first-name`}
                      value={guardian.first_name}
                      onChange={(e) => updateGuardian(index, "first_name", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-last-name`}>Last Name</Label>
                    <Input
                      id={`guardian-${index}-last-name`}
                      value={guardian.last_name || ""}
                      onChange={(e) => updateGuardian(index, "last_name", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                {/* Relationship and Occupation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-relation`}>Relationship *</Label>
                    <Select
                      value={guardian.relation}
                      onValueChange={(value) => updateGuardian(index, "relation", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Father</SelectItem>
                        <SelectItem value="mother">Mother</SelectItem>
                        <SelectItem value="grandfather">Grandfather</SelectItem>
                        <SelectItem value="grandmother">Grandmother</SelectItem>
                        <SelectItem value="uncle">Uncle</SelectItem>
                        <SelectItem value="aunt">Aunt</SelectItem>
                        <SelectItem value="sibling">Sibling</SelectItem>
                        <SelectItem value="legal_guardian">Legal Guardian</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-occupation`}>
                      <Briefcase className="w-4 h-4 inline mr-1" />
                      Occupation
                    </Label>
                    <Input
                      id={`guardian-${index}-occupation`}
                      value={guardian.occupation || ""}
                      onChange={(e) => updateGuardian(index, "occupation", e.target.value)}
                      placeholder="Enter occupation"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-phone`}>
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone Number *
                    </Label>
                    <Input
                      id={`guardian-${index}-phone`}
                      value={guardian.phone}
                      onChange={(e) => updateGuardian(index, "phone", e.target.value)}
                      placeholder="Enter phone number"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`guardian-${index}-email`}>
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email Address
                    </Label>
                    <Input
                      id={`guardian-${index}-email`}
                      type="email"
                      value={guardian.email || ""}
                      onChange={(e) => updateGuardian(index, "email", e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor={`guardian-${index}-address`}>Address</Label>
                  <Textarea
                    id={`guardian-${index}-address`}
                    value={guardian.address || ""}
                    onChange={(e) => updateGuardian(index, "address", e.target.value)}
                    placeholder="Enter complete address"
                    className="min-h-[60px]"
                  />
                </div>

                {/* Access Permissions */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Access Permissions</Label>
                  <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`guardian-${index}-primary`}
                        checked={guardian.is_primary || false}
                        onCheckedChange={(checked) => updateGuardian(index, "is_primary", checked)}
                      />
                      <Label htmlFor={`guardian-${index}-primary`} className="text-sm">
                        Primary Guardian
                        <span className="block text-xs text-muted-foreground">
                          Main contact for school communications
                        </span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`guardian-${index}-emergency`}
                        checked={guardian.is_emergency_contact || false}
                        onCheckedChange={(checked) => updateGuardian(index, "is_emergency_contact", checked)}
                      />
                      <Label htmlFor={`guardian-${index}-emergency`} className="text-sm">
                        Emergency Contact
                        <span className="block text-xs text-muted-foreground">
                          Can be contacted in case of emergencies
                        </span>
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`guardian-${index}-pickup`}
                        checked={guardian.can_pickup || false}
                        onCheckedChange={(checked) => updateGuardian(index, "can_pickup", checked)}
                      />
                      <Label htmlFor={`guardian-${index}-pickup`} className="text-sm">
                        Can Pick Up Student
                        <span className="block text-xs text-muted-foreground">
                          Authorized to pick up student from school
                        </span>
                      </Label>
                    </div>

                    {guardian.email && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Mobile App Access</Label>
                            <p className="text-xs text-muted-foreground">
                              Auto-create login credentials for mobile app
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Generate Login
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {guardians.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <Mail className="w-4 h-4" />
            <span className="font-medium">Guardian Summary</span>
          </div>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Total Guardians: {guardians.length}</li>
            <li>• Primary Contact: {guardians.find(g => g.is_primary)?.first_name || "Not set"}</li>
            <li>• Emergency Contacts: {guardians.filter(g => g.is_emergency_contact).length}</li>
            <li>• Authorized Pickup: {guardians.filter(g => g.can_pickup).length}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
