
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useBatchManagement } from "@/hooks/useBatchManagement";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuardianManagement } from "./GuardianManagement";
import { Guardian } from "@/types/student";
import { toast } from "sonner";

const formSchema = z.object({
  admission_number: z.string().min(1, "Admission number is required"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.preprocess(
    (val) => (typeof val === "string" && val.trim() === "" ? undefined : val),
    z.string().email("Invalid email address").optional()
  ),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select a gender",
  }),
  academic_year_id: z.string().min(1, "Academic year is required"),
  batch_id: z.string().min(1, "Batch is required"),
  school_id: z.string().min(1, "School ID is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStudentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormValues & { guardians?: Guardian[] }) => Promise<void>;
}

export function AddStudentForm({ isOpen, onClose, onSubmit }: AddStudentFormProps) {
  const { profile } = useAuth();
  const { academicYears } = useAcademicYears();
  const { activeBatches } = useBatchManagement();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [guardians, setGuardians] = useState<Guardian[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      admission_number: "",
      first_name: "",
      last_name: "",
      email: "",
      gender: undefined,
      academic_year_id: "",
      batch_id: "",
      school_id: profile?.school_id || "",
    },
  });

  const selectedAcademicYearId = form.watch("academic_year_id");
  const filteredBatches = activeBatches.filter(
    (batch) => batch.academic_year_id === selectedAcademicYearId
  );

  const handleSubmit = async (values: FormValues) => {
    if (!profile?.school_id) {
      toast.error("School ID not found. Please try again or contact support.");
      return;
    }

    // Validate guardians
    if (guardians.length === 0) {
      toast.error("At least one guardian is required.");
      setActiveTab("guardians");
      return;
    }

    const incompleteGuardians = guardians.filter(
      g => !g.first_name || !g.relation || !g.phone
    );

    if (incompleteGuardians.length > 0) {
      toast.error("Please complete all required guardian fields (Name, Relationship, Phone).");
      setActiveTab("guardians");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...values,
        school_id: profile.school_id,
        guardians: guardians
      });
      form.reset();
      setGuardians([]);
      setActiveTab("basic");
      onClose();
      toast.success("Student added successfully");
    } catch (error) {
      console.error("Error adding student:", error);
      toast.error("Failed to add student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    setGuardians([]);
    setActiveTab("basic");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Fill in the student's details and guardian information.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="guardians">Guardian Management</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4">
            <TabsContent value="basic" className="space-y-4 px-1">
              <Form {...form}>
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="admission_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admission Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter admission number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="academic_year_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Academic Year</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("batch_id", ""); // Reset batch when academic year changes
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select academic year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem key={year.id} value={year.id}>
                                {year.name}
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
                    name="batch_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedAcademicYearId}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={
                                !selectedAcademicYearId
                                  ? "Select academic year first"
                                  : filteredBatches.length === 0
                                    ? "No batches available"
                                    : "Select batch"
                              } />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {filteredBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.name} - {batch.course?.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </TabsContent>

            <TabsContent value="guardians" className="space-y-4 px-1">
              <GuardianManagement
                guardians={guardians}
                onGuardiansChange={setGuardians}
                schoolId={profile?.school_id || ""}
              />
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)}
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Student"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
