
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Filter, Search, ArrowUp, ArrowDown, Download, Users, Edit } from "lucide-react";
import StaffProfileView from "./StaffProfileView";
import StaffProfileForm from "./StaffProfileForm";

// Mock data for staff members
const mockStaffData = [
  {
    id: 1,
    name: "John Doe",
    avatar: "",
    employeeId: "EMP001",
    department: "Mathematics",
    designation: "Senior Teacher",
    email: "john.doe@example.com",
    phone: "+1234567890",
    status: "Active",
    joinDate: "2023-03-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    avatar: "",
    employeeId: "EMP002",
    department: "Science",
    designation: "Teacher",
    email: "jane.smith@example.com",
    phone: "+1987654321",
    status: "Active",
    joinDate: "2022-08-01",
  },
  {
    id: 3,
    name: "Robert Johnson",
    avatar: "",
    employeeId: "EMP003",
    department: "Administration",
    designation: "Office Manager",
    email: "robert.j@example.com",
    phone: "+1567890234",
    status: "On Leave",
    joinDate: "2021-05-20",
  },
  {
    id: 4,
    name: "Sarah Williams",
    avatar: "",
    employeeId: "EMP004",
    department: "English",
    designation: "Teacher",
    email: "sarah.w@example.com",
    phone: "+1678901234",
    status: "Active",
    joinDate: "2023-01-10",
  },
  {
    id: 5,
    name: "Michael Brown",
    avatar: "",
    employeeId: "EMP005",
    department: "Physical Education",
    designation: "Coach",
    email: "michael.b@example.com",
    phone: "+1890123456",
    status: "Inactive",
    joinDate: "2021-11-05",
  },
];

const StaffDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  
  // Filter and sort staff data
  const filteredStaff = mockStaffData.filter((staff) => {
    const matchesSearch = staff.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        staff.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || staff.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || staff.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  }).sort((a, b) => {
    if (sortField === "name") {
      return sortDirection === "asc" 
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }
    return 0;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);
  const currentData = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold">Staff Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8" 
                placeholder="Search by name or ID..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Name
                      {sortField === "name" && (
                        sortDirection === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="hidden md:table-cell">Designation</TableHead>
                  <TableHead className="hidden lg:table-cell">Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentData.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">{staff.employeeId}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback>{staff.name.charAt(0)}{staff.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{staff.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{staff.department}</TableCell>
                    <TableCell className="hidden md:table-cell">{staff.designation}</TableCell>
                    <TableCell className="hidden lg:table-cell">{staff.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        staff.status === "Active" ? "default" : 
                        staff.status === "On Leave" ? "warning" : "secondary"
                      }>
                        {staff.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {/* Quick View Sheet */}
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setSelectedStaff(staff)}>
                            <Users className="h-4 w-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
                          <SheetHeader>
                            <SheetTitle>Staff Details</SheetTitle>
                          </SheetHeader>
                          {selectedStaff && <StaffProfileView staff={selectedStaff} />}
                        </SheetContent>
                      </Sheet>

                      {/* Full Profile Dialog */}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Staff Profile</DialogTitle>
                            <DialogDescription>
                              View and edit complete staff profile
                            </DialogDescription>
                          </DialogHeader>
                          <StaffProfileForm staff={staff} />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {currentData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No staff members found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={page === currentPage}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                {totalPages > 5 && <PaginationItem>...</PaginationItem>}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffDirectory;
