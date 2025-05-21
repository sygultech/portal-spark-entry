
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
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
  FormMessage
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Department } from "@/services/departmentService";

interface DepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DepartmentFormValues) => void;
  department?: Department;
}

export interface DepartmentFormValues {
  name: string;
  description: string;
}

const DepartmentDialog = ({
  isOpen,
  onClose,
  onSave,
  department
}: DepartmentDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const isEditing = !!department;
  
  const form = useForm<DepartmentFormValues>({
    defaultValues: {
      name: "",
      description: ""
    }
  });
  
  useEffect(() => {
    if (department) {
      form.reset({
        name: department.name,
        description: department.description || ""
      });
    } else {
      form.reset({
        name: "",
        description: ""
      });
    }
  }, [department, form]);
  
  const handleFormSubmit = async (values: DepartmentFormValues) => {
    if (!profile?.school_id) return;
    
    try {
      setLoading(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error("Error submitting department form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Department" : "Create Department"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this department." 
              : "Create a new department for your school."}
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
                    <Input placeholder="e.g. Science Department" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Department description (optional)"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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

export default DepartmentDialog;

// force update

// force update
