
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Pencil, Edit, FileText, UserX } from "lucide-react";
import { Student } from "@/types/school";
import { useNavigate } from "react-router-dom";

interface StudentListProps {
  students: Student[];
  onEdit: (student: Student) => void;
}

export default function StudentList({ students, onEdit }: StudentListProps) {
  const navigate = useNavigate();
  const [sortColumn, setSortColumn] = useState<string>("first_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    let aValue: any = a[sortColumn as keyof Student];
    let bValue: any = b[sortColumn as keyof Student];
    
    // Handle nested sort by last_name when first_name is equal
    if (sortColumn === "first_name" && a.first_name === b.first_name) {
      aValue = a.last_name;
      bValue = b.last_name;
    }
    
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const viewStudentProfile = (student: Student) => {
    // This will be implemented later to navigate to student profile
    navigate(`/students/${student.id}`);
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] cursor-pointer" onClick={() => handleSort("first_name")}>
              <div className="flex items-center gap-1">
                Student Name
                {sortColumn === "first_name" && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
              <div className="flex items-center gap-1">
                Student ID
                {sortColumn === "id" && (
                  <ChevronDown className={`h-4 w-4 transition-transform ${sortDirection === "desc" ? "transform rotate-180" : ""}`} />
                )}
              </div>
            </TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedStudents.map((student) => (
            <TableRow key={student.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium" onClick={() => viewStudentProfile(student)}>
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={student.avatar_url || undefined} alt={`${student.first_name} ${student.last_name}`} />
                    <AvatarFallback>{student.first_name[0]}{student.last_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div>{student.first_name} {student.last_name}</div>
                    <div className="text-sm text-muted-foreground">Grade 10 • Science</div>
                  </div>
                </div>
              </TableCell>
              <TableCell onClick={() => viewStudentProfile(student)}>S-{student.id.substring(0, 8)}</TableCell>
              <TableCell onClick={() => viewStudentProfile(student)}>{student.email}</TableCell>
              <TableCell onClick={() => viewStudentProfile(student)}>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <span className="sr-only">Open menu</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => viewStudentProfile(student)} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(student)} className="flex items-center gap-2">
                      <Pencil className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 flex items-center gap-2">
                      <UserX className="h-4 w-4" />
                      <span>Transfer Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
