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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, AlertTriangle, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";

// Types
import type { School, SchoolFormData } from "@/types/school";
import { Json } from "@/integrations/supabase/types";
import { updateAuthUserDetails } from "@/utils/authUtils";

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

interface AuthUserDetails {
  id: string;
  email: string;
  phone: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  user_metadata: Record<string, any>;
  app_metadata: Record<string, any>;
  email_confirmed: boolean;
  phone_confirmed: boolean;
  is_banned: boolean;
  banned_until: string | null;
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

// Helper function to safely type check and convert Supabase RPC response
function isValidAuthUserResponse(data: any): data is AuthUserDetails {
  return (
    data &&
    typeof data === 'object' &&
    'id' in data &&
    'email' in data &&
    'email_confirmed' in data &&
    'phone_confirmed' in data &&
    'is_banned' in data
  );
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
  const [activeTab, setActiveTab] = useState("school-info");
  const [authUserDetails, setAuthUserDetails] = useState<AuthUserDetails | null>(null);
  const [isLoadingAuthDetails, setIsLoadingAuthDetails] = useState(false);

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
            fetchAuthUserDetails(userData.id);
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
  const fetchAuthUserDetails = async (userId: string) => {
    setIsLoadingAuthDetails(true);
    try {
      const { data, error } = await supabase.rpc(
        'get_auth_user_details',
        { p_user_id: userId }
      );
      
      if (error) throw error;
      
      if (data && typeof data === 'object') {
        // Validate the response using our type guard
        if (isValidAuthUserResponse(data)) {
          setAuthUserDetails(data);
        } else {
          throw new Error("Invalid user details format returned from database");
        }
      } else {
        throw new Error("Invalid data format returned from database");
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

  // Update auth user details function - now using the imported utility
  const handleAuthSettingsUpdate = async () => {
    if (!authUserDetails || !adminData?.id) return;
    
    setIsSubmitting(true);
    
    try {
      // Use the utility function from authUtils
      const { success, data, error } = await updateAuthUserDetails(adminData.id, {
        email: authUserDetails.email,
        phone: authUserDetails.phone,
        emailConfirmed: authUserDetails.email_confirmed,
        phoneConfirmed: authUserDetails.phone_confirmed,
        isBanned: authUserDetails.is_banned
      });
      
      if (success && data) {
        // If the response is valid, update the local state
        if (isValidAuthUserResponse(data)) {
          setAuthUserDetails(data);
          
          toast({
            title: "Auth settings updated",
            description: "User authentication settings have been updated successfully",
          });
        }
      } else if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error updating auth settings",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle auth user settings
  const toggleAuthSetting = (field: keyof AuthUserDetails, value: boolean) => {
    if (!authUserDetails) return;
    
    setAuthUserDetails({
      ...authUserDetails,
      [field]: value
    });
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit School</DialogTitle>
          <DialogDescription>
            Update school details and administrator information.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="school-info">School Info</TabsTrigger>
            <TabsTrigger value="auth-settings" disabled={!adminData?.id}>Auth Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="school-info" className="mt-4">
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
          </TabsContent>
          
          <TabsContent value="auth-settings" className="mt-4">
            {isLoadingAuthDetails ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Loading authentication details...</span>
              </div>
            ) : authUserDetails ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Authentication Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage user authentication settings and account status.
                  </p>
                  
                  <Alert>
                    <AlertDescription>
                      These settings directly modify the auth.users table. Changes take effect immediately.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">User Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Email:</span> {authUserDetails.email}</p>
                        <p><span className="font-medium">Phone:</span> {authUserDetails.phone || 'Not set'}</p>
                        <p><span className="font-medium">Created:</span> {new Date(authUserDetails.created_at).toLocaleString()}</p>
                        <p><span className="font-medium">Last Sign In:</span> {authUserDetails.last_sign_in_at ? new Date(authUserDetails.last_sign_in_at).toLocaleString() : 'Never'}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Account Status</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Email Confirmed</p>
                            <p className="text-sm text-muted-foreground">User has verified their email address</p>
                          </div>
                          <Switch 
                            checked={authUserDetails.email_confirmed}
                            onCheckedChange={(value) => toggleAuthSetting('email_confirmed', value)} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Phone Confirmed</p>
                            <p className="text-sm text-muted-foreground">User has verified their phone number</p>
                          </div>
                          <Switch 
                            checked={authUserDetails.phone_confirmed}
                            onCheckedChange={(value) => toggleAuthSetting('phone_confirmed', value)}
                          />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Account Banned</p>
                            <p className="text-sm text-muted-foreground">Prevent user from signing in</p>
                          </div>
                          <Switch 
                            checked={authUserDetails.is_banned}
                            onCheckedChange={(value) => toggleAuthSetting('is_banned', value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">User Metadata</h4>
                    <div className="bg-muted p-3 rounded text-sm font-mono overflow-auto max-h-32">
                      <pre>{JSON.stringify(authUserDetails.user_metadata, null, 2)}</pre>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleAuthSettingsUpdate} 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating Auth Settings...
                      </>
                    ) : (
                      <>Update Auth Settings</>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="py-8 text-center">
                <AlertTriangle className="mx-auto h-8 w-8 text-amber-500" />
                <h3 className="mt-2 text-lg font-medium">Auth user details not found</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unable to load authentication details for this user.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolEditModal;
