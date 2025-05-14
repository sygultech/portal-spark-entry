
import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { SchoolFormData } from "@/types/school";

// Define the form validation schema
const formSchema = z.object({
  name: z.string().min(2, "School name must be at least 2 characters"),
  domain: z.string().optional(),
  admin_email: z.string().email("Please enter a valid email"),
  admin_first_name: z.string().min(1, "First name is required"),
  admin_last_name: z.string().min(1, "Last name is required"),
  admin_password: z.string().min(6, "Password must be at least 6 characters").optional(),
  contact_number: z.string().optional(),
  region: z.string().optional(),
  status: z.enum(["active", "suspended", "pending"]).default("active"),
});

interface SchoolFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SchoolFormData) => void;
}

const SchoolFormModal: React.FC<SchoolFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      domain: "",
      admin_email: "",
      admin_first_name: "",
      admin_last_name: "",
      admin_password: "",
      contact_number: "",
      region: "",
      status: "active",
    },
  });

  // Handle form submission
  const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Creating school with data:", { name: values.name });
      
      // First, create the school with basic fields
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: values.name,
          domain: values.domain,
          admin_email: values.admin_email,
          contact_number: values.contact_number,
          region: values.region,
          status: values.status
        })
        .select();

      if (schoolError) {
        console.error("School creation error:", schoolError);
        throw schoolError;
      }

      if (!schoolData || schoolData.length === 0) {
        throw new Error("Failed to create school record");
      }

      // Create school admin user if password is provided
      if (values.admin_password && schoolData && schoolData[0]) {
        try {
          console.log("Creating school admin user");
          
          // First try to see if user already exists
          const { data: existingUser } = await supabase
            .from("profiles")
            .select("*")
            .eq("email", values.admin_email)
            .maybeSingle();
            
          if (existingUser) {
            // Update existing user to school_admin role and link to school
            await supabase
              .from("profiles")
              .update({
                role: "school_admin",
                school_id: schoolData[0].id
              })
              .eq("email", values.admin_email);
              
            toast({
              title: "School Created",
              description: `${values.name} has been created. Existing user ${values.admin_email} was linked as admin.`,
            });
          } else {
            // Create new user
            const { error: signUpError } = await supabase.auth.signUp({
              email: values.admin_email,
              password: values.admin_password,
              options: {
                data: {
                  first_name: values.admin_first_name,
                  last_name: values.admin_last_name,
                  role: "school_admin",
                  school_id: schoolData[0].id
                },
              },
            });

            if (signUpError) {
              console.error("Admin signup error:", signUpError);
              throw signUpError;
            }

            // Wait a moment for the auth trigger to create the profile
            setTimeout(async () => {
              try {
                console.log("Updating admin profile");
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
                  
                  console.log("Admin profile updated successfully");
                }
              } catch (error) {
                console.error("Error updating admin profile:", error);
              }
            }, 1000);
            
            toast({
              title: "School Created",
              description: `${values.name} has been successfully created with admin user.`,
            });
          }
        } catch (adminError: any) {
          console.error("Admin creation error:", adminError);
          setError(`School was created, but there was an error creating the admin user: ${adminError.message}`);
          
          // Continue despite admin creation error
          toast({
            title: "Partial Success",
            description: `${values.name} was created, but admin user creation failed.`,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "School Created",
          description: `${values.name} has been successfully created.`,
        });
      }

      // Convert form values to SchoolFormData before passing to onSubmit
      const schoolFormData: SchoolFormData = {
        ...values,
        id: schoolData[0].id
      };

      onSubmit(schoolFormData);
      onClose();
      form.reset(); // Reset the form after submission
      
    } catch (error: any) {
      console.error("School creation error:", error);
      setError(error.message || "An unknown error occurred");
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New School</DialogTitle>
          <DialogDescription>
            Add a new school to the system. This will create a new tenant.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Admin Information</h3>
            
            <FormField
              control={form.control}
              name="admin_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Email *</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@school.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
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
            
            <FormField
              control={form.control}
              name="admin_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin Password *</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Minimum 6 characters" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Separator className="my-4" />
            <h3 className="text-lg font-medium">Additional Information</h3>
            
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
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create School"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFormModal;
