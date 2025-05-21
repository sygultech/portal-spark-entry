
import { useState, useEffect } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GradingSystem } from "@/types/academic";
import { Trash2, Plus, ArrowUpDown } from "lucide-react";

const thresholdSchema = z.object({
  id: z.string().optional(),
  grade: z.string().min(1, "Grade is required"),
  name: z.string().min(1, "Description is required"),
  min_score: z.coerce.number().min(0, "Min score must be ≥ 0").max(100, "Min score must be ≤ 100"),
  max_score: z.coerce.number().min(0, "Max score must be ≥ 0").max(100, "Max score must be ≤ 100"),
  grade_point: z.coerce.number().min(0).optional(),
});

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  type: z.enum(["marks", "grades", "hybrid"], {
    required_error: "Please select a grading system type",
  }),
  description: z.string().optional(),
  passing_score: z.coerce.number().min(0, "Passing score must be ≥ 0").max(100, "Passing score must be ≤ 100"),
  thresholds: z.array(thresholdSchema)
    .min(1, "At least one threshold is required")
    .refine((thresholds) => {
      // Check for overlapping ranges
      const sorted = [...thresholds].sort((a, b) => a.min_score - b.min_score);
      for (let i = 0; i < sorted.length - 1; i++) {
        if (sorted[i].max_score > sorted[i + 1].min_score) {
          return false;
        }
      }
      return true;
    }, "Threshold ranges cannot overlap")
    .refine((thresholds) => {
      // Check that min < max for each threshold
      return thresholds.every(t => t.min_score < t.max_score);
    }, "Min score must be less than max score for each threshold")
    .refine((thresholds) => {
      // Check if thresholds cover the full range 0-100
      const sorted = [...thresholds].sort((a, b) => a.min_score - b.min_score);
      return sorted[0].min_score === 0 && sorted[sorted.length - 1].max_score === 100;
    }, "Thresholds must cover the full range from 0 to 100"),
});

type FormValues = z.infer<typeof formSchema>;

interface GradingSystemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  system: GradingSystem | null;
  onSubmit: (data: FormValues) => void;
}

export const GradingSystemDialog: React.FC<GradingSystemDialogProps> = ({
  isOpen,
  onClose,
  system,
  onSubmit,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: FormValues = {
    name: "",
    type: "marks",
    description: "",
    passing_score: 33,
    thresholds: [
      { grade: "A", name: "Excellent", min_score: 0, max_score: 100 },
    ],
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "thresholds",
  });

  // Reset form when dialog opens with system data or default values
  useEffect(() => {
    if (isOpen) {
      if (system) {
        // Format thresholds data from the server
        const formattedThresholds = system.thresholds?.map(threshold => ({
          id: threshold.id,
          grade: threshold.grade,
          name: threshold.name,
          min_score: threshold.min_score,
          max_score: threshold.max_score,
          grade_point: threshold.grade_point || undefined,
        })) || [];

        form.reset({
          name: system.name,
          type: system.type,
          description: system.description || "",
          passing_score: system.passing_score,
          thresholds: formattedThresholds.length > 0
            ? formattedThresholds
            : defaultValues.thresholds,
        });
      } else {
        form.reset(defaultValues);
      }
    }
  }, [isOpen, system, form]);

  const addThreshold = () => {
    append({ grade: "", name: "", min_score: 0, max_score: 0 });
  };

  const sortThresholdsByScore = () => {
    const values = form.getValues("thresholds");
    const sorted = [...values].sort((a, b) => a.min_score - b.min_score);
    
    // Update the form with sorted values
    form.setValue("thresholds", sorted);
  };

  const handleFormSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {system ? "Edit Grading System" : "Create Grading System"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Standard Grading" {...field} />
                    </FormControl>
                    <FormDescription>
                      A unique name for this grading system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grading type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="marks">Marks Based</SelectItem>
                        <SelectItem value="grades">Grade Based</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Marks & Grades)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      How grades are calculated and displayed
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="A description of this grading system"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Optional details about this grading system
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="passing_score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Passing Score (%)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum score needed to pass (0-100)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Grade Thresholds</h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={sortThresholdsByScore}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-1" />
                    Sort by Score
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addThreshold}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Threshold
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 rounded-md border"
                  >
                    <FormField
                      control={form.control}
                      name={`thresholds.${index}.grade`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grade</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. A+" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`thresholds.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Excellent" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`thresholds.${index}.min_score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Min Score</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`thresholds.${index}.max_score`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Score</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" max="100" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(form.watch("type") === "grades" || form.watch("type") === "hybrid") && (
                      <FormField
                        control={form.control}
                        name={`thresholds.${index}.grade_point`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade Point</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0"
                                step="0.01" 
                                {...field}
                                value={field.value === undefined ? '' : field.value}
                                onChange={(e) => {
                                  const value = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                  field.onChange(value);
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    <div className="flex items-end md:col-span-5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => fields.length > 1 && remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {form.formState.errors.thresholds?.root && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.thresholds.root.message}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : system
                  ? "Update Grading System"
                  : "Create Grading System"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
