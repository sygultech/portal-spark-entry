
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

import type { School, SchoolFormData } from "@/types/school";

// Define form validation schema
const formSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  domain: z.string().optional(),
  admin_email: z.string().email("Please enter a valid email"),
  admin_first_name: z.string().min(1, "First name is required"),
  admin_last_name: z.string().min(1, "Last name is required"),
  admin_password: z.string().min(6, "Password must be at least 6 characters").optional(),
  contact_number: z.string().optional(),
  region: z.string().optional(),
  timezone: z.string().optional(),
  plan: z.enum(["free", "basic", "premium"]).default("free"),
  status: z.enum(["active", "suspended", "expired", "pending"]).default("active"),
  storage_limit: z.number().int().positive().default(5120),
  user_limit: z.number().int().positive().default(100),
  modules: z.object({
    library: z.boolean().default(false),
    transport: z.boolean().default(false),
    finance: z.boolean().default(false),
    inventory: z.boolean().default(false),
    alumni: z.boolean().default(false),
    online_classes: z.boolean().default(false),
  }).default({}),
});

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => void;
  school?: School;
  isEditing?: boolean;
}

const SchoolFormModal: React.FC<SchoolFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  school,
  isEditing = false,
}) => {
  const { toast } = useToast();
  
  // Initialize form with default values or existing school data
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditing && school
      ? {
          name: school.name,
          domain: school.domain || "",
          admin_email: school.admin_email || "",
          admin_first_name: "", // We don't have these in the school object
          admin_last_name: "", // We don't have these in the school object
          contact_number: school.contact_number || "",
          region: school.region || "",
          timezone: school.timezone || "",
          plan: (school.plan as "free" | "basic" | "premium") || "free",
          status: (school.status as "active" | "suspended" | "expired" | "pending") || "active",
          storage_limit: school.storage_limit || 5120,
          user_limit: school.user_limit || 100,
          modules: school.modules || {
            library: false,
            transport: false,
            finance: false,
            inventory: false,
            alumni: false,
            online_classes: false,
          },
        }
      : {
          name: "",
          domain: "",
          admin_email: "",
          admin_first_name: "",
          admin_last_name: "",
          admin_password: "",
          contact_number: "",
          region: "",
          timezone: "",
          plan: "free",
          status: "active",
          storage_limit: 5120, // 5GB
          user_limit: 100,
          modules: {
            library: false,
            transport: false,
            finance: false,
            inventory: false,
            alumni: false,
            online_classes: false,
          },
        },
  });

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (isEditing && school) {
        // Update existing school
        const { error } = await supabase
          .from("schools")
          .update({
            name: values.name,
            domain: values.domain,
            admin_email: values.admin_email,
            contact_number: values.contact_number,
            region: values.region,
            timezone: values.timezone,
            plan: values.plan,
            status: values.status,
            storage_limit: values.storage_limit,
            user_limit: values.user_limit,
            modules: values.modules,
          })
          .eq("id", school.id);

        if (error) throw error;

        toast({
          title: "School Updated",
          description: `${values.name} has been successfully updated`,
        });

      } else {
        // Create new school
        const { data: schoolData, error: schoolError } = await supabase
          .from("schools")
          .insert({
            name: values.name,
            domain: values.domain,
            admin_email: values.admin_email,
            contact_number: values.contact_number,
            region: values.region,
            timezone: values.timezone,
            plan: values.plan,
            status: values.status,
            storage_limit: values.storage_limit,
            user_limit: values.user_limit,
            modules: values.modules,
          })
          .select();

        if (schoolError) throw schoolError;

        // Create school admin user if password is provided
        if (values.admin_password && schoolData && schoolData[0]) {
          const { error: signUpError } = await supabase.auth.signUp({
            email: values.admin_email,
            password: values.admin_password,
            options: {
              data: {
                first_name: values.admin_first_name,
                last_name: values.admin_last_name,
                role: "school_admin",
              },
            },
          });

          if (signUpError) throw signUpError;

          // Update the newly created user's profile to link it to the school
          setTimeout(async () => {
            const { data: userData } = await supabase
              .from("profiles")
              .select()
              .eq("email", values.admin_email)
              .single();

            if (userData) {
              await supabase
                .from("profiles")
                .update({
                  school_id: schoolData[0].id,
                  role: "school_admin",
                })
                .eq("id", userData.id);
            }
          }, 1000); // Give some time for the auth trigger to create the profile
        }

        toast({
          title: "School Created",
          description: `${values.name} has been successfully created`,
        });
      }

      onSubmit(values);
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit School" : "Add New School"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this school in the system."
              : "Add a new school to the system. This will create a new tenant."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="subscription">Subscription</TabsTrigger>
                <TabsTrigger value="modules">Modules</TabsTrigger>
              </TabsList>
              
              {/* Basic School Information */}
              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <FormControl>
                          <Input placeholder="school-name" {...field} />
                        </FormControl>
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
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="region"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Region</FormLabel>
                        <FormControl>
                          <Input placeholder="North America, Europe, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <FormControl>
                          <Input placeholder="UTC+0, America/New_York" {...field} />
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
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              {/* Admin Information */}
              <TabsContent value="admin" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="admin_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Admin Email *</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="admin@school.com" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="admin_first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin First Name *</FormLabel>
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
                        <FormLabel>Admin Last Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {!isEditing && (
                  <FormField
                    control={form.control}
                    name="admin_password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Password *</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Minimum 6 characters" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </TabsContent>
              
              {/* Subscription Information */}
              <TabsContent value="subscription" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="storage_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Storage Limit (MB)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 5120)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="user_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>User Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min={1}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 100)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              
              {/* Module Toggles */}
              <TabsContent value="modules" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="modules.library"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Library Module</FormLabel>
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
                    name="modules.transport"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Transport Module</FormLabel>
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
                    name="modules.finance"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Finance Module</FormLabel>
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
                    name="modules.inventory"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Inventory Module</FormLabel>
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
                    name="modules.alumni"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Alumni Module</FormLabel>
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
                    name="modules.online_classes"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                        <div className="space-y-0.5">
                          <FormLabel>Online Classes Module</FormLabel>
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
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update School" : "Create School"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFormModal;
