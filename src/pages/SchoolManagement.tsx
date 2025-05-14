
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SchoolFormModal from "@/components/schools/SchoolFormModal";

// Icons
import { 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search,
  Filter,
  AlertTriangle,
  Check,
  X,
  Mail,
} from "lucide-react";

// Types
import type { School } from "@/types/school";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Extend school type with email confirmation status
interface ExtendedSchool extends School {
  isEmailConfirmed?: boolean;
}

const SchoolManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch schools data with React Query
  const { data: schools, isLoading, error, refetch } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name', { ascending: true });
        
        if (error) {
          console.error("Error fetching schools:", error.message);
          throw error;
        }
        
        // Get the list of schools and then check email confirmation status for each admin
        const schoolsWithConfirmation: ExtendedSchool[] = [];
        
        for (const school of (data as School[] || [])) {
          if (school.admin_email) {
            const { data: confirmationData, error: confirmationError } = await supabase
              .rpc('is_email_confirmed', { email_address: school.admin_email });
            
            if (confirmationError) {
              console.error("Error checking email confirmation:", confirmationError);
            }
            
            schoolsWithConfirmation.push({
              ...school,
              isEmailConfirmed: confirmationData || false
            });
          } else {
            schoolsWithConfirmation.push({
              ...school,
              isEmailConfirmed: false
            });
          }
        }
        
        return schoolsWithConfirmation;
      } catch (err) {
        console.error("Exception in schools query:", err);
        throw err;
      }
    },
    retry: 1,
    retryDelay: 1000,
  });

  // Mutation for confirming admin email
  const confirmEmail = useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.rpc('manually_confirm_email', { 
        email_address: email 
      });
      
      if (error) {
        console.error("Error confirming email:", error);
        throw error;
      }
      
      return data;
    },
    onSuccess: (data, email) => {
      if (data) {
        toast({
          title: "Email Confirmed",
          description: `The admin email ${email} has been confirmed successfully.`,
        });
        
        // Refetch schools data to update UI
        queryClient.invalidateQueries({ queryKey: ['schools'] });
      } else {
        toast({
          title: "Confirmation Failed",
          description: `Could not confirm the admin email ${email}.`,
          variant: "destructive"
        });
      }
    },
    onError: (error, email) => {
      console.error("Error confirming email:", error);
      toast({
        title: "Confirmation Error",
        description: `Failed to confirm admin email ${email}. ${error}`,
        variant: "destructive"
      });
    }
  });

  // Handle confirmation action
  const handleConfirmEmail = (email: string) => {
    if (!email) {
      toast({
        title: "Error",
        description: "No admin email found for this school",
        variant: "destructive"
      });
      return;
    }
    
    confirmEmail.mutate(email);
  };

  // Filter schools
  const filteredSchools = schools
    ? schools.filter(school => 
        school.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Handle form submission
  const handleAddSchool = async (formData: any) => {
    toast({
      title: "School Added",
      description: `${formData.name} has been added to the system`,
    });
    refetch();
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">School Management</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/super-admin-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">School Management</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div>
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Add New School
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search schools..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter size={16} className="mr-1" /> Filter
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Admin Email</TableHead>
                  <TableHead>Email Confirmed</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      <div className="flex flex-col items-center justify-center text-red-500">
                        <AlertTriangle size={24} className="mb-2" />
                        <p>Error loading schools. This might be due to permissions or database issues.</p>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => refetch()}
                        >
                          Try Again
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      No schools found. Add a new school to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell>{school.admin_email || "Not set"}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {school.admin_email ? (
                            <>
                              {school.isEmailConfirmed ? (
                                <Badge variant="success" className="flex items-center gap-1">
                                  <Check size={14} /> Confirmed
                                </Badge>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive" className="flex items-center gap-1">
                                    <X size={14} /> Not Confirmed
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button 
                                          size="sm" 
                                          variant="ghost"
                                          className="h-8 w-8 p-0"
                                          onClick={() => handleConfirmEmail(school.admin_email!)}
                                          disabled={confirmEmail.isPending}
                                        >
                                          <Mail size={16} className="text-blue-500" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Confirm email manually</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                              )}
                            </>
                          ) : (
                            <Badge variant="outline">No Admin Email</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{school.contact_number || "N/A"}</TableCell>
                      <TableCell>{school.region || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={school.status === "active" ? "default" : "secondary"} className="capitalize">
                          {school.status || "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{format(new Date(school.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add School Modal */}
      <SchoolFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSchool}
      />
    </div>
  );
};

export default SchoolManagement;
