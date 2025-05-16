
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useSubjectCategories } from "@/hooks/useSubjectCategories";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface SubjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  subject?: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    category_id?: string;
    subject_type?: string;
    grading_type?: string;
    max_marks?: number;
    weightage?: number;
    category?: {
      id: string;
      name: string;
    };
  } | null;
}

export const SubjectFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  subject
}: SubjectFormDialogProps) => {
  const { profile } = useAuth();
  const { categories } = useSubjectCategories();
  
  const form = useForm({
    defaultValues: {
      name: "",
      code: "",
      description: "",
      category_id: "",
      subject_type: "",
      grading_type: "",
      max_marks: undefined as number | undefined,
      weightage: undefined as number | undefined,
      school_id: profile?.school_id || ""
    }
  });
  
  useEffect(() => {
    if (subject) {
      form.reset({
        name: subject.name,
        code: subject.code || "",
        description: subject.description || "",
        category_id: subject.category_id || subject.category?.id || "",
        subject_type: subject.subject_type || "",
        grading_type: subject.grading_type || "",
        max_marks: subject.max_marks,
        weightage: subject.weightage,
        school_id: profile?.school_id || ""
      });
    } else {
      form.reset({
        name: "",
        code: "",
        description: "",
        category_id: "",
        subject_type: "",
        grading_type: "",
        max_marks: undefined,
        weightage: undefined,
        school_id: profile?.school_id || ""
      });
    }
  }, [subject, form, profile?.school_id]);
  
  const subjectTypes = [
    { value: "core", label: "Core" },
    { value: "elective", label: "Elective" },
    { value: "activity-based", label: "Activity-Based" },
    { value: "language", label: "Language" },
    { value: "other", label: "Other" }
  ];
  
  const gradingTypes = [
    { value: "grade", label: "Grade Only" },
    { value: "marks", label: "Marks Only" },
    { value: "both", label: "Both Grade & Marks" }
  ];

  const handleSubmit = (data: any) => {
    // Convert numeric strings to numbers
    if (data.max_marks) {
      data.max_marks = Number(data.max_marks);
    }
    
    if (data.weightage) {
      data.weightage = Number(data.weightage);
    }
    
    onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{subject ? "Edit Subject" : "Add Subject"}</DialogTitle>
          <DialogDescription>
            {subject ? "Update subject details" : "Create a new subject with details"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                rules={{ required: "Subject name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Mathematics, Physics" {...field} />
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
                    <FormLabel>Subject Code</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. MATH101, PHY201" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe this subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="subject_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {subjectTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="grading_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grading Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grading type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {gradingTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="max_marks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Marks</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="e.g. 100" 
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="weightage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weightage (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        max="100"
                        placeholder="e.g. 50" 
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormDescription>
                      Importance in evaluation (0-100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {subject ? "Save Changes" : "Create Subject"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
