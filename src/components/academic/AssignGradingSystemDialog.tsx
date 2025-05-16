import { useState, useEffect } from "react";
import { GradingSystem, Batch } from "@/types/academic";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AssignGradingSystemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  system: GradingSystem | null;
}

export const AssignGradingSystemDialog = ({
  isOpen,
  onClose,
  system
}: AssignGradingSystemDialogProps) => {
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  
  // Mock data - replace with actual API calls
  const mockBatches = [
    {
      id: "1",
      name: "Class X-A",
      code: "10A",
      course: { name: "Class X" },
      grading_system_id: "1"
    },
    {
      id: "2",
      name: "Class X-B",
      code: "10B",
      course: { name: "Class X" },
      grading_system_id: null
    },
    {
      id: "3",
      name: "Class IX-A",
      code: "9A",
      course: { name: "Class IX" },
      grading_system_id: "2"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      // Pre-select batches that already use this grading system
      setSelectedBatches(
        mockBatches
          .filter(batch => batch.grading_system_id === system?.id)
          .map(batch => batch.id)
      );
    }
  }, [isOpen, system]);

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatches.length === mockBatches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(mockBatches.map(batch => batch.id));
    }
  };

  const handleSave = () => {
    // Implement save functionality
    console.log("Save batch assignments:", {
      gradingSystemId: system?.id,
      batchIds: selectedBatches
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Assign Grading System</DialogTitle>
          <DialogDescription>
            Select the batches that will use "{system?.name}" grading system
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedBatches.length === mockBatches.length}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Current System</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={() => handleToggleBatch(batch.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {batch.name}
                      <span className="ml-2 text-muted-foreground">
                        ({batch.code})
                      </span>
                    </TableCell>
                    <TableCell>{batch.course.name}</TableCell>
                    <TableCell>
                      {batch.grading_system_id ? (
                        <div className="flex items-center gap-2">
                          {batch.grading_system_id === system?.id ? (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Using this system
                            </Badge>
                          ) : (
                            <>
                              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                                Using another system
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                (Will be replaced)
                              </span>
                            </>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          No system assigned
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 