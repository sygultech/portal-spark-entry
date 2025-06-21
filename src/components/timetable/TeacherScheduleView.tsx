import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Users, BookOpen, Calendar, Clock, Plus, Eye, Settings } from "lucide-react";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { TeacherAssignmentDialog } from "./components/TeacherAssignmentDialog";
import { TeacherDetailView } from "./components/TeacherDetailView";
import { SubjectAssignmentsView } from "./components/SubjectAssignmentsView";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { useTeachersFromStaff, Teacher } from "@/hooks/useTeachersFromStaff";
import { useSubjectTeachers } from "@/hooks/useSubjectTeachers";
import { useAuth } from "@/contexts/AuthContext";

interface TeacherScheduleViewProps {
  selectedTerm: string;
}

export const TeacherScheduleView = ({ selectedTerm }: TeacherScheduleViewProps) => {
  const { profile } = useAuth();
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();

  const { teachers, isLoading: teachersLoading, fetchTeachers } = useTeachersFromStaff(profile?.school_id || '');
  const { subjectTeachers, isLoading: subjectTeachersLoading, addSubjectTeacher, removeSubjectTeacher } = useSubjectTeachers(
    undefined, 
    undefined, 
    selectedYear?.id || ''
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [detailViewOpen, setDetailViewOpen] = useState(false);

  useEffect(() => {
    if (profile?.school_id) {
      fetchTeachers();
    }
  }, [profile?.school_id, fetchTeachers]);

  // Filter teachers based on search and department
  const filteredTeachers = teachers.filter(teacher => {
    const fullName = `${teacher.first_name} ${teacher.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         teacher.employee_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === "all" || teacher.department?.name === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(teachers.map(teacher => teacher.department?.name).filter(Boolean)));

  // Get subject assignments for a teacher
  const getTeacherSubjects = (teacherId: string) => {
    return subjectTeachers.filter(st => st.teacher_id === teacherId);
  };

  // Get teaching load (number of subjects/batches)
  const getTeachingLoad = (teacherId: string) => {
    return getTeacherSubjects(teacherId).length;
  };

  const handleAssignSubject = () => {
    setAssignmentDialogOpen(true);
  };

  const handleViewTeacherDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setDetailViewOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teacher Schedule Management
              </div>
              <AcademicYearSelector
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                isLoading={academicYearLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAssignSubject} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Assign Subject
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage teacher schedules and subject assignments for {selectedYear?.name || 'the selected academic year'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="teachers" className="space-y-6">
            <TabsList>
              <TabsTrigger value="teachers">Teachers Overview</TabsTrigger>
              <TabsTrigger value="assignments">Subject Assignments</TabsTrigger>
              <TabsTrigger value="schedule">Schedule Grid</TabsTrigger>
            </TabsList>

            <TabsContent value="teachers">
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search teachers by name, ID, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Teachers Table */}
              {teachersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Loading teachers...</p>
                </div>
              ) : filteredTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No teachers found</p>
                  {searchTerm && (
                    <p className="text-sm">Try adjusting your search terms</p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Employee ID</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Designation</TableHead>
                        <TableHead>Teaching Load</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTeachers.map((teacher) => {
                        const teachingLoad = getTeachingLoad(teacher.profile_id || teacher.id);
                        return (
                          <TableRow key={teacher.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {teacher.first_name.charAt(0)}
                                    {teacher.last_name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {teacher.first_name} {teacher.last_name}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {teacher.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="font-mono">
                              {teacher.employee_id}
                            </TableCell>
                            <TableCell>
                              {teacher.department?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              {teacher.designation?.name || 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {teachingLoad} subjects
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={teacher.employment_status === 'Active' ? 'default' : 'secondary'}
                              >
                                {teacher.employment_status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewTeacherDetails(teacher)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Summary Statistics */}
              {teachers.length > 0 && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Total Teachers</div>
                      <div className="text-2xl font-bold">{teachers.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Active Teachers</div>
                      <div className="text-2xl font-bold">
                        {teachers.filter(t => t.employment_status === 'Active').length}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Subject Assignments</div>
                      <div className="text-2xl font-bold">{subjectTeachers.length}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm font-medium text-muted-foreground">Departments</div>
                      <div className="text-2xl font-bold">{departments.length}</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assignments">
              <SubjectAssignmentsView selectedAcademicYearId={selectedYear?.id} />
            </TabsContent>

            <TabsContent value="schedule">
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Schedule grid view will be implemented here</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Teacher Assignment Dialog */}
      <TeacherAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        teachers={teachers}
        onAssign={addSubjectTeacher}
        onRemove={removeSubjectTeacher}
      />

      {/* Teacher Detail View */}
      <TeacherDetailView
        open={detailViewOpen}
        onOpenChange={setDetailViewOpen}
        teacher={selectedTeacher}
        subjectAssignments={selectedTeacher ? getTeacherSubjects(selectedTeacher.profile_id || selectedTeacher.id) : []}
      />
    </div>
  );
};
