import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// UI components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

// Types
import type { SchoolFormData } from "@/types/school";
import type { Json } from "@/integrations/supabase/types";

const formSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  domain: z.string().optional(),
  region: z.string().optional(),
  contact_number: z.string().optional(),
  admin_email: z.string().email("Invalid email address"),
  admin_first_name: z.string().min(2, "First name must be at least 2 characters"),
  admin_last_name: z.string().min(2, "Last name must be at least 2 characters"),
  admin_password: z.string().min(8, "Password must be at least 8 characters"),
  status: z.enum(["active", "suspended", "expired", "pending"]).optional(),
});

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => void;
  editData?: SchoolFormData;
}

const SchoolFormModal: React.FC<SchoolFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editData,
}) => {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: editData?.name || "",
      domain: editData?.domain || "",
      region: editData?.region || "",
      contact_number: editData?.contact_number || "",
      admin_email: editData?.admin_email || "",
      admin_first_name: editData?.admin_first_name || "",
      admin_last_name: editData?.admin_last_name || "",
      admin_password: "",
      status: editData?.status as "active" | "suspended" | "expired" | "pending" || "active",
    },
  });

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      // 1. Create the school record
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: values.name,
          domain: values.domain || null,
          region: values.region || null,
          contact_number: values.contact_number || null,
          admin_email: values.admin_email,
          status: values.status || "active",
        })
        .select()
        .single();

      if (schoolError) {
        throw schoolError;
      }

      // 2. Create the admin user using the edge function
      const response = await supabase.functions.invoke('create-admin-user', {
        body: {
          admin_email: values.admin_email,
          admin_password: values.admin_password,
          admin_first_name: values.admin_first_name,
          admin_last_name: values.admin_last_name,
          admin_school_id: schoolData.id
        }
      });

      if (response.error) {
        // If admin creation fails, delete the school
        await supabase.from("schools").delete().eq("id", schoolData.id);
        throw new Error(`Failed to create admin user: ${response.error.message || response.error}`);
      }

      // Build a properly typed SchoolFormData object
      const formattedData: SchoolFormData = {
        id: schoolData.id,
        name: schoolData.name,
        domain: schoolData.domain,
        admin_email: schoolData.admin_email || values.admin_email,
        admin_first_name: values.admin_first_name,
        admin_last_name: values.admin_last_name,
        contact_number: schoolData.contact_number,
        region: schoolData.region,
        status: schoolData.status as "active" | "suspended" | "expired" | "pending"
      };

      onSubmit(formattedData);
      onClose();

      toast({
        title: "School created successfully",
        description: `School "${values.name}" has been added with admin ${values.admin_email}`,
      });
    } catch (error: any) {
      console.error("Error creating school:", error);
      toast({
        title: "Error creating school",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit School" : "Add New School"}</DialogTitle>
          <DialogDescription>
            {editData
              ? "Update school details and configuration."
              : "Create a new school and assign an administrator."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="font-medium">School Information</h3>
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Domain</FormLabel>
                      <FormControl>
                        <Input placeholder="school.edu" {...field} />
                      </FormControl>
                      <FormDescription>
                        The domain used for school email accounts
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="North America" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium">Administrator Account</h3>
                
                <FormField
                  control={form.control}
                  name="admin_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email*</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="admin@school.edu" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="admin_first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="admin_last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="admin_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password*</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Minimum 8 characters" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Create School</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFormModal;
