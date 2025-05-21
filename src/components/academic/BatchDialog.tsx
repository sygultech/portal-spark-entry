
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useTeachers } from "@/hooks/useTeachers";
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
  FormDescription
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
import { Batch, Course } from "@/types/academic";

interface BatchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BatchFormValues) => void;
  batch?: Batch & { 
    class_teacher?: { id: string; first_name: string; last_name: string } | null 
  };
  course: Course;
  academicYearId: string;
}

export interface BatchFormValues {
  name: string;
  code: string;
  capacity: number | null;
  class_teacher_id: string | null;
}

const BatchDialog = ({
  isOpen,
  onClose,
  onSave,
  batch,
  course,
  academicYearId
}: BatchDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { teachers } = useTeachers();
  const isEditing = !!batch;
  
  const form = useForm<BatchFormValues>({
    defaultValues: {
      name: "",
      code: "",
      capacity: null,
      class_teacher_id: null
    }
  });
  
  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name,
        code: batch.code || "",
        capacity: batch.capacity || null,
        class_teacher_id: batch.class_teacher_id || null
      });
    } else {
      form.reset({
        name: "",
        code: "",
        capacity: null,
        class_teacher_id: null
      });
    }
  }, [batch, form]);
  
  const handleFormSubmit = async (values: BatchFormValues) => {
    if (!profile?.school_id) return;
    
    try {
      setLoading(true);
      await onSave({
        ...values,
        capacity: values.capacity || undefined,
        class_teacher_id: values.class_teacher_id || undefined
      });
      onClose();
    } catch (error) {
      console.error("Error submitting batch form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? `Edit ${course.name} Batch` : `New ${course.name} Batch`}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this batch/section." 
              : "Create a new batch/section for this course."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Section A" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. G1A" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short code or identifier for this batch (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="e.g. 30" 
                      {...field}
                      value={field.value === null ? '' : field.value}
                      onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                    />
                  </FormControl>
                  <FormDescription>
                    Maximum number of students (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="class_teacher_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Class Teacher</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value || null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class teacher (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Teacher Assigned</SelectItem>
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id || "unknown-id"}>
                          {teacher.first_name || ''} {teacher.last_name || ''} ({teacher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BatchDialog;

// force update
