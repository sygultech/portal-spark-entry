
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
    try {
      // Create new school with the updated schema
      const { data: schoolData, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: values.name,
          domain: values.domain,
          admin_email: values.admin_email,
          contact_number: values.contact_number,
          region: values.region,
          status: values.status,
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
          try {
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
          } catch (error) {
            console.error("Error updating admin profile:", error);
          }
        }, 1000); // Give some time for the auth trigger to create the profile
      }

      toast({
        title: "School Created",
        description: `${values.name} has been successfully created`,
      });

      // Convert form values to SchoolFormData before passing to onSubmit
      const schoolFormData: SchoolFormData = {
        name: values.name,
        domain: values.domain,
        admin_email: values.admin_email,
        admin_first_name: values.admin_first_name,
        admin_last_name: values.admin_last_name,
        admin_password: values.admin_password,
        contact_number: values.contact_number,
        region: values.region,
        status: values.status,
      };

      onSubmit(schoolFormData);
      onClose();
      form.reset(); // Reset the form after submission
    } catch (error: any) {
      console.error("School creation error:", error);
      toast({
        title: "Error",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
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
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Create School</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SchoolFormModal;
