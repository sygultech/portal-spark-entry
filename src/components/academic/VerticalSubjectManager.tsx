import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useCourses } from "@/hooks/useCourses";
import { useBatches } from "@/hooks/useBatches";
import { useSubjects } from "@/hooks/useSubjects";
import { Course, Batch, Subject } from "@/types/academic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import { SubjectFormDialog } from "./SubjectFormDialog";
import { useToast } from "@/hooks/use-toast";

interface VerticalSubjectManagerProps {
  academicYearId: string;
}

const VerticalSubjectManager = ({ academicYearId }: VerticalSubjectManagerProps) => {
  const { profile } = useAuth();
  const { courses } = useCourses(academicYearId);
  const { batches } = useBatches(academicYearId);
  const { subjects, createSubject } = useSubjects(academicYearId);
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);

  // Filter batches based on selected course
  const courseBatches = batches.filter(
    (batch) => batch.course_id === selectedCourse?.id
  );

  // Get subjects for selected batch
  const batchSubjects = subjects.filter((subject) =>
    subject.batch_assignments?.some((ba) => ba.batch_id === selectedBatch?.id)
  );

  const handleCreateSubject = async (data: any) => {
    try {
      if (!selectedBatch) {
        toast({
          title: "Error",
          description: "Please select a batch first",
          variant: "destructive"
        });
        return;
      }

      if (!profile?.school_id) {
        toast({
          title: "Error",
          description: "School ID not found",
          variant: "destructive"
        });
        return;
      }

      if (!academicYearId) {
        toast({
          title: "Error",
          description: "Academic year ID not found",
          variant: "destructive"
        });
        return;
      }

      // Separate subject data from batch assignment data
      const { is_mandatory, ...subjectData } = data;
      
      // Create subject with proper data
      const newSubject = await createSubject({
        ...subjectData,
        academic_year_id: academicYearId,
        school_id: profile.school_id,
        batch_assignments: [{
          batch_id: selectedBatch.id,
          is_mandatory: is_mandatory ?? true // Default to true if not provided
        }]
      });

      setIsSubjectFormOpen(false);
      toast({
        title: "Success",
        description: "Subject created and assigned successfully"
      });
    } catch (error: any) {
      console.error("Error creating subject:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create subject",
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[600px] gap-4">
          {/* Vertical Tabs for Courses */}
          <div className="w-1/4 border-r pr-4">
            <h3 className="font-medium mb-2">Courses</h3>
            <ScrollArea className="h-[550px]">
              <div className="space-y-1">
                {courses.map((course) => (
                  <Button
                    key={course.id}
                    variant={selectedCourse?.id === course.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setSelectedCourse(course);
                      setSelectedBatch(null);
                    }}
                  >
                    {course.name}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Vertical Tabs for Batches */}
          <div className="w-1/4 border-r pr-4">
            <h3 className="font-medium mb-2">Batches</h3>
            <ScrollArea className="h-[550px]">
              <div className="space-y-1">
                {selectedCourse ? (
                  courseBatches.length > 0 ? (
                    courseBatches.map((batch) => (
                      <Button
                        key={batch.id}
                        variant={selectedBatch?.id === batch.id ? "secondary" : "ghost"}
                        className="w-full justify-start"
                        onClick={() => setSelectedBatch(batch)}
                      >
                        {batch.name}
                      </Button>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground p-2">
                      No batches found for this course
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground p-2">
                    Select a course to view batches
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Subjects List */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">
                {selectedBatch
                  ? `Subjects - ${selectedBatch.name}`
                  : "Subjects"}
              </h3>
              {selectedBatch && (
                <Button
                  size="sm"
                  onClick={() => setIsSubjectFormOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Subject
                </Button>
              )}
            </div>
            <ScrollArea className="h-[550px]">
              {selectedBatch ? (
                batchSubjects.length > 0 ? (
                  <div className="space-y-2">
                    {batchSubjects.map((subject) => (
                      <Card key={subject.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{subject.name}</h4>
                            {subject.code && (
                              <p className="text-sm text-muted-foreground">
                                Code: {subject.code}
                              </p>
                            )}
                            {subject.category && (
                              <p className="text-sm text-muted-foreground">
                                Category: {subject.category.name}
                              </p>
                            )}
                            {subject.subject_type && (
                              <p className="text-sm text-muted-foreground">
                                Type: {subject.subject_type}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground p-2">
                    No subjects assigned to this batch
                  </p>
                )
              ) : (
                <p className="text-sm text-muted-foreground p-2">
                  Select a batch to view and manage subjects
                </p>
              )}
            </ScrollArea>
          </div>
        </div>
      </CardContent>

      {/* Subject Form Dialog */}
      <SubjectFormDialog
        isOpen={isSubjectFormOpen}
        onClose={() => setIsSubjectFormOpen(false)}
        onSubmit={handleCreateSubject}
        academicYearId={academicYearId}
        subject={null}
      />
    </Card>
  );
};

export default VerticalSubjectManager; 