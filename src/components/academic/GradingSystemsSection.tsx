
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradingSystem } from "@/types/academic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, StarOff, Pencil, Trash2, Link } from "lucide-react";
import { GradingSystemDialog } from "./GradingSystemDialog";
import { AssignGradingSystemDialog } from "./AssignGradingSystemDialog";
import { useGradingSystems } from "@/hooks/useGradingSystems";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
import { useToast } from "@/hooks/use-toast";

export const GradingSystemsSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { gradingSystems, isLoading, createGradingSystem, updateGradingSystem, deleteGradingSystem, setDefaultGradingSystem } = useGradingSystems();
  const { school } = useSchoolSettings();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<GradingSystem | null>(null);

  const defaultGradingSystemId = school?.default_grading_system_id;

  const handleCreateSystem = () => {
    setSelectedSystem(null);
    setIsDialogOpen(true);
  };

  const handleEditSystem = (system: GradingSystem) => {
    setSelectedSystem(system);
    setIsDialogOpen(true);
  };

  const handleDeleteSystem = (systemId: string) => {
    // Implement delete functionality
    if (confirm("Are you sure you want to delete this grading system?")) {
      deleteGradingSystem(systemId)
        .then(() => {
          toast({
            title: "Success",
            description: "Grading system deleted successfully"
          });
        })
        .catch(error => {
          toast({
            title: "Error",
            description: `Failed to delete: ${error.message}`,
            variant: "destructive"
          });
        });
    }
  };

  const handleSetDefault = (systemId: string) => {
    setDefaultGradingSystem(systemId)
      .then(() => {
        toast({
          title: "Success",
          description: "Default grading system updated successfully"
        });
      })
      .catch(error => {
        toast({
          title: "Error",
          description: `Failed to set default: ${error.message}`,
          variant: "destructive"
        });
      });
  };

  const handleAssignToBatches = (system: GradingSystem) => {
    setSelectedSystem(system);
    setIsAssignDialogOpen(true);
  };

  const getTypeLabel = (type: 'marks' | 'grades' | 'hybrid') => {
    switch (type) {
      case 'marks':
        return 'Marks Based';
      case 'grades':
        return 'Grade Based';
      case 'hybrid':
        return 'Hybrid';
    }
  };

  const handleSubmitGradingSystem = async (data: any) => {
    try {
      if (selectedSystem) {
        await updateGradingSystem({
          id: selectedSystem.id,
          data
        });
        toast({
          title: "Success",
          description: "Grading system updated successfully"
        });
      } else {
        await createGradingSystem(data);
        toast({
          title: "Success",
          description: "Grading system created successfully"
        });
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: `Failed to save: ${error.message}`,
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return <div className="p-4">Loading grading systems...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Grading Systems</CardTitle>
            <CardDescription>
              Manage your institution's grading systems and set defaults
            </CardDescription>
          </div>
          <Button onClick={handleCreateSystem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grading System
          </Button>
        </CardHeader>
        <CardContent>
          {gradingSystems.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No grading systems found. Create your first system to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Grade Thresholds</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradingSystems.map((system) => (
                  <TableRow key={system.id}>
                    <TableCell className="font-medium">
                      {system.name}
                      {system.id === defaultGradingSystemId && (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getTypeLabel(system.type)}
                      </Badge>
                    </TableCell>
                    <TableCell>{system.passing_score}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {system.thresholds.slice(0, 3).map((threshold, index) => (
                          <Badge key={index} variant="outline">
                            {threshold.grade}: {threshold.min_score}-{threshold.max_score}
                          </Badge>
                        ))}
                        {system.thresholds.length > 3 && (
                          <Badge variant="outline">+{system.thresholds.length - 3} more</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Mock usage data */}
                      <div className="text-sm text-muted-foreground">
                        Used in 2 batches, 5 subjects
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {system.id !== defaultGradingSystemId ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetDefault(system.id)}
                            title="Set as Default"
                          >
                            <StarOff className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-yellow-500"
                            title="Default System"
                          >
                            <Star className="h-4 w-4 fill-current" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleAssignToBatches(system)}
                          title="Assign to Batches"
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditSystem(system)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteSystem(system.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <GradingSystemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        system={selectedSystem}
        onSubmit={handleSubmitGradingSystem}
      />

      <AssignGradingSystemDialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        system={selectedSystem}
      />
    </div>
  );
};

export default GradingSystemsSection;

// force update
