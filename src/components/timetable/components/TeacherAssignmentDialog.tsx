
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Teacher } from "@/hooks/useTeachersFromStaff";
import { useSubjects } from "@/hooks/useSubjects";
import { useBatches } from "@/hooks/useBatches";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teachers: Teacher[];
  onAssign: (assignment: any) => void;
}

interface AssignmentFormData {
  teacher_id: string;
  subject_id: string;
  batch_id: string;
}

export const TeacherAssignmentDialog: React.FC<TeacherAssignmentDialogProps> = ({
  open,
  onOpenChange,
  teachers,
  onAssign
}) => {
  const { profile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const { subjects } = useSubjects(profile?.school_id || '');
  const { batches } = useBatches(profile?.school_id || '');

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<AssignmentFormData>({
    defaultValues: {
      teacher_id: '',
      subject_id: '',
      batch_id: ''
    }
  });

  const watchedTeacherId = watch('teacher_id');

  React.useEffect(() => {
    if (watchedTeacherId) {
      const teacher = teachers.find(t => (t.profile_id || t.id) === watchedTeacherId);
      setSelectedTeacher(teacher || null);
    }
  }, [watchedTeacherId, teachers]);

  const onSubmit = async (data: AssignmentFormData) => {
    setIsSubmitting(true);
    try {
      await onAssign({
        teacher_id: data.teacher_id,
        subject_id: data.subject_id,
        batch_id: data.batch_id,
        academic_year_id: '', // Will be set by parent
      });
      onOpenChange(false);
      reset();
      setSelectedTeacher(null);
    } catch (error) {
      console.error('Error assigning teacher:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setSelectedTeacher(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Assign Teacher to Subject
          </DialogTitle>
          <DialogDescription>
            Assign a teacher to teach a specific subject for a batch.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacher_id">Select Teacher *</Label>
            <Controller
              name="teacher_id"
              control={control}
              rules={{ required: 'Please select a teacher' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.profile_id || teacher.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{teacher.first_name} {teacher.last_name}</span>
                          <Badge variant="outline" className="ml-2">
                            {teacher.employee_id}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.teacher_id && (
              <span className="text-sm text-destructive">{errors.teacher_id.message}</span>
            )}
          </div>

          {/* Selected Teacher Details */}
          {selectedTeacher && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {selectedTeacher.first_name} {selectedTeacher.last_name}
                    </h4>
                    <Badge variant="outline">{selectedTeacher.employee_id}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>
                      <strong>Department:</strong> {selectedTeacher.department?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>Designation:</strong> {selectedTeacher.designation?.name || 'N/A'}
                    </div>
                    <div>
                      <strong>Email:</strong> {selectedTeacher.email}
                    </div>
                    <div>
                      <strong>Status:</strong> {selectedTeacher.employment_status}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subject and Batch Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject *</Label>
              <Controller
                name="subject_id"
                control={control}
                rules={{ required: 'Please select a subject' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-3 w-3" />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject_id && (
                <span className="text-sm text-destructive">{errors.subject_id.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch_id">Batch *</Label>
              <Controller
                name="batch_id"
                control={control}
                rules={{ required: 'Please select a batch' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-3 w-3" />
                            {batch.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.batch_id && (
                <span className="text-sm text-destructive">{errors.batch_id.message}</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Assigning...' : 'Assign Teacher'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
