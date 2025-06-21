
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  employee_id: string;
}

export interface TeacherAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
  onAssign: (teacherId: string) => Promise<boolean>;
}

const TeacherAssignmentDialog: React.FC<TeacherAssignmentDialogProps> = ({
  open,
  onOpenChange,
  teachers,
  onAssign
}) => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedTeacher) return;
    
    setIsAssigning(true);
    try {
      const success = await onAssign(selectedTeacher);
      if (success) {
        setSelectedTeacher('');
        onOpenChange(false);
      }
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Teacher</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Teacher</Label>
            <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} ({teacher.employee_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssign} 
            disabled={!selectedTeacher || isAssigning}
          >
            {isAssigning ? 'Assigning...' : 'Assign'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TeacherAssignmentDialog;
