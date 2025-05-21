
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
import { Loader2, AlertTriangle, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Types
import type { School, SchoolFormData } from "@/types/school";
import { 
  AuthUserDetails, 
  fetchAuthUserDetails, 
  isValidAuthUserResponse 
} from "@/utils/authUtils";

// Components
import AuthUserDetailView from "@/components/auth/AuthUserDetailView";

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

// Define a type for user metadata from get_user_metadata_by_email
interface UserMetadata {
  id: string;
  email: string;
  created_at: string;
  user_metadata: {
    first_name?: string;
    last_name?: string;
    role?: string;
    [key: string]: any;
  };
}

const SchoolEditModal: React.FC<SchoolEditModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  schoolData,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminData, setAdminData] = useState<UserMetadata | null>(null);
  const [loadingAdmin, setLoadingAdmin] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [authUserDetails, setAuthUserDetails] = useState<AuthUserDetails | null>(null);
  const [isLoadingAuthDetails, setIsLoadingAuthDetails] = useState(false);
  const [isAuthDetailViewOpen, setIsAuthDetailViewOpen] = useState(false);

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
          
          if (data && typeof data === 'object') {
            // Safely cast the data to our expected type with an intermediate unknown cast
            const userData = data as unknown as UserMetadata;
            setAdminData(userData);
            
            // Update form with admin data
            if (userData.user_metadata && typeof userData.user_metadata === 'object') {
              form.setValue('admin_first_name', userData.user_metadata.first_name || '');
              form.setValue('admin_last_name', userData.user_metadata.last_name || '');
            }
            form.setValue('admin_email', schoolData.admin_email);

            // Fetch additional auth user details
            fetchAuthUserDetailsData(userData.id);
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

  // Fetch auth user details
  const fetchAuthUserDetailsData = async (userId: string) => {
    setIsLoadingAuthDetails(true);
    try {
      // Use the imported utility function for fetching auth user details
      const { success, data, error } = await fetchAuthUserDetails(userId);
      
      if (success && data) {
        setAuthUserDetails(data);
      } else if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Error fetching auth user details:", error);
      toast({
        title: "Error",
        description: `Failed to fetch auth user details: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsLoadingAuthDetails(false);
    }
  };

  const handleOpenAuthDetails = () => {
    setIsAuthDetailViewOpen(true);
  };

  const handleCloseAuthDetails = () => {
    setIsAuthDetailViewOpen(false);
  };

  const handleRefreshAuthDetails = () => {
    if (adminData?.id) {
      fetchAuthUserDetailsData(adminData.id);
    }
  };

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
            variant: "destructive",
          });
          
          // Ensure we pass all required fields for SchoolFormData
          onUpdate({
            id: schoolData.id,
            name: values.name,
            admin_email: values.admin_email, // Make sure this is always included
            admin_first_name: values.admin_first_name,
            admin_last_name: values.admin_last_name,
            domain: values.domain,
            contact_number: values.contact_number,
            region: values.region,
            status: values.status
          });
          onClose();
          return;
        }
      }

      // Build a properly typed SchoolFormData object
      const formattedData: SchoolFormData = {
        id: schoolData.id,
        name: values.name,
        domain: values.domain,
        admin_email: values.admin_email,
        admin_first_name: values.admin_first_name,
        admin_last_name: values.admin_last_name,
        contact_number: values.contact_number,
        region: values.region,
        status: values.status
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
    <>
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
              <div className="grid grid-cols-1 gap-6">
                {/* School Information */}
                <div className="space-y-4">
                  <h3 className="font-medium text-lg">School Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  
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
                
                {/* Administrator Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-lg">Administrator Account</h3>
                    
                    {adminData && authUserDetails && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleOpenAuthDetails}
                        type="button"
                      >
                        Authentication Settings
                      </Button>
                    )}
                  </div>
                  
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  </div>
                  
                  {authUserDetails && (
                    <div className="mt-4 bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Account Status</h4>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Email Confirmed:</span>
                          <Badge variant={authUserDetails.email_confirmed ? "success" : "outline"}>
                            {authUserDetails.email_confirmed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Phone Confirmed:</span>
                          <Badge variant={authUserDetails.phone_confirmed ? "success" : "outline"}>
                            {authUserDetails.phone_confirmed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Banned:</span>
                          <Badge variant={authUserDetails.is_banned ? "destructive" : "outline"}>
                            {authUserDetails.is_banned ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}
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

      {/* Auth User Detail View Dialog */}
      <AuthUserDetailView
        isOpen={isAuthDetailViewOpen}
        onClose={handleCloseAuthDetails}
        userData={authUserDetails}
        onRefresh={handleRefreshAuthDetails}
      />
    </>
  );
};

export default SchoolEditModal;

// force update
