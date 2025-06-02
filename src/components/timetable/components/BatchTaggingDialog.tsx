
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useBatches } from "@/hooks/useBatches";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface BatchTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  configurationId: string | null;
  configurationName: string;
}

interface Batch {
  id: string;
  name: string;
  code?: string;
  capacity?: number;
  course?: {
    name: string;
  };
}

export const BatchTaggingDialog = ({
  open,
  onOpenChange,
  configurationId,
  configurationName
}: BatchTaggingDialogProps) => {
  const { profile } = useAuth();
  const { batches, isLoading } = useBatches(profile?.school_id);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Reset selections when dialog opens/closes or configuration changes
  useEffect(() => {
    if (!open || !configurationId) {
      setSelectedBatches([]);
      setSearchTerm("");
    }
  }, [open, configurationId]);

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.course?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBatches.length === filteredBatches.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(filteredBatches.map(batch => batch.id));
    }
  };

  const handleSave = async () => {
    if (selectedBatches.length === 0) {
      toast({
        title: "No Batches Selected",
        description: "Please select at least one batch to tag to this configuration.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    
    try {
      // TODO: Implement actual API call to save batch-configuration mapping
      console.log('Tagging batches to configuration:', {
        configurationId,
        batchIds: selectedBatches
      });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast({
        title: "Batches Tagged Successfully",
        description: `${selectedBatches.length} batch(es) have been tagged to ${configurationName}`
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to tag batches to configuration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!configurationId) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Tag Batches to Configuration
          </DialogTitle>
          <DialogDescription>
            Select which batches should use the "{configurationName}" timetable configuration.
            Tagged batches will follow this specific schedule instead of the default one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Search and Selection Controls */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search batches by name, code, or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={filteredBatches.length === 0}
            >
              {selectedBatches.length === filteredBatches.length ? "Deselect All" : "Select All"}
            </Button>
          </div>

          {/* Selected Count */}
          {selectedBatches.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedBatches.length} batch(es) selected
              </Badge>
            </div>
          )}

          {/* Batches List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No batches found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              filteredBatches.map((batch) => (
                <Card key={batch.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedBatches.includes(batch.id)}
                        onCheckedChange={() => handleBatchToggle(batch.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{batch.name}</span>
                          {batch.code && (
                            <Badge variant="outline" className="text-xs">
                              {batch.code}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          {batch.course?.name && (
                            <span>Course: {batch.course.name}</span>
                          )}
                          {batch.capacity && (
                            <span>Capacity: {batch.capacity}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || selectedBatches.length === 0}
          >
            {isSaving ? "Saving..." : `Tag ${selectedBatches.length} Batch(es)`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
