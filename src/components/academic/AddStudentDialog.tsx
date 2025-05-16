
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useStudents } from "@/hooks/useStudents";
import { useBatchStudents } from "@/hooks/useBatches";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Batch } from "@/types/academic";

interface AddStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentId: string, rollNumber?: string) => void;
  existingStudentIds: string[];
  batch?: Batch;
}

interface AddStudentFormValues {
  student_id: string;
  roll_number: string;
}

const AddStudentDialog = ({
  isOpen,
  onClose,
  onSubmit,
  existingStudentIds,
  batch
}: AddStudentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { students, isLoading: isLoadingStudents } = useStudents();
  
  // Filter out students already in the batch
  const availableStudents = students.filter(
    student => !existingStudentIds.includes(student.id)
  );
  
  const form = useForm<AddStudentFormValues>({
    defaultValues: {
      student_id: "",
      roll_number: ""
    }
  });
  
  const handleFormSubmit = async (values: AddStudentFormValues) => {
    try {
      setLoading(true);
      
      await onSubmit(values.student_id, values.roll_number || undefined);
      
      form.reset();
      onClose();
    } catch (error) {
      console.error("Error adding student to batch:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Student to {batch?.name || "Batch"}</DialogTitle>
          <DialogDescription>
            Add a student to this batch/section.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              rules={{ required: "Student is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isLoadingStudents || availableStudents.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          isLoadingStudents 
                            ? "Loading students..." 
                            : availableStudents.length === 0 
                              ? "No available students" 
                              : "Select a student"
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {availableStudents.length === 0 ? (
                        <SelectItem value="no-students" disabled>No available students</SelectItem>
                      ) : (
                        availableStudents.map((student) => (
                          <SelectItem 
                            key={student.id} 
                            value={student.id || "unknown-id"}
                          >
                            {student.first_name || ''} {student.last_name || ''} ({student.email || 'no email'})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roll_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 101" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || isLoadingStudents || availableStudents.length === 0}
              >
                {loading ? "Adding..." : "Add Student"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStudentDialog;
