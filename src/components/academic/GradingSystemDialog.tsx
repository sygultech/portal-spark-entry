import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { GradingSystem, GradeThreshold } from "@/types/academic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

interface GradingSystemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  system?: GradingSystem | null;
}

interface GradeThresholdWithPoints extends GradeThreshold {
  grade_point?: number;
}

export const GradingSystemDialog = ({
  isOpen,
  onClose,
  system
}: GradingSystemDialogProps) => {
  const form = useForm<GradingSystem & { thresholds: GradeThresholdWithPoints[] }>({
    defaultValues: {
      name: "",
      type: "marks",
      description: "",
      passing_score: 33,
      thresholds: [
        { grade: "A+", min_score: 90, max_score: 100, grade_point: 4.0 }
      ]
    }
  });

  const type = form.watch("type");

  useEffect(() => {
    if (system) {
      form.reset(system);
    } else {
      form.reset({
        name: "",
        type: "marks",
        description: "",
        passing_score: 33,
        thresholds: getDefaultThresholds("marks")
      });
    }
  }, [system, form]);

  const getDefaultThresholds = (type: string): GradeThresholdWithPoints[] => {
    switch (type) {
      case "marks":
        return [
          { grade: "A+", min_score: 90, max_score: 100 },
          { grade: "A", min_score: 80, max_score: 89 },
          { grade: "B+", min_score: 70, max_score: 79 },
          { grade: "B", min_score: 60, max_score: 69 },
          { grade: "C", min_score: 50, max_score: 59 },
          { grade: "D", min_score: 33, max_score: 49 },
          { grade: "F", min_score: 0, max_score: 32 }
        ];
      case "grades":
        return [
          { grade: "A+", min_score: 0, max_score: 0 },
          { grade: "A", min_score: 0, max_score: 0 },
          { grade: "B+", min_score: 0, max_score: 0 },
          { grade: "B", min_score: 0, max_score: 0 },
          { grade: "C", min_score: 0, max_score: 0 },
          { grade: "F", min_score: 0, max_score: 0 }
        ];
      case "hybrid":
        return [
          { grade: "A+", min_score: 90, max_score: 100, grade_point: 4.0 },
          { grade: "A", min_score: 80, max_score: 89, grade_point: 3.7 },
          { grade: "B+", min_score: 70, max_score: 79, grade_point: 3.3 },
          { grade: "B", min_score: 60, max_score: 69, grade_point: 3.0 },
          { grade: "C+", min_score: 50, max_score: 59, grade_point: 2.7 },
          { grade: "C", min_score: 40, max_score: 49, grade_point: 2.0 },
          { grade: "F", min_score: 0, max_score: 39, grade_point: 0.0 }
        ];
      default:
        return [];
    }
  };

  const handleTypeChange = (newType: string) => {
    form.setValue("thresholds", getDefaultThresholds(newType));
    if (newType === "grades") {
      form.setValue("passing_score", 0); // Not applicable for grade-based
    }
  };

  const onSubmit = (data: GradingSystem) => {
    console.log("Form data:", data);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {system ? "Edit Grading System" : "Create Grading System"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic Details</TabsTrigger>
                <TabsTrigger value="thresholds">Grade Thresholds</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Standard Grading" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  rules={{ required: "Type is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        Type
                        <HoverCard>
                          <HoverCardTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="font-semibold">Grading Types:</h4>
                              <div>
                                <span className="font-medium">Marks Based:</span> Uses numerical scores (0-100) and converts to grades
                              </div>
                              <div>
                                <span className="font-medium">Grade Based:</span> Direct grade assignments without numerical scores
                              </div>
                              <div>
                                <span className="font-medium">Hybrid:</span> Uses both marks and grade points (for GPA)
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleTypeChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="marks">Marks Based</SelectItem>
                          <SelectItem value="grades">Grade Based</SelectItem>
                          <SelectItem value="hybrid">Hybrid (Marks & Grade Points)</SelectItem>
                        </SelectContent>
                      </Select>
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
                        <Input placeholder="Brief description of the grading system" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {type !== "grades" && (
                  <FormField
                    control={form.control}
                    name="passing_score"
                    rules={{ required: "Passing score is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Passing Score (%)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>

              <TabsContent value="thresholds" className="space-y-4">
                <div className="space-y-4">
                  {form.watch("thresholds").map((threshold, index) => (
                    <div key={index} className="grid gap-2 items-start" style={{ 
                      gridTemplateColumns: type === "hybrid" 
                        ? "2fr 1fr 1fr 1fr 40px"
                        : type === "grades"
                        ? "1fr 40px"
                        : "2fr 1fr 1fr 40px"
                    }}>
                      <FormField
                        control={form.control}
                        name={`thresholds.${index}.grade`}
                        rules={{ required: "Grade is required" }}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Grade (e.g. A+)" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {type !== "grades" && (
                        <>
                          <FormField
                            control={form.control}
                            name={`thresholds.${index}.min_score`}
                            rules={{ required: "Min score is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Min Score"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`thresholds.${index}.max_score`}
                            rules={{ required: "Max score is required" }}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    placeholder="Max Score"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {type === "hybrid" && (
                        <FormField
                          control={form.control}
                          name={`thresholds.${index}.grade_point`}
                          rules={{ required: "Grade point is required" }}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  step="0.1"
                                  placeholder="Points"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <div className="flex items-end">
                        {form.watch("thresholds").length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newThresholds = [...form.watch("thresholds")];
                              newThresholds.splice(index, 1);
                              form.setValue("thresholds", newThresholds);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const lastThreshold = form.watch("thresholds").slice(-1)[0];
                      const newThreshold: GradeThresholdWithPoints = type === "grades"
                        ? { grade: "", min_score: 0, max_score: 0 }
                        : type === "hybrid"
                        ? {
                            grade: "",
                            min_score: Math.max(0, (lastThreshold?.min_score || 90) - 10),
                            max_score: Math.max(0, (lastThreshold?.max_score || 100) - 10),
                            grade_point: Math.max(0, (lastThreshold?.grade_point || 4.0) - 0.3)
                          }
                        : {
                            grade: "",
                            min_score: Math.max(0, (lastThreshold?.min_score || 90) - 10),
                            max_score: Math.max(0, (lastThreshold?.max_score || 100) - 10)
                          };
                      form.setValue("thresholds", [...form.watch("thresholds"), newThreshold]);
                    }}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Grade Threshold
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {system ? "Save Changes" : "Create System"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 