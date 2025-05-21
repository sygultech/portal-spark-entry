
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GradingSystem } from "@/types/academic";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { useBatches } from "@/hooks/useBatches";
import { useGradingSystems } from "@/hooks/useGradingSystems";

export interface AssignGradingSystemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  system: GradingSystem | null;
}

export const AssignGradingSystemDialog: React.FC<AssignGradingSystemDialogProps> = ({
  isOpen,
  onClose,
  system
}) => {
  const { batches, isLoading: batchesLoading } = useBatches();
  const { assignGradingSystemToBatches } = useGradingSystems();
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Reset selected batches when the dialog opens
  useEffect(() => {
    if (isOpen) {
      // Pre-select batches that already have this grading system
      const preSelected = batches
        .filter(batch => batch.grading_system_id === system?.id)
        .map(batch => batch.id);
      
      setSelectedBatchIds(preSelected);
    }
  }, [isOpen, system, batches]);

  const handleToggleBatch = (batchId: string) => {
    setSelectedBatchIds(current => 
      current.includes(batchId)
        ? current.filter(id => id !== batchId)
        : [...current, batchId]
    );
  };

  const handleSelectAll = () => {
    setSelectedBatchIds(batches.map(batch => batch.id));
  };

  const handleClearAll = () => {
    setSelectedBatchIds([]);
  };

  const handleSubmit = async () => {
    if (!system) return;
    
    setSubmitting(true);
    try {
      await assignGradingSystemToBatches({
        gradingSystemId: system.id,
        batchIds: selectedBatchIds
      });
      onClose();
    } catch (error) {
      console.error("Error assigning grading system to batches:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Grading System to Batches</DialogTitle>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          {system && (
            <div className="mb-4">
              <h3 className="font-medium">Selected Grading System:</h3>
              <p className="text-sm">{system.name}</p>
            </div>
          )}

          {batchesLoading ? (
            <div className="text-center py-4">Loading batches...</div>
          ) : batches.length === 0 ? (
            <div className="text-center py-4">No batches available</div>
          ) : (
            <>
              <div className="flex justify-between mb-2">
                <p className="text-sm font-medium mb-2">Select Batches:</p>
                <div className="space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSelectAll}
                    disabled={batches.length === 0}
                  >
                    Select All
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleClearAll}
                    disabled={selectedBatchIds.length === 0}
                  >
                    Clear All
                  </Button>
                </div>
              </div>
              
              <ScrollArea className="h-72">
                <div className="space-y-2">
                  {batches.map((batch) => (
                    <div key={batch.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`batch-${batch.id}`}
                        checked={selectedBatchIds.includes(batch.id)}
                        onCheckedChange={() => handleToggleBatch(batch.id)}
                      />
                      <label 
                        htmlFor={`batch-${batch.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {batch.name}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={submitting || selectedBatchIds.length === 0}
            >
              {submitting ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// force update
