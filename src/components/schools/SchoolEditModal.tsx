
import React, { useState, useEffect } from "react";
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
import { Loader2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
import type { School, SchoolFormData } from "@/types/school";

const formSchema = z.object({
  name: z.string().min(3, "School name must be at least 3 characters"),
  domain: z.string().optional(),
  region: z.string().optional(),
  contact_number: z.string().optional(),
  admin_email: z.string().email("Invalid email address"),
  admin_first_name: z.string().min(2, "First name must be at least 2 characters"),
  admin_last_name: z.string().min(2, "Last name must be at least 2 characters"),
  admin_password: z.string().optional(),
  status: z.enum(["active", "suspended", "expired", "pending"]).optional(),
});

interface SchoolEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: SchoolFormData) => void;
  schoolData?: School;
}

const SchoolEditModal: React.FC<SchoolEditModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  schoolData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Create form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: schoolData?.name || "",
      domain: schoolData?.domain || "",
      region: schoolData?.region || "",
      contact_number: schoolData?.contact_number || "",
      admin_email: schoolData?.admin_email || "",
      admin_first_name: "",
      admin_last_name: "",
      admin_password: "",
      status: (schoolData?.status as "active" | "suspended" | "expired" | "pending") || "active",
    },
  });

  // Fetch admin details when modal opens and school data is available
  useEffect(() => {
    const fetchAdminData = async () => {
      if (schoolData?.admin_email && isOpen) {
        setLoadingAdmin(true);
        setAdminError(null);
        
        try {
          // Get user metadata by email using RPC
          const { data, error } = await supabase.rpc(
            'get_user_metadata_by_email',
            { email_address: schoolData.admin_email }
          );
          
          if (error) {
            throw error;
          }
          
          if (data && data.user_metadata) {
            setAdminData(data);
            
            // Update form with admin data
            form.setValue('admin_first_name', data.user_metadata.first_name || '');
            form.setValue('admin_last_name', data.user_metadata.last_name || '');
            form.setValue('admin_email', schoolData.admin_email);
          } else {
            setAdminError("Admin user data not found");
          }
        } catch (error: any) {
          console.error("Error fetching admin data:", error);
          setAdminError(error.message || "Failed to fetch admin data");
        } finally {
          setLoadingAdmin(false);
        }
      }
    };
    
    fetchAdminData();
  }, [schoolData, isOpen, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!schoolData?.id) {
      toast({
        title: "Error",
        description: "School ID is missing",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Update school details
      const { data: updatedSchool, error: schoolError } = await supabase.rpc(
        "update_school_details",
        {
          p_school_id: schoolData.id,
          p_name: values.name,
          p_domain: values.domain || null,
          p_contact_number: values.contact_number || null,
          p_region: values.region || null,
          p_status: values.status || "active",
          p_admin_email: values.admin_email
        }
      );

      if (schoolError) {
        throw schoolError;
      }

      // 2. If admin email exists, update admin user
      if (values.admin_email) {
        const { data: adminData, error: adminError } = await supabase.rpc(
          "update_admin_user",
          {
            p_email: values.admin_email,
            p_first_name: values.admin_first_name,
            p_last_name: values.admin_last_name,
            p_password: values.admin_password || null,
            p_school_id: schoolData.id
          }
        );
        
        if (adminError) {
          // If admin update fails but school update succeeded, show warning
          console.error("Error updating admin user:", adminError);
          toast({
            title: "Partial Success",
            description: `School updated but admin user update failed: ${adminError.message}`,
            variant: "warning",
          });
          onUpdate({
            ...values,
            id: schoolData.id,
          });
          onClose();
          return;
        }
      }

      // Build a properly typed SchoolFormData object
      const formattedData: SchoolFormData = {
        id: schoolData.id,
        name: values.name,
        domain: values.domain || undefined,
        admin_email: values.admin_email,
        admin_first_name: values.admin_first_name,
        admin_last_name: values.admin_last_name,
        contact_number: values.contact_number || undefined,
        region: values.region || undefined,
        status: values.status as "active" | "suspended" | "expired" | "pending" | string
      };

      onUpdate(formattedData);
      onClose();

      toast({
        title: "School updated successfully",
        description: `School "${values.name}" has been updated`,
      });
    } catch (error: any) {
      console.error("Error updating school:", error);
      toast({
        title: "Error updating school",
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
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>
            Update school details and administrator information.
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
                        <Input placeholder="school.edu" {...field} value={field.value || ""} />
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
                        <Input placeholder="+1 (555) 123-4567" {...field} value={field.value || ""} />
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
                        <Input placeholder="North America" {...field} value={field.value || ""} />
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
                
                {loadingAdmin && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading admin data...</span>
                  </div>
                )}
                
                {adminError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{adminError}</AlertDescription>
                  </Alert>
                )}
                
                {adminData && (
                  <div className="text-sm text-muted-foreground mb-4">
                    <p>Admin user ID: <Badge variant="outline" className="font-mono text-xs">{adminData.id}</Badge></p>
                    <p className="mt-1">Created: {new Date(adminData.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                
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
                      <FormDescription>
                        Changing this will reassign the school to a different admin
                      </FormDescription>
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
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Leave blank to keep current password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Only enter a password if you want to change it
                      </FormDescription>
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
                    Updating...
                  </>
                ) : (
                  <>Update School</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolEditModal;
