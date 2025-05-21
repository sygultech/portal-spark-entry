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
import { Search, ChevronDown, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createStudentLogin } from "@/services/studentService";

interface StudentListProps {
  students: Student[];
  onSelect: (student: Student) => void;
  categories: StudentCategory[];
  onBatchAction: (action: string, studentIds: string[]) => void;
  onRefresh?: () => void;
}

export function StudentList({ students, onSelect, categories, onBatchAction, onRefresh }: StudentListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Student>("admission_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Get unique batches
  const batches = Array.from(new Set(students.map((s) => s.batch_name))).filter(Boolean).sort();

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      (student.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.admission_number?.toLowerCase() || '').includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      categories.find((cat) => cat.id === categoryFilter)?.students?.includes(student.id);

    const matchesBatch = batchFilter === "all" || student.batch_name === batchFilter;

    return matchesSearch && matchesCategory && matchesBatch;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    return 0;
  });

  const handleSort = (field: keyof Student) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedStudents(checked ? sortedStudents.map(s => s.id) : []);
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    setSelectedStudents(prev =>
      checked ? [...prev, studentId] : prev.filter(id => id !== studentId)
    );
  };

  const handleCreateLogin = async (student: Student) => {
    try {
      // Prompt for password
      const password = prompt('Enter password for student login:');
      if (!password) {
        toast.error('Password is required');
        return;
      }

      console.log('Creating login for student:', student.email);
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
          toast.success('Login created successfully');
          break;
        case 'linked':
          toast.success('Student linked to school successfully');
          break;
        case 'already_exists':
          toast.error('Student already has a login for this school');
          break;
        default:
          toast.error('Unknown status returned');
      }

      // Call onRefresh to refresh the student list
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error('Error creating login:', error);
      toast.error('Failed to create login. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, admission no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((batch) => (
              <SelectItem key={batch} value={batch}>
                {batch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
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
                <Button
                  variant="ghost"
                  onClick={() => handleSort("admission_number")}
                  className="font-bold -ml-4"
                >
                  Admission No
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("first_name")}
                  className="font-bold -ml-4"
                >
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("batch_name")}
                  className="font-bold -ml-4"
                >
                  Batch
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Profile/Login Created</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStudents.map((student) => (
              <TableRow
                key={student.id}
                className={selectedStudents.includes(student.id) ? "bg-muted/50" : ""}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedStudents.includes(student.id)}
                    onCheckedChange={(checked) => handleSelectStudent(student.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>{student.admission_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {student.avatar_url && (
                      <img
                        src={student.avatar_url}
                        alt={student.first_name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium">
                        {(student.first_name || '') + ' ' + (student.last_name || '')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {student.profile_id ? (
                    "Yes"
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateLogin(student)}
                    >
                      Create Login
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {categories
                      .filter((cat) => cat.students?.includes(student.id))
                      .map((cat) => (
                        <Badge
                          key={cat.id}
                          variant="secondary"
                          style={{
                            backgroundColor: cat.color,
                            color: "#fff",
                          }}
                        >
                          {cat.name}
                        </Badge>
                      ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{student.phone}</p>
                    <p className="text-muted-foreground">{student.email}</p>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(student)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// force update

// force update
