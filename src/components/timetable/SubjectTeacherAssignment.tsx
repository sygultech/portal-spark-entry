
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Users, BookOpen, Trash2, Plus } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SubjectTeacherAssignmentProps {
  batchId: string;
  academicYearId: string;
}

interface Assignment {
  id: string;
  subjectId: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  isElective?: boolean;
}

// Mock data - replace with actual API calls
const mockSubjects = [
  { id: 'sub1', name: 'Mathematics', isElective: false },
  { id: 'sub2', name: 'Physics', isElective: false },
  { id: 'sub3', name: 'Chemistry', isElective: false },
  { id: 'sub4', name: 'Computer Science', isElective: true },
  { id: 'sub5', name: 'Art', isElective: true },
];

const mockTeachers = [
  { id: 'teach1', name: 'John Smith', subjects: ['Mathematics', 'Physics'] },
  { id: 'teach2', name: 'Sarah Johnson', subjects: ['Chemistry', 'Physics'] },
  { id: 'teach3', name: 'Mike Brown', subjects: ['Computer Science'] },
  { id: 'teach4', name: 'Lisa Davis', subjects: ['Art', 'Mathematics'] },
];

export const SubjectTeacherAssignment = ({ batchId, academicYearId }: SubjectTeacherAssignmentProps) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      subjectId: 'sub1',
      subjectName: 'Mathematics',
      teacherId: 'teach1',
      teacherName: 'John Smith',
      isElective: false
    },
    {
      id: '2',
      subjectId: 'sub2',
      subjectName: 'Physics',
      teacherId: 'teach1',
      teacherName: 'John Smith',
      isElective: false
    }
  ]);

  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');

  const handleAddAssignment = () => {
    if (!selectedSubject || !selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select both subject and teacher",
        variant: "destructive"
      });
      return;
    }

    const subject = mockSubjects.find(s => s.id === selectedSubject);
    const teacher = mockTeachers.find(t => t.id === selectedTeacher);

    if (!subject || !teacher) return;

    // Check if assignment already exists
    const existingAssignment = assignments.find(a => a.subjectId === selectedSubject);
    if (existingAssignment) {
      toast({
        title: "Error",
        description: "This subject is already assigned to a teacher",
        variant: "destructive"
      });
      return;
    }

    const newAssignment: Assignment = {
      id: Date.now().toString(),
      subjectId: subject.id,
      subjectName: subject.name,
      teacherId: teacher.id,
      teacherName: teacher.name,
      isElective: subject.isElective
    };

    setAssignments(prev => [...prev, newAssignment]);
    setSelectedSubject('');
    setSelectedTeacher('');

    toast({
      title: "Assignment Added",
      description: `${subject.name} assigned to ${teacher.name}`
    });
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    
    if (assignment) {
      toast({
        title: "Assignment Removed",
        description: `${assignment.subjectName} unassigned from ${assignment.teacherName}`
      });
    }
  };

  const getAvailableSubjects = () => {
    const assignedSubjectIds = assignments.map(a => a.subjectId);
    return mockSubjects.filter(s => !assignedSubjectIds.includes(s.id));
  };

  const getAvailableTeachers = () => {
    if (!selectedSubject) return mockTeachers;
    
    const subject = mockSubjects.find(s => s.id === selectedSubject);
    if (!subject) return mockTeachers;

    return mockTeachers.filter(t => t.subjects.includes(subject.name));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Subject-Teacher Assignments
          </CardTitle>
          <CardDescription>
            Assign teachers to subjects for this batch. Each subject can only be assigned to one teacher.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/50">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableSubjects().map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        {subject.name}
                        {subject.isElective && (
                          <Badge variant="secondary" className="text-xs">Elective</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableTeachers().map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex flex-col">
                        <span>{teacher.name}</span>
                        <span className="text-xs text-muted-foreground">
                          Teaches: {teacher.subjects.join(', ')}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={handleAddAssignment} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Assignment
              </Button>
            </div>
          </div>

          {/* Current Assignments */}
          <div className="space-y-2">
            <h3 className="font-medium">Current Assignments</h3>
            {assignments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No subject-teacher assignments yet.</p>
                <p className="text-sm">Add assignments using the form above.</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{assignment.subjectName}</span>
                          {assignment.isElective && (
                            <Badge variant="secondary" className="text-xs">Elective</Badge>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Assigned to: {assignment.teacherName}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="text-sm">
              <span className="font-medium">{assignments.length}</span> subjects assigned
              <span className="text-muted-foreground ml-2">
                • {getAvailableSubjects().length} remaining
              </span>
            </div>
            <Button variant="outline" size="sm">
              Save All Assignments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
