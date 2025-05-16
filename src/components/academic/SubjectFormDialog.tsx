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
import { Checkbox } from "@/components/ui/checkbox";

export interface SubjectFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  academicYearId: string;
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
  subject,
  academicYearId
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
      is_mandatory: true
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
        is_mandatory: true
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
        is_mandatory: true
      });
    }
  }, [subject, form]);
  
  const subjectTypes = [
    { value: "theory", label: "Theory" },
    { value: "practical", label: "Practical" },
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
            {subject ? "Update subject details" : "Create a new subject"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Name is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Mathematics" {...field} />
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
                    <Input placeholder="e.g. MATH101" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique code to identify this subject (optional)
                  </FormDescription>
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
                      placeholder="Enter a description of the subject"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </SelectItem>
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
                    <FormLabel>Subject Nature</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjectTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The nature or method of teaching this subject
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="grading_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grading Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grading type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {gradingTypes.map((type) => (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                          >
                            {type.label}
                          </SelectItem>
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
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="is_mandatory"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make subject mandatory
                    </FormLabel>
                    <FormDescription>
                      If checked, students must complete this subject to progress. If unchecked, this will be an elective subject.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
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
