
import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, BookOpen, GraduationCap, Mail, Phone, Calendar, Building } from "lucide-react";
import { Teacher } from "@/hooks/useTeachersFromStaff";

interface TeacherDetailViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: Teacher | null;
  subjectAssignments: any[];
}

export const TeacherDetailView: React.FC<TeacherDetailViewProps> = ({
  open,
  onOpenChange,
  teacher,
  subjectAssignments
}) => {
  if (!teacher) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Teacher Details
          </DialogTitle>
          <DialogDescription>
            Detailed information about {teacher.first_name} {teacher.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Teacher Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {teacher.first_name.charAt(0)}
                    {teacher.last_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">
                    {teacher.first_name} {teacher.last_name}
                  </h3>
                  <p className="text-muted-foreground">
                    {teacher.designation?.name} - {teacher.department?.name}
                  </p>
                  <Badge variant={teacher.employment_status === 'Active' ? 'default' : 'secondary'}>
                    {teacher.employment_status}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Employee ID</p>
                    <p className="text-sm text-muted-foreground font-mono">{teacher.employee_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                  </div>
                </div>
                {teacher.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{teacher.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Join Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(teacher.join_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subject Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Subject Assignments
              </CardTitle>
              <CardDescription>
                Current subject and batch assignments for this teacher
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subjectAssignments.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subject</TableHead>
                        <TableHead>Batch</TableHead>
                        <TableHead>Subject Code</TableHead>
                        <TableHead>Assigned Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subjectAssignments.map((assignment) => (
                        <TableRow key={assignment.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              {assignment.subject?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-muted-foreground" />
                              {assignment.batch?.name || 'N/A'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {assignment.subject?.code || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(assignment.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No subject assignments found</p>
                  <p className="text-sm">This teacher hasn't been assigned any subjects yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Teaching Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Total Subjects</div>
                <div className="text-2xl font-bold">{subjectAssignments.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Total Batches</div>
                <div className="text-2xl font-bold">
                  {new Set(subjectAssignments.map(a => a.batch_id)).size}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Years of Service</div>
                <div className="text-2xl font-bold">
                  {Math.floor((new Date().getTime() - new Date(teacher.join_date).getTime()) / (1000 * 60 * 60 * 24 * 365))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
