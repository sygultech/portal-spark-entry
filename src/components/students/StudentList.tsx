import { Student, StudentCategory } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, ChevronDown, Filter, ArrowUpDown, Mail, MailX, UserCheck, UserX } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { createStudentLogin, removeStudentLoginAccess } from "@/services/studentService";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";

interface StudentListProps {
  students: Student[];
  onSelect: (student: Student) => void;
  categories: StudentCategory[];
  onBatchAction: (action: string, studentIds: string[]) => void;
  onRefresh?: () => void;
}

// Helper functions for login status management
const hasLoginAccess = (student: Student): boolean => {
  return !!student.profile_id;
};

const getLoginStatusBadge = (student: Student) => {
  const hasLogin = hasLoginAccess(student);
  
  if (hasLogin) {
    return (
      <Badge variant="default" className="ml-2 text-xs bg-green-100 text-green-800 border-green-300 hover:bg-green-200">
        <Mail className="w-3 h-3 mr-1" />
        Active
      </Badge>
    );
  } else {
    return (
      <Badge variant="secondary" className="ml-2 text-xs bg-gray-100 text-gray-600 border-gray-300">
        <MailX className="w-3 h-3 mr-1" />
        No Access
      </Badge>
    );
  }
};

const getLoginStatusIcon = (student: Student) => {
  const hasLogin = hasLoginAccess(student);
  
  if (hasLogin) {
    return <UserCheck className="w-4 h-4 text-green-600" />;
  } else {
    return <UserX className="w-4 h-4 text-gray-400" />;
  }
};

export function StudentList({ students, onSelect, categories, onBatchAction, onRefresh }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [academicYearFilter, setAcademicYearFilter] = useState<string>("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Student>("admission_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Fetch academic years, courses, and batches
  const { academicYears, isLoading: isLoadingYears } = useAcademicYears();
  const { courses, isLoading: isLoadingCourses } = useCourses(academicYearFilter);
  // Fetch all batches for the academic year, then filter by course in the UI
  const { batches: allBatches, isLoading: isLoadingBatches } = useBatches(academicYearFilter, undefined);
  
  // Filter batches by selected course for the batch dropdown
  const batches = courseFilter === "all" 
    ? allBatches 
    : allBatches.filter(batch => batch.course_id === courseFilter);

  // Set default academic year to current year - only run once when academic years load
  useEffect(() => {
    if (academicYears.length > 0 && !academicYearFilter) {
      const currentYear = academicYears.find(year => year.is_current);
      if (currentYear) {
        setAcademicYearFilter(currentYear.id);
      }
    }
  }, [academicYears.length]); // Only depend on length to avoid infinite loops

  // Reset dependent filters when academic year changes
  useEffect(() => {
    if (academicYearFilter) {
      setCourseFilter("all");
      setBatchFilter("all");
    }
  }, [academicYearFilter]);

  // Reset batch filter when course changes
  useEffect(() => {
    setBatchFilter("all");
  }, [courseFilter]);

  // Memoize filtered students to prevent unnecessary recalculations
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        (student.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (student.admission_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === "all" ||
        categories.find((cat) => cat.id === categoryFilter)?.students?.includes(student.id);

      const matchesAcademicYear = !academicYearFilter || student.academic_year === academicYearFilter || (!student.academic_year && academicYearFilter);
      
      // Only apply course filter if courses are loaded
      const selectedCourse = courses.find(c => c.id === courseFilter);
      // Since course info comes through batches, we need to check if student's batch belongs to the selected course
      const matchesCourse = courseFilter === "all" || isLoadingCourses || 
        (selectedCourse && allBatches.some(batch => 
          batch.course_id === courseFilter && student.batch_id === batch.id
        ));
      
      // Only apply batch filter if batches are loaded  
      const selectedBatch = batches.find(b => b.id === batchFilter);
      // Check if student's batch_id matches the selected batch
      const matchesBatch = batchFilter === "all" || isLoadingBatches || 
        student.batch_id === batchFilter;

      return matchesSearch && matchesCategory && matchesAcademicYear && matchesCourse && matchesBatch;
    });
  }, [students, searchTerm, categoryFilter, categories, academicYearFilter, courseFilter, courses, isLoadingCourses, allBatches, batchFilter, batches, isLoadingBatches]);

  // Memoize sorted students to prevent unnecessary recalculations
  const sortedStudents = useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
  }, [filteredStudents, sortField, sortDirection]);

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? sortedStudents.map((s) => s.id) : []);
  };

  const handleSelectStudent = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, id]);
    } else {
      setSelectedStudents(selectedStudents.filter((studentId) => studentId !== id));
    }
  };

  const handleCreateLogin = async (student: Student) => {
    try {
      // Check if student has an email address
      if (!student.email) {
        toast.error('Student must have an email address to create login account');
        return;
      }

      // Prompt for password with validation
      const password = prompt('Enter password for student login (minimum 6 characters):');
      if (!password) {
        toast.error('Password is required');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters long');
        return;
      }

      console.log('Creating login for student:', student.email);
      toast.info('Creating login account...');
      
      const result = await createStudentLogin(
        student.email,
        student.first_name,
        student.last_name,
        student.school_id,
        password,
        student.id
      );

      console.log('Login creation result:', result);

      if (!result) {
        toast.error('Failed to create login');
        return;
      }

      switch (result.status) {
        case 'created':
          toast.success('Login account created successfully! Student can now access the portal.');
          break;
        case 'linked':
          toast.success('Student linked to school successfully! Access has been granted.');
          break;
        case 'already_exists':
          toast.error('Student already has a login account for this school');
          break;
        default:
          toast.error('Unknown status returned');
      }

      // Call onRefresh to refresh the student list and update login status
      if (onRefresh) {
        onRefresh();
      }
    } catch (error: any) {
      console.error('Error creating login:', error);
      const errorMessage = error?.message || 'Failed to create login account. Please try again.';
      toast.error(errorMessage);
    }
  };

  const handleRemoveLoginAccess = async (student: Student) => {
    try {
      console.log('handleRemoveLoginAccess called with student:', {
        id: student.id,
        profile_id: student.profile_id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email
      });

      const confirmed = window.confirm(
        `Are you sure you want to remove login access for ${student.first_name} ${student.last_name}?\n\nThis will disable their ability to log into the portal. This action can be reversed by creating a new login account.`
      );
      if (!confirmed) return;

      toast.info('Removing login access...');

      console.log('Calling removeStudentLoginAccess with ID:', student.id);
      const success = await removeStudentLoginAccess(student.id);
      
      if (success) {
        toast.success(`Login access removed for ${student.first_name} ${student.last_name}. They can no longer access the portal.`);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        toast.error('Failed to remove login access');
      }
    } catch (error) {
      console.error('Error removing student login access:', error);
      toast.error('Failed to remove login access. Please try again.');
    }
  };

  return (
    <div className="space-y-4" key={`student-list-${filteredStudents.length}-${searchTerm}-${courseFilter}-${batchFilter}`}>
      {/* Filters */}
      <div className="flex flex-col gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, admission no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-4">
          <Select value={academicYearFilter} onValueChange={setAcademicYearFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Academic Year" />
            </SelectTrigger>
            <SelectContent>
              {academicYears.map((year) => (
                <SelectItem key={year.id} value={year.id}>
                  {year.name} {year.is_current && "(Current)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={courseFilter} onValueChange={setCourseFilter} disabled={isLoadingCourses}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isLoadingCourses ? "Loading courses..." : "Select Course"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={batchFilter} onValueChange={setBatchFilter} disabled={isLoadingBatches}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={isLoadingBatches ? "Loading batches..." : "Select Batch"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student count display */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {sortedStudents.length} of {students.length} students (Updated: {new Date().toLocaleTimeString()})
        </p>
      </div>

      {/* Batch Actions */}
      {selectedStudents.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
          <span className="text-sm text-muted-foreground">
            {selectedStudents.length} students selected
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Batch Actions
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onBatchAction("promote", selectedStudents)}>
                Promote Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchAction("transfer", selectedStudents)}>
                Transfer Selected
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onBatchAction("print", selectedStudents)}>
                Print Documents
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedStudents([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedStudents.length === sortedStudents.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSort("admission_number")}
                    className="flex items-center"
                  >
                    Admission No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSort("first_name")}
                    className="flex items-center"
                  >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Login Status</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="text-muted-foreground">
                    {students.length === 0 ? "No students found" : "No students match the current filters"}
                  </div>
                  {students.length > 0 && (
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                        setAcademicYearFilter("");
                        setCourseFilter("all");
                        setBatchFilter("all");
                      }}
                      className="mt-2"
                    >
                      Clear all filters
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ) : (
              sortedStudents.map((student, index) => (
                <TableRow key={`${student.id}-${student.admission_number}-${index}`}>
                  <TableCell>
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={(checked) =>
                        handleSelectStudent(student.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>{student.admission_number}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="ml-2">
                        <div className="font-medium flex items-center">
                          {student.first_name} {student.last_name}
                          {getLoginStatusBadge(student)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {student.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {student.batch_name ? (
                      <Badge variant="outline">{student.batch_name}</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Not Assigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {getLoginStatusBadge(student)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={student.status === "active" ? "default" : "secondary"}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(student)}
                      >
                        View
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!hasLoginAccess(student) ? (
                            <DropdownMenuItem onClick={() => handleCreateLogin(student)}>
                              <Mail className="w-4 h-4 mr-2" />
                              Create Login Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleRemoveLoginAccess(student)}>
                              <MailX className="w-4 h-4 mr-2" />
                              Remove Login Access
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
