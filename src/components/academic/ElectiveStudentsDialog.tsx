import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, UserPlus, X, Check, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ElectiveStudentsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

// Mock data for students
const mockStudents = [
  {
    id: "1",
    name: "John Smith",
    roll_no: "11S001",
    status: "enrolled",
    subjects: ["Advanced Physics", "Computer Science"],
    enrollment_date: "2024-03-15"
  },
  {
    id: "2",
    name: "Emma Johnson",
    roll_no: "11S002",
    status: "waitlisted",
    subjects: ["Biochemistry"],
    enrollment_date: "2024-03-16"
  },
  {
    id: "3",
    name: "Michael Brown",
    roll_no: "11S003",
    status: "pending",
    subjects: ["Computer Science", "Biochemistry"],
    enrollment_date: "2024-03-17"
  }
];

export const ElectiveStudentsDialog = ({
  isOpen,
  onClose,
  group
}: ElectiveStudentsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("enrolled");

  const filteredStudents = mockStudents.filter(student =>
    (student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.roll_no.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === "all" || student.status === activeTab)
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "enrolled":
        return <Badge variant="success">Enrolled</Badge>;
      case "waitlisted":
        return <Badge variant="secondary">Waitlisted</Badge>;
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      default:
        return null;
    }
  };

  const handleAddStudent = () => {
    // Here you would typically open a dialog to add new students
    console.log("Add new student");
  };

  const handleUpdateStatus = (studentId: string, newStatus: string) => {
    // Here you would typically update the student's status
    console.log("Update student status:", studentId, newStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle>Manage Student Enrollments</DialogTitle>
          <DialogDescription>
            View and manage student enrollments for {group?.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="enrolled" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="enrolled">Enrolled ({mockStudents.filter(s => s.status === "enrolled").length})</TabsTrigger>
              <TabsTrigger value="waitlisted">Waitlisted ({mockStudents.filter(s => s.status === "waitlisted").length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({mockStudents.filter(s => s.status === "pending").length})</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-[200px]"
                />
              </div>
              <Button onClick={handleAddStudent}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </div>
          </div>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="border rounded-md">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Selected Subjects</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>{student.roll_no}</TableCell>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>{getStatusBadge(student.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {student.subjects.map((subject, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{student.enrollment_date}</TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={student.status}
                            onValueChange={(value) => handleUpdateStatus(student.id, value)}
                          >
                            <SelectTrigger className="w-[130px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enrolled">
                                <span className="flex items-center">
                                  <Check className="h-4 w-4 mr-2" />
                                  Enroll
                                </span>
                              </SelectItem>
                              <SelectItem value="waitlisted">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Waitlist
                                </span>
                              </SelectItem>
                              <SelectItem value="pending">
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-2" />
                                  Pending
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                          No students found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>

            <div className="flex items-center justify-between bg-muted p-3 rounded-md">
              <div className="text-sm space-x-4">
                <span>
                  <span className="font-medium">{mockStudents.filter(s => s.status === "enrolled").length}</span> enrolled
                </span>
                <span>
                  <span className="font-medium">{mockStudents.filter(s => s.status === "waitlisted").length}</span> waitlisted
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Capacity: {group?.capacity} | Waitlist: {group?.waitlist_capacity}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 