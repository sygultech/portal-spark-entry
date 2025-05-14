import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import SchoolFormModal from "@/components/schools/SchoolFormModal";
import SchoolDetailView from "@/components/schools/SchoolDetailView";
import SchoolDeleteConfirmation from "@/components/schools/SchoolDeleteConfirmation";

// Icons
import { 
  Eye, 
  Edit, 
  Trash2, 
  User, 
  Plus, 
  Check, 
  X, 
  Search,
  Filter,
  ArrowDown,
  ArrowUp,
  ToggleRight,
  ToggleLeft,
} from "lucide-react";

// Types
import type { School } from "@/types/school";

const SchoolManagement: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const { toast } = useToast();

  // Fetch schools data with React Query
  const { data: schools, isLoading, error, refetch } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select(`
          *,
          profiles:profiles(id, first_name, last_name, email, role)
        `)
        .order('name', { ascending: sortDirection === 'asc' });
      
      if (error) throw error;
      return data as School[] || [];
    }
  });

  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Filter and sort schools
  const filteredSchools = schools
    ? schools
        .filter(school => 
          school.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          (statusFilter === "all" || school.status === statusFilter)
        )
        .sort((a, b) => {
          if (sortColumn === "name") {
            return sortDirection === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          } else if (sortColumn === "created_at") {
            return sortDirection === "asc"
              ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return 0;
        })
    : [];

  // Pagination
  const paginatedSchools = filteredSchools.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageCount = Math.ceil(filteredSchools.length / itemsPerPage);

  // View school details
  const handleViewSchool = (school: School) => {
    setSelectedSchool(school);
    setIsDetailViewOpen(true);
  };

  // Edit school
  const handleEditSchool = (school: School) => {
    setSelectedSchool(school);
    setIsEditModalOpen(true);
  };

  // Delete school
  const handleDeleteSchool = (school: School) => {
    setSelectedSchool(school);
    setIsDeleteModalOpen(true);
  };

  // Impersonate school admin
  const handleImpersonateAdmin = async (school: School) => {
    toast({
      title: "Admin Impersonation",
      description: `You are now impersonating the admin of ${school.name}`,
      variant: "default",
    });
    
    // Impersonation logic would go here
    console.log(`Impersonating admin of school: ${school.id}`);
  };

  // Toggle school status
  const handleToggleStatus = async (school: School) => {
    const newStatus = school.status === "active" ? "suspended" : "active";
    
    try {
      const { error } = await supabase
        .from('schools')
        .update({ status: newStatus })
        .eq('id', school.id);
      
      if (error) throw error;
      
      toast({
        title: "Status Updated",
        description: `School ${school.name} is now ${newStatus}`,
        variant: "default",
      });
      
      refetch();
    } catch (error) {
      console.error("Error updating school status:", error);
      toast({
        title: "Error",
        description: "Failed to update school status",
        variant: "destructive",
      });
    }
  };

  const renderStatusBadge = (status?: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 flex items-center gap-1">
            <Check size={12} /> Active
          </Badge>
        );
      case "suspended":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300 flex items-center gap-1">
            <X size={12} /> Suspended
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            Expired
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            {status || "Unknown"}
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">School Management</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-500">Error loading schools: {(error as Error).message}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tenant Management</h1>
          <Breadcrumb className="mt-2">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/super-admin-dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Tenant Management</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} className="mr-1" /> Add New School
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search schools..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter size={16} className="mr-1" /> More Filters
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    School Name
                    {sortColumn === "name" && (
                      sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Tenant ID</TableHead>
                  <TableHead>Admin Email</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                    Created
                    {sortColumn === "created_at" && (
                      sortDirection === "asc" ? <ArrowUp className="inline ml-1 h-4 w-4" /> : <ArrowDown className="inline ml-1 h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      {Array.from({ length: 8 }).map((_, cellIndex) => (
                        <TableCell key={cellIndex}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : paginatedSchools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-32">
                      No schools found. Add a new school to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSchools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.name}</TableCell>
                      <TableCell className="text-xs font-mono">{school.id.substring(0, 8)}...</TableCell>
                      <TableCell>{school.admin_email || "Not set"}</TableCell>
                      <TableCell>{school.contact_number || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={school.plan === "premium" ? "default" : "secondary"} className="capitalize">
                          {school.plan || "Free"}
                        </Badge>
                      </TableCell>
                      <TableCell>{renderStatusBadge(school.status)}</TableCell>
                      <TableCell>{format(new Date(school.created_at), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewSchool(school)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditSchool(school)}
                            title="Edit School"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleStatus(school)}
                            title={school.status === "active" ? "Suspend School" : "Activate School"}
                          >
                            {school.status === "active" ? (
                              <ToggleRight size={16} className="text-green-600" />
                            ) : (
                              <ToggleLeft size={16} className="text-red-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleImpersonateAdmin(school)}
                            title="Impersonate Admin"
                          >
                            <User size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSchool(school)}
                            className="text-red-500"
                            title="Delete School"
                          >
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

          {/* Pagination */}
          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: pageCount }).map((_, i) => {
                  // Show first page, last page, and pages around current page
                  if (
                    i === 0 || 
                    i === pageCount - 1 || 
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(i + 1);
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    i === 1 && currentPage > 3 ||
                    i === pageCount - 2 && currentPage < pageCount - 2
                  ) {
                    return (
                      <PaginationItem key={i}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < pageCount) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === pageCount ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Add School Modal */}
      <SchoolFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(formData) => {
          console.log("Add school form data:", formData);
          refetch();
          setIsAddModalOpen(false);
        }}
      />

      {/* Edit School Modal */}
      {selectedSchool && (
        <SchoolFormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(formData) => {
            console.log("Edit school form data:", formData);
            refetch();
            setIsEditModalOpen(false);
          }}
          school={selectedSchool}
          isEditing={true}
        />
      )}

      {/* School Details View */}
      {selectedSchool && (
        <SchoolDetailView
          isOpen={isDetailViewOpen}
          onClose={() => setIsDetailViewOpen(false)}
          school={selectedSchool}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedSchool && (
        <SchoolDeleteConfirmation
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={async () => {
            if (!selectedSchool) return;
            
            try {
              const { error } = await supabase
                .from('schools')
                .delete()
                .eq('id', selectedSchool.id);
              
              if (error) throw error;
              
              toast({
                title: "School Deleted",
                description: `${selectedSchool.name} has been deleted`,
                variant: "default",
              });
              
              refetch();
            } catch (error) {
              console.error("Error deleting school:", error);
              toast({
                title: "Error",
                description: "Failed to delete school",
                variant: "destructive",
              });
            }
            
            setIsDeleteModalOpen(false);
          }}
          school={selectedSchool}
        />
      )}
    </div>
  );
};

export default SchoolManagement;
