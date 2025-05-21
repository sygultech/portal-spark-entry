
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
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
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { AcademicYear } from "@/types/academic";

interface AcademicYearFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AcademicYearFormValues) => Promise<void>;
  academicYear?: AcademicYear;
  isCloning?: boolean;
}

export interface AcademicYearFormValues {
  name: string;
  start_date: Date;
  end_date: Date;
  is_current: boolean;
  is_locked: boolean;
}

const AcademicYearFormDialog = ({
  isOpen,
  onClose,
  onSubmit,
  academicYear,
  isCloning = false
}: AcademicYearFormDialogProps) => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const isEditing = !!academicYear && !isCloning;
  
  // Initialize the form with the academic year data or default values
  const form = useForm<AcademicYearFormValues>({
    defaultValues: {
      name: "",
      start_date: new Date(),
      end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
      is_current: false,
      is_locked: false
    }
  });
  
  // Update form values when academicYear changes
  useEffect(() => {
    if (academicYear) {
      const formValues = {
        name: isCloning ? `${academicYear.name} (Copy)` : academicYear.name,
        start_date: isCloning 
          ? new Date(new Date(academicYear.end_date).setDate(new Date(academicYear.end_date).getDate() + 1)) 
          : new Date(academicYear.start_date),
        end_date: isCloning 
          ? new Date(new Date(academicYear.end_date).setFullYear(new Date(academicYear.end_date).getFullYear() + 1)) 
          : new Date(academicYear.end_date),
        is_current: isCloning ? false : academicYear.is_current,
        is_locked: isCloning ? false : academicYear.is_locked
      };
      
      form.reset(formValues);
    } else {
      form.reset({
        name: "",
        start_date: new Date(),
        end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        is_current: false,
        is_locked: false
      });
    }
  }, [academicYear, form, isCloning]);
  
  const handleFormSubmit = async (values: AcademicYearFormValues) => {
    if (!profile?.school_id) return;
    
    try {
      setLoading(true);
      await onSubmit(values);
      onClose();
    } catch (error) {
      console.error("Error submitting academic year form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing 
              ? "Edit Academic Year" 
              : isCloning 
              ? "Clone Academic Year" 
              : "Create Academic Year"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Update the details for this academic year." 
              : isCloning 
              ? "Create a new academic year based on the selected one." 
              : "Create a new academic year for your school."}
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
                    <Input placeholder="e.g. 2025-2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="start_date"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const endDate = form.getValues("end_date");
                            return endDate && date > endDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                rules={{ required: "End date is required" }}
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("start_date");
                            return startDate && date < startDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="is_current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Current Academic Year</FormLabel>
                      <FormDescription className="text-xs">
                        Set as the active academic year for your school.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_locked"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Lock Academic Year</FormLabel>
                      <FormDescription className="text-xs">
                        Prevent modifications to this academic year.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        disabled={isEditing && academicYear?.is_current}
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
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

export default AcademicYearFormDialog;

// force update

// force update
