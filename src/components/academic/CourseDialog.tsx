
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useDepartments } from "@/hooks/useDepartments";
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
import { Course } from "@/types/academic";

interface CourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CourseFormValues) => void;
  course?: Course & { department?: { id: string; name: string } | null };
  academicYearId: string;
}

export interface CourseFormValues {
  name: string;
  code: string;
  duration: number | null;
  duration_unit: 'years' | 'months' | 'days' | null;
  department_id: string | null;
}

const CourseDialog = ({
  isOpen,
  onClose,
  onSave,
  course,
  academicYearId
}: CourseDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { departments } = useDepartments();
  const isEditing = !!course;
  
  const form = useForm<CourseFormValues>({
    defaultValues: {
      name: "",
      code: "",
      duration: null,
      duration_unit: null,
      department_id: null
    }
  });
  
  useEffect(() => {
    if (course) {
      form.reset({
        name: course.name,
        code: course.code || "",
        duration: course.duration || null,
        duration_unit: course.duration_unit || null,
        department_id: course.department_id || null
      });
    } else {
      form.reset({
        name: "",
        code: "",
        duration: null,
        duration_unit: null,
        department_id: null
      });
    }
  }, [course, form]);
  
  const handleFormSubmit = async (values: CourseFormValues) => {
    if (!profile?.school_id) return;
    
    try {
      setLoading(true);
      await onSave({
        ...values,
        duration: values.duration || undefined,
        duration_unit: values.duration_unit || undefined,
        department_id: values.department_id || undefined
      });
      onClose();
    } catch (error) {
      console.error("Error submitting course form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Create Course"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this course." 
              : "Create a new course for your school."}
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
                    <Input placeholder="e.g. Grade 1" {...field} />
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
                    <Input placeholder="e.g. G1" {...field} />
                  </FormControl>
                  <FormDescription>
                    A short code or identifier for this course (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 1" 
                        {...field}
                        value={field.value === null ? '' : field.value}
                        onChange={e => field.onChange(e.target.value ? Number(e.target.value) : null)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration Unit</FormLabel>
                    <Select 
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value || null)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="years">Years</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="days">Days</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value || null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
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

export default CourseDialog;

// force update
