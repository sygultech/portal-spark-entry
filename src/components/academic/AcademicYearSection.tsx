
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, PlusCircle, Edit, Trash, Copy, Lock, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  start_date: z.string().min(1, {
    message: "Start date is required.",
  }),
  end_date: z.string().min(1, {
    message: "End date is required.",
  }),
  is_current: z.boolean().default(false),
  is_locked: z.boolean().default(false)
});

const AcademicYearSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  // Fetch academic years
  const { data: academicYears = [], isLoading } = useQuery({
    queryKey: ['academicYears', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as AcademicYear[];
    },
    enabled: !!profile?.school_id
  });

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0],
      is_current: false,
      is_locked: false
    },
  });

  // Reset form when selected year changes
  useEffect(() => {
    if (selectedYear) {
      form.reset({
        name: selectedYear.name,
        start_date: new Date(selectedYear.start_date).toISOString().split('T')[0],
        end_date: new Date(selectedYear.end_date).toISOString().split('T')[0],
        is_current: selectedYear.is_current,
        is_locked: selectedYear.is_locked
      });
    } else {
      form.reset({
        name: "",
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().getFullYear() + 1, 5, 30).toISOString().split('T')[0],
        is_current: false,
        is_locked: false
      });
    }
  }, [selectedYear, form]);

  // Create/update academic year
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!profile?.school_id) throw new Error("School ID is required");
      
      // If it's set as current, we need to update other years
      if (values.is_current) {
        await supabase
          .from('academic_years')
          .update({ is_current: false })
          .eq('school_id', profile.school_id);
      }
      
      if (selectedYear) {
        // Update
        const { data, error } = await supabase
          .from('academic_years')
          .update({
            name: values.name,
            start_date: values.start_date,
            end_date: values.end_date,
            is_current: values.is_current,
            is_locked: values.is_locked,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedYear.id)
          .select();
          
        if (error) throw error;
        return data;
      } else {
        // Create
        const { data, error } = await supabase
          .from('academic_years')
          .insert({
            name: values.name,
            start_date: values.start_date,
            end_date: values.end_date,
            is_current: values.is_current,
            is_locked: values.is_locked,
            school_id: profile.school_id
          })
          .select();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      setOpenDialog(false);
      setSelectedYear(null);
      toast({
        title: selectedYear ? "Academic Year Updated" : "Academic Year Created",
        description: selectedYear 
          ? "The academic year has been updated successfully." 
          : "The academic year has been created successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });

  // Delete academic year
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('academic_years')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast({
        title: "Academic Year Deleted",
        description: "The academic year has been deleted successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });

  // Clone academic year
  const cloneMutation = useMutation({
    mutationFn: async (year: AcademicYear) => {
      if (!profile?.school_id) throw new Error("School ID is required");
      
      // Create a new academic year with incremented years
      const startDate = new Date(year.start_date);
      const endDate = new Date(year.end_date);
      const newStartYear = startDate.getFullYear() + 1;
      const newEndYear = endDate.getFullYear() + 1;
      
      startDate.setFullYear(newStartYear);
      endDate.setFullYear(newEndYear);
      
      const newYearName = year.name.replace(/\d{4}/g, (match) => {
        const year = parseInt(match);
        return `${year + 1}`;
      });
      
      const { data, error } = await supabase
        .from('academic_years')
        .insert({
          name: newYearName || `${year.name} (Clone)`,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_current: false,
          is_locked: false,
          school_id: profile.school_id
        })
        .select();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears'] });
      toast({
        title: "Academic Year Cloned",
        description: "The academic year has been cloned successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  const handleOpenCreateDialog = () => {
    setSelectedYear(null);
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (year: AcademicYear) => {
    setSelectedYear(year);
    setOpenDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>Manage academic years for your school</CardDescription>
          </div>
          <Button onClick={handleOpenCreateDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Year
          </Button>
        </CardHeader>
        <CardContent>
          {academicYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Academic Years</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                You haven't created any academic years yet. Create your first academic year to get started.
              </p>
              <Button onClick={handleOpenCreateDialog} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Academic Year
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {academicYears.map((year) => (
                <div key={year.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{year.name}</h3>
                        {year.is_current && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Current</Badge>}
                        {year.is_locked && <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Locked</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(year.start_date)} - {formatDate(year.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => cloneMutation.mutate(year)}
                      disabled={cloneMutation.isPending}
                      title="Clone"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleOpenEditDialog(year)}
                      disabled={year.is_locked}
                      title={year.is_locked ? "This academic year is locked" : "Edit"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this academic year? This action cannot be undone.")) {
                          deleteMutation.mutate(year.id);
                        }
                      }}
                      disabled={year.is_current || year.is_locked}
                      title={
                        year.is_current 
                          ? "Cannot delete current academic year" 
                          : year.is_locked 
                          ? "This academic year is locked"
                          : "Delete"
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>
              {selectedYear ? "Edit Academic Year" : "Create Academic Year"}
            </DialogTitle>
            <DialogDescription>
              {selectedYear 
                ? "Update the details for this academic year."
                : "Add a new academic year to your school calendar."
              }
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Academic Year 2024-2025" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the academic year.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="is_current"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Set as Current Academic Year
                      </FormLabel>
                      <FormDescription>
                        This will set this academic year as the current active year.
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
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Lock Academic Year
                      </FormLabel>
                      <FormDescription>
                        Locking prevents modifications to this academic year's data.
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
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-current rounded-full"></div>
                      {selectedYear ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    selectedYear ? "Update Academic Year" : "Create Academic Year"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AcademicYearSection;
