
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { GraduationCap, ArrowRight, CheckCircle, XCircle } from "lucide-react";

interface Student {
  id: string;
  name: string;
  current_batch_id: string;
  roll_number: string;
  average_marks: number;
  attendance_percentage: number;
  remarks: string;
  has_dues: boolean;
}

interface Batch {
  id: string;
  name: string;
  course_id: string;
}

interface Course {
  id: string;
  name: string;
}

const StudentPromotions = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [promotionCriteria, setPromotionCriteria] = useState({
    min_marks: 40,
    min_attendance: 75,
    ignore_dues: false,
  });
  const [sourceBatch, setSourceBatch] = useState<string>("");
  const [targetBatch, setTargetBatch] = useState<string>("");
  
  // Mock data for academic years, courses, and batches
  const academicYears = [
    { id: "1", name: "2024-2025" },
    { id: "2", name: "2023-2024" },
  ];
  
  const courses: Course[] = [
    { id: "1", name: "Grade 1" },
    { id: "2", name: "Grade 2" },
    { id: "3", name: "Grade 3" },
  ];
  
  const batches: Batch[] = [
    { id: "1", name: "Grade 1 - A", course_id: "1" },
    { id: "2", name: "Grade 1 - B", course_id: "1" },
    { id: "3", name: "Grade 2 - A", course_id: "2" },
    { id: "4", name: "Grade 2 - B", course_id: "2" },
    { id: "5", name: "Grade 3 - A", course_id: "3" },
  ];
  
  const mockStudents: Student[] = [
    {
      id: "1",
      name: "Alice Johnson",
      current_batch_id: "1",
      roll_number: "G1A001",
      average_marks: 85,
      attendance_percentage: 92,
      remarks: "Excellent student",
      has_dues: false,
    },
    {
      id: "2",
      name: "Bob Smith",
      current_batch_id: "1",
      roll_number: "G1A002",
      average_marks: 72,
      attendance_percentage: 85,
      remarks: "Good progress",
      has_dues: false,
    },
    {
      id: "3",
      name: "Charlie Brown",
      current_batch_id: "1",
      roll_number: "G1A003",
      average_marks: 45,
      attendance_percentage: 68,
      remarks: "Needs improvement in attendance",
      has_dues: false,
    },
    {
      id: "4",
      name: "Diana Prince",
      current_batch_id: "1",
      roll_number: "G1A004",
      average_marks: 92,
      attendance_percentage: 94,
      remarks: "Outstanding performance",
      has_dues: false,
    },
    {
      id: "5",
      name: "Edward Miller",
      current_batch_id: "1",
      roll_number: "G1A005",
      average_marks: 35,
      attendance_percentage: 82,
      remarks: "Struggling with academics",
      has_dues: true,
    },
  ];

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      if (sourceBatch) {
        // Filter students by the selected batch
        setStudents(mockStudents.filter(student => student.current_batch_id === sourceBatch));
      } else {
        setStudents([]);
      }
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to fetch students. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Effect to fetch students when source batch changes
  useState(() => {
    if (sourceBatch) {
      fetchStudents();
    }
  });

  const handleSourceBatchChange = (value: string) => {
    setSourceBatch(value);
    setSelectedStudents([]);
    
    // Reset target batch if it's the same as source
    if (targetBatch === value) {
      setTargetBatch("");
    }
  };

  const handleSelectAllStudents = (checked: boolean) => {
    if (checked) {
      const eligibleStudents = students
        .filter(student => isEligibleForPromotion(student))
        .map(student => student.id);
      setSelectedStudents(eligibleStudents);
    } else {
      setSelectedStudents([]);
    }
  };

  const handleSelectStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudents(prev => [...prev, studentId]);
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
    }
  };

  const isEligibleForPromotion = (student: Student) => {
    const meetsMarks = student.average_marks >= promotionCriteria.min_marks;
    const meetsAttendance = student.attendance_percentage >= promotionCriteria.min_attendance;
    const duesCheck = promotionCriteria.ignore_dues ? true : !student.has_dues;
    
    return meetsMarks && meetsAttendance && duesCheck;
  };

  const handlePromoteStudents = () => {
    if (!targetBatch) {
      toast({
        title: "Missing information",
        description: "Please select a target batch for promotion.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select students to promote.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would update Supabase
    // For now, we'll just show a success message
    toast({
      title: "Students promoted",
      description: `Successfully promoted ${selectedStudents.length} student(s) to ${batches.find(b => b.id === targetBatch)?.name}.`,
    });
    
    // Reset selections
    setSelectedStudents([]);
  };

  const handleDetainStudents = () => {
    if (selectedStudents.length === 0) {
      toast({
        title: "No students selected",
        description: "Please select students to detain.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would update Supabase
    // For now, we'll just show a success message
    toast({
      title: "Students detained",
      description: `Successfully detained ${selectedStudents.length} student(s) in the current batch.`,
    });
    
    // Reset selections
    setSelectedStudents([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Student Promotions</CardTitle>
          <CardDescription>
            Promote or detain students based on academic performance and attendance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label>Source Batch (Current)</Label>
                <Select value={sourceBatch} onValueChange={handleSourceBatchChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>Target Batch (Promotion)</Label>
                <Select 
                  value={targetBatch} 
                  onValueChange={setTargetBatch}
                  disabled={!sourceBatch}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches
                      .filter(batch => batch.id !== sourceBatch)
                      .map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Promotion Criteria</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="min_marks">Minimum Average Marks (%)</Label>
                  <Select 
                    value={promotionCriteria.min_marks.toString()}
                    onValueChange={(value) => setPromotionCriteria(prev => ({ ...prev, min_marks: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="33">33%</SelectItem>
                      <SelectItem value="35">35%</SelectItem>
                      <SelectItem value="40">40%</SelectItem>
                      <SelectItem value="45">45%</SelectItem>
                      <SelectItem value="50">50%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="min_attendance">Minimum Attendance (%)</Label>
                  <Select 
                    value={promotionCriteria.min_attendance.toString()}
                    onValueChange={(value) => setPromotionCriteria(prev => ({ ...prev, min_attendance: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="65">65%</SelectItem>
                      <SelectItem value="70">70%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="85">85%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="ignore-dues"
                  checked={promotionCriteria.ignore_dues}
                  onCheckedChange={(checked) => setPromotionCriteria(prev => ({ ...prev, ignore_dues: checked === true }))}
                />
                <Label htmlFor="ignore-dues">Ignore fee dues during promotion</Label>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            {sourceBatch ? (
              loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : students.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="select-all"
                        checked={selectedStudents.length > 0 && selectedStudents.length === students.filter(s => isEligibleForPromotion(s)).length}
                        onCheckedChange={handleSelectAllStudents}
                      />
                      <Label htmlFor="select-all">Select All Eligible Students</Label>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Selected: {selectedStudents.length} of {students.length} students
                      </span>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]"></TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Average Marks</TableHead>
                          <TableHead>Attendance</TableHead>
                          <TableHead>Fee Status</TableHead>
                          <TableHead>Eligible</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {students.map((student) => {
                          const isEligible = isEligibleForPromotion(student);
                          return (
                            <TableRow key={student.id}>
                              <TableCell className="p-2">
                                <Checkbox
                                  checked={selectedStudents.includes(student.id)}
                                  onCheckedChange={(checked) => handleSelectStudent(student.id, checked === true)}
                                  disabled={!isEligible}
                                />
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="h-4 w-4" />
                                  {student.name}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Roll: {student.roll_number}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={student.average_marks >= promotionCriteria.min_marks ? "outline" : "destructive"}
                                >
                                  {student.average_marks}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={student.attendance_percentage >= promotionCriteria.min_attendance ? "outline" : "destructive"}
                                >
                                  {student.attendance_percentage}%
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {student.has_dues ? (
                                  <Badge variant={promotionCriteria.ignore_dues ? "outline" : "destructive"}>
                                    Has Dues
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-green-50 text-green-700">
                                    Cleared
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {isEligible ? (
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" /> Yes
                                  </div>
                                ) : (
                                  <div className="flex items-center text-red-600">
                                    <XCircle className="h-4 w-4 mr-1" /> No
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {student.remarks}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No students found in this batch.
                </div>
              )
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Please select a source batch to view students.
              </div>
            )}
          </div>
          
          {students.length > 0 && (
            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={handleDetainStudents}
                disabled={selectedStudents.length === 0}
              >
                Detain Selected Students
              </Button>
              <Button
                onClick={handlePromoteStudents}
                disabled={selectedStudents.length === 0 || !targetBatch}
                className="gap-2"
              >
                Promote Selected Students <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPromotions;
