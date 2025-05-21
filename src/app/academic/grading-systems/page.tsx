
'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { GradingSystem } from "@/types/academic";
import { useGradingSystems } from "@/hooks/useGradingSystems";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";
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
import { GradingSystemDialog } from "@/components/academic/GradingSystemDialog";
import { AssignGradingSystemDialog } from "@/components/academic/AssignGradingSystemDialog";
import { useToast } from "@/hooks/use-toast";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

export default function GradingSystemsPage() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const { school } = useSchoolSettings();
  
  const {
    gradingSystems,
    isLoading,
    createGradingSystem,
    updateGradingSystem,
    deleteGradingSystem,
    setDefaultGradingSystem,
    getGradingSystemUsage
  } = useGradingSystems();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<GradingSystem | null>(null);
  const [systemUsage, setSystemUsage] = useState<{ [key: string]: { batch_count: number, subject_count: number } }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [systemToDelete, setSystemToDelete] = useState<GradingSystem | null>(null);

  // Load usage stats for all grading systems
  useEffect(() => {
    if (gradingSystems.length > 0) {
      const loadUsageStats = async () => {
        const usageData: { [key: string]: { batch_count: number, subject_count: number } } = {};
        
        for (const system of gradingSystems) {
          try {
            const usage = await getGradingSystemUsage(system.id);
            usageData[system.id] = usage;
          } catch (error) {
            console.error(`Error loading usage for system ${system.id}:`, error);
          }
        }
        
        setSystemUsage(usageData);
      };
      
      loadUsageStats();
    }
  }, [gradingSystems, getGradingSystemUsage]);

  const defaultGradingSystemId = school?.default_grading_system_id;

  const handleCreateSystem = () => {
    setSelectedSystem(null);
    setIsDialogOpen(true);
  };

  const handleEditSystem = (system: GradingSystem) => {
    setSelectedSystem(system);
    setIsDialogOpen(true);
  };

  const handleDeleteSystem = (system: GradingSystem) => {
    setSystemToDelete(system);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!systemToDelete) return;
    
    try {
      await deleteGradingSystem(systemToDelete.id);
      setDeleteDialogOpen(false);
      setSystemToDelete(null);
    } catch (error) {
      console.error("Error deleting system:", error);
    }
  };

  const handleSetDefault = async (system: GradingSystem) => {
    try {
      await setDefaultGradingSystem(system.id);
      toast({
        title: "Default Updated",
        description: `${system.name} is now the default grading system.`
      });
    } catch (error) {
      console.error("Error setting default system:", error);
      toast({
        title: "Error",
        description: "Failed to set default grading system.",
        variant: "destructive"
      });
    }
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
      } else {
        await createGradingSystem(data);
      }
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error saving grading system:", error);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading grading systems...</div>;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
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
            <div className="text-center py-8 text-muted-foreground">
              No grading systems found. Create your first grading system to get started.
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
                        {system.thresholds && system.thresholds.map((threshold, index) => (
                          <Badge key={index} variant="outline">
                            {threshold.grade}: {threshold.min_score}-{threshold.max_score}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {systemUsage[system.id] ? (
                          <>
                            Used in {systemUsage[system.id].batch_count} batches, 
                            {systemUsage[system.id].subject_count} subjects
                          </>
                        ) : (
                          "Loading usage data..."
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {system.id !== defaultGradingSystemId ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSetDefault(system)}
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
                          onClick={() => handleDeleteSystem(system)}
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Grading System</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this grading system? 
              {systemUsage[systemToDelete?.id || ''] && 
                systemUsage[systemToDelete?.id || ''].batch_count + 
                systemUsage[systemToDelete?.id || ''].subject_count > 0 && (
                <span className="block mt-2 text-destructive">
                  Warning: This grading system is currently in use by batches or subjects.
                  Deleting it will remove the association from those items.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
