
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Filter, BookOpen, Users, Plus, Trash2, Edit3 } from "lucide-react";
import { useSubjects } from "@/hooks/useSubjects";
import { useBatches } from "@/hooks/useBatches";
import { useTeachersFromStaff } from "@/hooks/useTeachersFromStaff";
import { useSubjectTeachers } from "@/hooks/useSubjectTeachers";
import { useAuth } from "@/contexts/AuthContext";

interface SubjectAssignmentsViewProps {
  selectedAcademicYearId?: string;
}

export const SubjectAssignmentsView: React.FC<SubjectAssignmentsViewProps> = ({
  selectedAcademicYearId
}) => {
  const { profile } = useAuth();
  const { subjects } = useSubjects(profile?.school_id || '');
  const { batches } = useBatches(profile?.school_id || '');
  const { teachers } = useTeachersFromStaff(profile?.school_id || '');
  const { subjectTeachers, isLoading, assignTeacher, removeTeacher } = useSubjectTeachers(
    undefined,
    undefined,
    selectedAcademicYearId
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [batchFilter, setBatchFilter] = useState<string>("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");

  // Filter assignments based on search and filters
  const filteredAssignments = subjectTeachers.filter(assignment => {
    const subjectName = assignment.subject?.name?.toLowerCase() || '';
    const teacherName = `${assignment.teacher?.first_name || ''} ${assignment.teacher?.last_name || ''}`.toLowerCase();
    const batchName = assignment.batch?.name?.toLowerCase() || '';
    
    const matchesSearch = subjectName.includes(searchTerm.toLowerCase()) ||
                         teacherName.includes(searchTerm.toLowerCase()) ||
                         batchName.includes(searchTerm.toLowerCase());
    
    const matchesSubject = subjectFilter === "all" || assignment.subject_id === subjectFilter;
    const matchesBatch = batchFilter === "all" || assignment.batch_id === batchFilter;
    
    return matchesSearch && matchesSubject && matchesBatch;
  });

  const handleAssignTeacher = async () => {
    if (!selectedSubjectId || !selectedBatchId || !selectedTeacherId || !selectedAcademicYearId) {
      return;
    }

    try {
      await assignTeacher({
        subject_id: selectedSubjectId,
        batch_id: selectedBatchId,
        teacher_id: selectedTeacherId,
        academic_year_id: selectedAcademicYearId
      });

      // Reset form
      setSelectedSubjectId("");
      setSelectedBatchId("");
      setSelectedTeacherId("");
      setAssignDialogOpen(false);
    } catch (error) {
      console.error('Error assigning teacher:', error);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    try {
      await removeTeacher(assignmentId);
    } catch (error) {
      console.error('Error removing assignment:', error);
    }
  };

  const getTeacherName = (teacher: any) => {
    return `${teacher?.first_name || ''} ${teacher?.last_name || ''}`.trim();
  };

  const getAssignmentStats = () => {
    const totalSubjects = subjects.length;
    const assignedSubjects = new Set(subjectTeachers.map(st => st.subject_id)).size;
    const totalTeachers = teachers.length;
    const activeTeachers = new Set(subjectTeachers.map(st => st.teacher_id)).size;

    return { totalSubjects, assignedSubjects, totalTeachers, activeTeachers };
  };

  const stats = getAssignmentStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subject Assignments</h3>
          <p className="text-sm text-muted-foreground">
            Manage teacher assignments to subjects and batches
          </p>
        </div>
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Teacher to Subject</DialogTitle>
              <DialogDescription>
                Select a teacher, subject, and batch to create a new assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Subject</label>
                <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Batch</label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
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

              <div className="space-y-2">
                <label className="text-sm font-medium">Teacher</label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.profile_id || teacher.id} value={teacher.profile_id || teacher.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {teacher.first_name.charAt(0)}{teacher.last_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {getTeacherName(teacher)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignTeacher}
                  disabled={!selectedSubjectId || !selectedBatchId || !selectedTeacherId}
                >
                  Assign Teacher
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
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
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Assignments</div>
            <div className="text-2xl font-bold">{filteredAssignments.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Subjects Assigned</div>
            <div className="text-2xl font-bold">{stats.assignedSubjects}/{stats.totalSubjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Active Teachers</div>
            <div className="text-2xl font-bold">{stats.activeTeachers}/{stats.totalTeachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Coverage</div>
            <div className="text-2xl font-bold">
              {stats.totalSubjects > 0 ? Math.round((stats.assignedSubjects / stats.totalSubjects) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Current Assignments
          </CardTitle>
          <CardDescription>
            All subject-teacher assignments for the selected academic year
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Loading assignments...</p>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No assignments found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Subject Code</TableHead>
                    <TableHead>Assigned Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{assignment.subject?.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {assignment.batch?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {assignment.teacher?.first_name?.charAt(0)}
                              {assignment.teacher?.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span>{getTeacherName(assignment.teacher)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {assignment.subject?.code || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(assignment.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAssignment(assignment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
