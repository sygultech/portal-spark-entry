
import { useState, useEffect } from "react";
import { useSubjects } from "@/hooks/useSubjects";
import { useBatchSubjects } from "@/hooks/useBatchSubjects";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BatchSubjectTabProps {
  batch: any;
  academicYearId: string;
}

const BatchSubjectTab = ({ 
  batch,
  academicYearId
}: BatchSubjectTabProps) => {
  const { subjects, isLoading: subjectsLoading } = useSubjects(academicYearId);
  const { 
    batchSubjects, 
    isLoading: batchSubjectsLoading,
    assignSubject,
    removeSubject,
    updateBatchSubject
  } = useBatchSubjects(batch?.id);
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const { toast } = useToast();
  
  const isLoading = subjectsLoading || batchSubjectsLoading;
  
  useEffect(() => {
    if (isAddDialogOpen) {
      setSelectedSubject("");
      setIsMandatory(true);
    }
  }, [isAddDialogOpen]);
  
  const handleAssignSubject = () => {
    if (selectedSubject) {
      assignSubject({
        subjectId: selectedSubject,
        isMandatory
      });
      setIsAddDialogOpen(false);
      setSelectedSubject("");
    }
  };
  
  const handleRemoveSubject = (id: string) => {
    removeSubject(id);
  };
  
  const handleToggleMandatory = (id: string, currentValue: boolean) => {
    updateBatchSubject({
      id,
      isMandatory: !currentValue
    });
  };
  
  // Filter out already assigned subjects
  const availableSubjects = subjects.filter(subject => 
    !batchSubjects.some(bs => bs.subject_id === subject.id)
  );
  
  const getSubjectTypeBadge = (type: string | null) => {
    if (!type) return null;
    
    const colorMap: Record<string, string> = {
      'core': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'elective': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
      'activity-based': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'language': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'other': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    };
    
    return (
      <Badge variant="outline" className={colorMap[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Subjects for {batch.name}</CardTitle>
            <CardDescription>Manage subjects for this batch/class</CardDescription>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)} disabled={availableSubjects.length === 0}>
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-6 text-center text-muted-foreground">
              Loading subjects...
            </div>
          ) : batchSubjects.length === 0 ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">No subjects assigned yet</h3>
                <p className="text-sm text-muted-foreground">
                  Start adding subjects to this batch/class.
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(true)}
                disabled={availableSubjects.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Subject
              </Button>
              {availableSubjects.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  All available subjects have already been assigned to this batch.
                </p>
              )}
            </div>
          ) : (
            <ScrollArea className="h-[400px] rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Mandatory</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchSubjects.map((batchSubject) => (
                    <TableRow key={batchSubject.id}>
                      <TableCell className="font-medium">
                        {batchSubject.subject?.name || "Unknown Subject"}
                      </TableCell>
                      <TableCell>{batchSubject.subject?.code || "-"}</TableCell>
                      <TableCell>
                        {getSubjectTypeBadge(batchSubject.subject?.subject_type)}
                      </TableCell>
                      <TableCell>
                        {batchSubject.subject?.category?.name || "-"}
                      </TableCell>
                      <TableCell>
                        <Switch 
                          checked={batchSubject.is_mandatory} 
                          onCheckedChange={() => handleToggleMandatory(batchSubject.id, batchSubject.is_mandatory)}
                          aria-label="Toggle mandatory"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveSubject(batchSubject.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Subject to Batch</DialogTitle>
            <DialogDescription>
              Select a subject to add to {batch.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {availableSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} {subject.code ? `(${subject.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableSubjects.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  All available subjects have already been assigned to this batch.
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="mandatory" 
                checked={isMandatory} 
                onCheckedChange={setIsMandatory} 
              />
              <label htmlFor="mandatory" className="text-sm font-medium">
                Is this subject mandatory for all students?
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleAssignSubject}
              disabled={!selectedSubject}
            >
              Add Subject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BatchSubjectTab;
