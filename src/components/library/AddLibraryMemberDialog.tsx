import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, User, Users, GraduationCap, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryMutations, useLibrarySettings } from '@/hooks/useLibrary';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AddLibraryMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface AvailablePerson {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  admission_number?: string;
  is_teacher?: boolean;
}

type MemberType = 'student' | 'teacher' | 'staff';

const AddLibraryMemberDialog: React.FC<AddLibraryMemberDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [memberType, setMemberType] = useState<MemberType>('student');
  const [selectedPerson, setSelectedPerson] = useState<AvailablePerson | null>(null);
  const [borrowingLimit, setBorrowingLimit] = useState<number>(3);
  const [availablePeople, setAvailablePeople] = useState<AvailablePerson[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { profile } = useAuth();
  const { createLibraryMember } = useLibraryMutations();
  const { data: librarySettings } = useLibrarySettings();

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setCurrentStep(1);
      setMemberType('student');
      setSelectedPerson(null);
      setSearchTerm('');
      setBorrowingLimit(3);
    }
  }, [open]);

  // Set default borrowing limit based on member type and library settings
  useEffect(() => {
    if (librarySettings) {
      switch (memberType) {
        case 'student':
          setBorrowingLimit(librarySettings.student_borrowing_limit || 3);
          break;
        case 'teacher':
          setBorrowingLimit(librarySettings.teacher_borrowing_limit || 5);
          break;
        case 'staff':
          setBorrowingLimit(librarySettings.staff_borrowing_limit || 3);
          break;
      }
    }
  }, [memberType, librarySettings]);

  // Fetch available people when member type changes
  useEffect(() => {
    if (open && currentStep === 2) {
      fetchAvailablePeople();
    }
  }, [memberType, open, currentStep]);

  const fetchAvailablePeople = async () => {
    if (!profile?.school_id) return;

    setLoading(true);
    try {
      let data: AvailablePerson[] = [];

      if (memberType === 'student') {
        // Fetch students not already library members
        const { data: students, error } = await supabase
          .from('student_details')
          .select(`
            id,
            first_name,
            last_name,
            email,
            admission_number
          `)
          .eq('school_id', profile.school_id);

        if (error) throw error;

        // Filter out existing library members
        const { data: existingMembers } = await supabase
          .from('library_members')
          .select('student_id')
          .eq('school_id', profile.school_id)
          .eq('is_active', true)
          .not('student_id', 'is', null);

        const existingStudentIds = existingMembers?.map(m => m.student_id) || [];
        data = (students || []).filter(s => !existingStudentIds.includes(s.id));
      } else {
        // Fetch staff/teachers not already library members
        const { data: staff, error } = await supabase
          .from('staff_details')
          .select(`
            id,
            first_name,
            last_name,
            email,
            employee_id,
            is_teacher
          `)
          .eq('school_id', profile.school_id)
          .eq('employment_status', 'Active')
          .eq('is_teacher', memberType === 'teacher');

        if (error) throw error;

        // Filter out existing library members
        const { data: existingMembers } = await supabase
          .from('library_members')
          .select('staff_id')
          .eq('school_id', profile.school_id)
          .eq('is_active', true)
          .not('staff_id', 'is', null);

        const existingStaffIds = existingMembers?.map(m => m.staff_id) || [];
        data = (staff || []).filter(s => !existingStaffIds.includes(s.id));
      }

      setAvailablePeople(data);
    } catch (error) {
      console.error('Error fetching available people:', error);
      toast.error('Failed to fetch available people');
    } finally {
      setLoading(false);
    }
  };

  const generateMemberId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const timestamp = Date.now().toString().slice(-6);
    const prefix = memberType === 'student' ? 'STU' : memberType === 'teacher' ? 'TCH' : 'STF';
    return `${prefix}${year}${timestamp}`;
  };

  const handleCreateMember = async () => {
    if (!selectedPerson || !profile?.school_id) return;

    setLoading(true);
    try {
      const memberData = {
        member_id: generateMemberId(),
        member_type: memberType,
        borrowing_limit: borrowingLimit,
        ...(memberType === 'student' 
          ? { student_id: selectedPerson.id }
          : { staff_id: selectedPerson.id }
        ),
      };

      await createLibraryMember.mutateAsync(memberData);
      toast.success('Library member added successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating library member:', error);
      toast.error('Failed to add library member');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = availablePeople.filter(person =>
    `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (person.email && person.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (person.employee_id && person.employee_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (person.admission_number && person.admission_number.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Select Member Type</h3>
        <p className="text-sm text-muted-foreground">Choose the type of member you want to add</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all border-2 ${
            memberType === 'student'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setMemberType('student')}
        >
          <CardContent className="p-6 text-center">
            <GraduationCap className={`h-8 w-8 mx-auto mb-3 ${
              memberType === 'student' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <h4 className="font-semibold">Student</h4>
            <p className="text-sm text-muted-foreground">Regular students</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${
            memberType === 'teacher'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setMemberType('teacher')}
        >
          <CardContent className="p-6 text-center">
            <User className={`h-8 w-8 mx-auto mb-3 ${
              memberType === 'teacher' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <h4 className="font-semibold">Teacher</h4>
            <p className="text-sm text-muted-foreground">Teaching staff</p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-all border-2 ${
            memberType === 'staff'
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onClick={() => setMemberType('staff')}
        >
          <CardContent className="p-6 text-center">
            <Users className={`h-8 w-8 mx-auto mb-3 ${
              memberType === 'staff' ? 'text-primary' : 'text-muted-foreground'
            }`} />
            <h4 className="font-semibold">Staff</h4>
            <p className="text-sm text-muted-foreground">Non-teaching staff</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">
          Select {memberType.charAt(0).toUpperCase() + memberType.slice(1)}
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose from available {memberType}s who are not library members yet
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={`Search ${memberType}s...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading {memberType}s...</p>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No available {memberType}s found
          </div>
        ) : (
          filteredPeople.map((person) => (
            <Card
              key={person.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedPerson?.id === person.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPerson(person)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">
                      {person.first_name} {person.last_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">{person.email}</p>
                    {person.employee_id && (
                      <Badge variant="outline" className="mt-1">
                        ID: {person.employee_id}
                      </Badge>
                    )}
                    {person.admission_number && (
                      <Badge variant="outline" className="mt-1">
                        Admission: {person.admission_number}
                      </Badge>
                    )}
                  </div>
                  {selectedPerson?.id === person.id && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold mb-2">Configure Member Settings</h3>
        <p className="text-sm text-muted-foreground">
          Set up the library membership details
        </p>
      </div>

      {selectedPerson && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Person</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold">
                  {selectedPerson.first_name} {selectedPerson.last_name}
                </h4>
                <p className="text-sm text-muted-foreground">{selectedPerson.email}</p>
                <Badge variant="secondary" className="mt-1">
                  {memberType.charAt(0).toUpperCase() + memberType.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="borrowingLimit">Borrowing Limit</Label>
          <Input
            id="borrowingLimit"
            type="number"
            min="1"
            max="20"
            value={borrowingLimit}
            onChange={(e) => setBorrowingLimit(parseInt(e.target.value) || 1)}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Maximum number of books this member can borrow at once
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <h4 className="font-semibold mb-2">Member Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Member ID:</span>
              <span className="font-mono">{generateMemberId()}</span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{memberType.charAt(0).toUpperCase() + memberType.slice(1)}</span>
            </div>
            <div className="flex justify-between">
              <span>Borrowing Limit:</span>
              <span>{borrowingLimit} books</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceedToStep2 = true; // memberType is always valid
  const canProceedToStep3 = selectedPerson !== null;
  const canCreateMember = selectedPerson !== null && borrowingLimit > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Library Member</DialogTitle>
          <DialogDescription>
            Add a new member to the library system
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Select Type' :
                currentStep === 2 ? 'Choose Person' :
                'Configure Settings'
              }
            </p>
          </div>
        </div>

        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep < 3 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && !canProceedToStep2) ||
                (currentStep === 2 && !canProceedToStep3)
              }
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleCreateMember}
              disabled={!canCreateMember || loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Member'
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLibraryMemberDialog; 