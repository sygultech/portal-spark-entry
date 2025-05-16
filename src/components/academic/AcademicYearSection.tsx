
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CalendarDays, PlusCircle, Edit, Trash, Copy, Calendar, Lock, Unlock } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AcademicYear } from "@/types/academic";
import AcademicYearFormDialog, { AcademicYearFormValues } from "./AcademicYearFormDialog";
import DeleteAcademicYearDialog from "./DeleteAcademicYearDialog";
import { 
  getAcademicYears, 
  createAcademicYear, 
  updateAcademicYear,
  deleteAcademicYear,
  cloneAcademicYear,
  setCurrentAcademicYear,
  toggleLockAcademicYear
} from "@/services/academicYearService";
import { AlertCircle } from "lucide-react";

const AcademicYearSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);

  // Fetch academic years
  const { data: academicYears = [], isLoading, error } = useQuery({
    queryKey: ['academicYears', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) return [];
      return getAcademicYears(profile.school_id);
    },
    enabled: !!profile?.school_id
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: AcademicYearFormValues) => {
      if (!profile?.school_id) throw new Error("School ID is required");
      return createAcademicYear(data, profile.school_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: "Academic Year Created",
        description: "The academic year has been created successfully."
      });
    },
    onError: (error) => {
      console.error("Error creating academic year:", error);
      toast({
        title: "Error Creating Academic Year",
        description: "There was an error creating the academic year. Please try again.",
        variant: "destructive"
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; values: AcademicYearFormValues }) => 
      updateAcademicYear(data.id, data.values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: "Academic Year Updated",
        description: "The academic year has been updated successfully."
      });
    },
    onError: (error) => {
      console.error("Error updating academic year:", error);
      toast({
        title: "Error Updating Academic Year",
        description: "There was an error updating the academic year. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: "Academic Year Deleted",
        description: "The academic year has been deleted successfully."
      });
    },
    onError: (error) => {
      console.error("Error deleting academic year:", error);
      toast({
        title: "Error Deleting Academic Year",
        description: "There was an error deleting the academic year. Please try again.",
        variant: "destructive"
      });
    }
  });

  const cloneMutation = useMutation({
    mutationFn: (data: { sourceId: string; newYear: AcademicYearFormValues }) => {
      if (!profile?.school_id) throw new Error("School ID is required");
      return cloneAcademicYear(data.sourceId, data.newYear, profile.school_id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: "Academic Year Cloned",
        description: "The academic year has been cloned successfully."
      });
    },
    onError: (error) => {
      console.error("Error cloning academic year:", error);
      toast({
        title: "Error Cloning Academic Year",
        description: "There was an error cloning the academic year. Please try again.",
        variant: "destructive"
      });
    }
  });

  const setCurrentMutation = useMutation({
    mutationFn: (id: string) => setCurrentAcademicYear(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: "Current Year Updated",
        description: "The current academic year has been updated successfully."
      });
    },
    onError: (error) => {
      console.error("Error setting current academic year:", error);
      toast({
        title: "Error Setting Current Year",
        description: "There was an error updating the current academic year. Please try again.",
        variant: "destructive"
      });
    }
  });

  const toggleLockMutation = useMutation({
    mutationFn: (data: { id: string; isLocked: boolean }) => 
      toggleLockAcademicYear(data.id, data.isLocked),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] });
      toast({
        title: data.is_locked ? "Academic Year Locked" : "Academic Year Unlocked",
        description: `The academic year has been ${data.is_locked ? "locked" : "unlocked"} successfully.`
      });
    },
    onError: (error) => {
      console.error("Error toggling lock on academic year:", error);
      toast({
        title: "Error Updating Academic Year",
        description: "There was an error updating the academic year lock status. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateSubmit = async (data: AcademicYearFormValues) => {
    await createMutation.mutateAsync(data);
    setCreateDialogOpen(false);
  };

  const handleEditSubmit = async (data: AcademicYearFormValues) => {
    if (!selectedYear) return;
    await updateMutation.mutateAsync({ id: selectedYear.id, values: data });
    setEditDialogOpen(false);
  };

  const handleCloneSubmit = async (data: AcademicYearFormValues) => {
    if (!selectedYear) return;
    await cloneMutation.mutateAsync({ sourceId: selectedYear.id, newYear: data });
    setCloneDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedYear) return;
    await deleteMutation.mutateAsync(selectedYear.id);
    setDeleteDialogOpen(false);
  };

  const handleSetCurrent = async (year: AcademicYear) => {
    if (year.is_current) return;
    await setCurrentMutation.mutateAsync(year.id);
  };

  const handleToggleLock = async (year: AcademicYear) => {
    await toggleLockMutation.mutateAsync({ id: year.id, isLocked: !year.is_locked });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Academic Years</CardTitle>
          <CardDescription>Manage academic years for your school</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold">Error Loading Academic Years</h3>
            <p className="text-muted-foreground mt-2 max-w-md">
              There was an error loading your academic years. Please try refreshing the page.
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['academicYears', profile?.school_id] })}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>Manage academic years for your school</CardDescription>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Year
          </Button>
        </CardHeader>
        <CardContent>
          {academicYears.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold">No Academic Years</h3>
              <p className="text-muted-foreground mt-2 max-w-md">
                You haven't created any academic years yet. Create your first academic year to get started.
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Academic Year
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {academicYears.map((year) => (
                <div key={year.id} className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-3 rounded-full">
                      <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{year.name}</h3>
                        {year.is_current && <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Current</Badge>}
                        {year.is_locked && <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">Locked</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(year.start_date)} - {formatDate(year.end_date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!year.is_current && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetCurrent(year)}
                        disabled={year.is_locked}
                        title={year.is_locked ? "This academic year is locked" : "Set as current"}
                      >
                        Set Current
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">⋯</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedYear(year);
                            setEditDialogOpen(true);
                          }}
                          disabled={year.is_locked}
                          className={year.is_locked ? "cursor-not-allowed opacity-50" : ""}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedYear(year);
                            setCloneDialogOpen(true);
                          }}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Clone
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleLock(year)}
                          disabled={year.is_current}
                          className={year.is_current ? "cursor-not-allowed opacity-50" : ""}
                        >
                          {year.is_locked ? (
                            <>
                              <Unlock className="h-4 w-4 mr-2" />
                              Unlock
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Lock
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedYear(year);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={year.is_current || year.is_locked}
                          className={
                            (year.is_current || year.is_locked) 
                              ? "cursor-not-allowed opacity-50 text-red-500" 
                              : "text-red-500"
                          }
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <AcademicYearFormDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Dialog */}
      {selectedYear && (
        <AcademicYearFormDialog
          isOpen={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          onSubmit={handleEditSubmit}
          academicYear={selectedYear}
        />
      )}

      {/* Clone Dialog */}
      {selectedYear && (
        <AcademicYearFormDialog
          isOpen={cloneDialogOpen}
          onClose={() => setCloneDialogOpen(false)}
          onSubmit={handleCloneSubmit}
          academicYear={selectedYear}
          isCloning={true}
        />
      )}

      {/* Delete Dialog */}
      {selectedYear && (
        <DeleteAcademicYearDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          yearName={selectedYear.name}
        />
      )}
    </>
  );
};

export default AcademicYearSection;
