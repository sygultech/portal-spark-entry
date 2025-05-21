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
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, X } from "lucide-react";

interface ElectiveSubjectsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  group: any;
}

// Mock data for available subjects
const availableSubjects = [
  { id: "1", name: "Advanced Physics", code: "PHY301", type: "core" },
  { id: "2", name: "Biochemistry", code: "BIO302", type: "core" },
  { id: "3", name: "Computer Science", code: "CS301", type: "elective" },
  { id: "4", name: "French", code: "FRE301", type: "language" },
  { id: "5", name: "German", code: "GER301", type: "language" },
  { id: "6", name: "Japanese", code: "JAP301", type: "language" },
];

export const ElectiveSubjectsDialog = ({
  isOpen,
  onClose,
  group
}: ElectiveSubjectsDialogProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(
    group?.subjects?.map((s: any) => s.id) || []
  );

  const filteredSubjects = availableSubjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleSubject = (subjectId: string) => {
    setSelectedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSave = () => {
    // Here you would typically save the changes to the backend
    console.log("Save selected subjects:", selectedSubjects);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Manage Elective Subjects</DialogTitle>
          <DialogDescription>
            Select subjects that will be available in this elective group
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add New Subject
            </Button>
          </div>

          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject) => (
                  <TableRow key={subject.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedSubjects.includes(subject.id)}
                        onCheckedChange={() => handleToggleSubject(subject.id)}
                      />
                    </TableCell>
                    <TableCell>{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {subject.type.charAt(0).toUpperCase() + subject.type.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredSubjects.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No subjects found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between bg-muted p-3 rounded-md">
            <div className="text-sm">
              <span className="font-medium">{selectedSubjects.length}</span> subjects selected
            </div>
            <div className="text-sm text-muted-foreground">
              Students must choose {group?.min_subjects} to {group?.max_subjects} subjects
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 