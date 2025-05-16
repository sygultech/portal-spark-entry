
import { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useAcademic } from "@/contexts/AcademicContext";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import {
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { AcademicYear } from '@/types/academic';

const AcademicYears = () => {
  const { profile } = useAuth();
  const { currentAcademicYear, setCurrentAcademicYear } = useAcademic();
  
  const {
    academicYears,
    isLoading,
    createAcademicYear,
    updateAcademicYear,
    deleteAcademicYear,
    setActiveAcademicYear,
    archiveAcademicYear,
    cloneStructure,
    isCreating,
    isUpdating,
    isDeleting,
    isActivating,
    isArchiving,
    isCloning
  } = useAcademicYears();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<AcademicYear | null>(null);
  const [cloneOptions, setCloneOptions] = useState({
    sourceYearId: "",
    targetYearId: "",
    cloneCourses: true,
    cloneBatches: true,
    cloneSubjects: true,
    cloneGrading: false,
    cloneElectives: false
  });
  
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: ""
  });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleCreateAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!profile?.school_id) {
        throw new Error("School ID not found");
      }
      
      createAcademicYear({
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        school_id: profile.school_id,
        is_active: false,
        is_archived: false
      });
      
      setFormData({ name: "", start_date: "", end_date: "" });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error("Error creating academic year:", error);
    }
  };
  
  const handleEditAcademicYear = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!selectedYear) return;
      
      updateAcademicYear({
        id: selectedYear.id,
        academicYear: {
          name: formData.name,
          start_date: formData.start_date,
          end_date: formData.end_date
        }
      });
      
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error updating academic year:", error);
    }
  };
  
  const handleSetActive = async (yearId: string) => {
    try {
      setActiveAcademicYear(yearId);
      
      // Find the activated year in the list and set it as current
      const foundYear = academicYears.find(y => y.id === yearId);
      if (foundYear) {
        setCurrentAcademicYear(foundYear);
      }
    } catch (error) {
      console.error("Error setting active academic year:", error);
    }
  };
  
  const handleArchive = async (yearId: string) => {
    try {
      archiveAcademicYear(yearId);
    } catch (error) {
      console.error("Error archiving academic year:", error);
    }
  };
  
  const handleDelete = async (yearId: string) => {
    try {
      deleteAcademicYear(yearId);
    } catch (error) {
      console.error("Error deleting academic year:", error);
    }
  };
  
  const handleCloneStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      cloneStructure({
        source_year_id: cloneOptions.sourceYearId,
        target_year_id: cloneOptions.targetYearId,
        clone_courses: cloneOptions.cloneCourses,
        clone_batches: cloneOptions.cloneBatches,
        clone_subjects: cloneOptions.cloneSubjects,
        clone_grading: cloneOptions.cloneGrading,
        clone_electives: cloneOptions.cloneElectives
      });
      
      setIsCloneDialogOpen(false);
    } catch (error) {
      console.error("Error cloning academic structure:", error);
    }
  };
  
  const openEditDialog = (year: AcademicYear) => {
    setSelectedYear(year);
    setFormData({
      name: year.name,
      start_date: year.start_date,
      end_date: year.end_date
    });
    setIsEditDialogOpen(true);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Academic Years</h3>
        <div className="flex gap-2">
          <Dialog open={isCloneDialogOpen} onOpenChange={setIsCloneDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={isCloning}>Clone Structure</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Clone Academic Structure</DialogTitle>
                <DialogDescription>
                  Copy courses, batches, subjects, and settings from one academic year to another.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCloneStructure}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sourceYearId">Source Academic Year</Label>
                    <select 
                      id="sourceYearId" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={cloneOptions.sourceYearId}
                      onChange={(e) => setCloneOptions(prev => ({ ...prev, sourceYearId: e.target.value }))}
                      required
                    >
                      <option value="">Select source academic year</option>
                      {academicYears.map((year) => (
                        <option key={year.id} value={year.id}>{year.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="targetYearId">Target Academic Year</Label>
                    <select 
                      id="targetYearId" 
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={cloneOptions.targetYearId}
                      onChange={(e) => setCloneOptions(prev => ({ ...prev, targetYearId: e.target.value }))}
                      required
                    >
                      <option value="">Select target academic year</option>
                      {academicYears
                        .filter(year => year.id !== cloneOptions.sourceYearId)
                        .map((year) => (
                          <option key={year.id} value={year.id}>{year.name}</option>
                        ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Clone Options</Label>
                    <div className="grid gap-2">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="cloneCourses" 
                          checked={cloneOptions.cloneCourses}
                          onChange={(e) => setCloneOptions(prev => ({ ...prev, cloneCourses: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cloneCourses" className="cursor-pointer">Courses</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="cloneBatches" 
                          checked={cloneOptions.cloneBatches}
                          onChange={(e) => setCloneOptions(prev => ({ ...prev, cloneBatches: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          disabled={!cloneOptions.cloneCourses}
                        />
                        <Label htmlFor="cloneBatches" className={!cloneOptions.cloneCourses ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>Batches</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="cloneSubjects" 
                          checked={cloneOptions.cloneSubjects}
                          onChange={(e) => setCloneOptions(prev => ({ ...prev, cloneSubjects: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cloneSubjects" className="cursor-pointer">Subjects</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="cloneGrading" 
                          checked={cloneOptions.cloneGrading}
                          onChange={(e) => setCloneOptions(prev => ({ ...prev, cloneGrading: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <Label htmlFor="cloneGrading" className="cursor-pointer">Grading Systems</Label>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="cloneElectives" 
                          checked={cloneOptions.cloneElectives}
                          onChange={(e) => setCloneOptions(prev => ({ ...prev, cloneElectives: e.target.checked }))}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          disabled={!cloneOptions.cloneCourses}
                        />
                        <Label htmlFor="cloneElectives" className={!cloneOptions.cloneCourses ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}>Elective Groups</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isCloning}>
                    {isCloning ? "Cloning..." : "Clone Structure"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={isCreating}>Create New Year</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Academic Year</DialogTitle>
                <DialogDescription>
                  Add a new academic year to your school calendar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateAcademicYear}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Academic Year Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. 2025-2026"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      name="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      name="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : academicYears.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No academic years found</h3>
            <p className="text-muted-foreground mt-1">
              Create your first academic year to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears
                .sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime())
                .map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {year.name}
                        {year.id === currentAcademicYear?.id && (
                          <Badge variant="outline" className="ml-2">Current</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(year.start_date), "MMM d, yyyy")} - {format(new Date(year.end_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {year.is_archived ? (
                        <Badge variant="secondary">Archived</Badge>
                      ) : year.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openEditDialog(year)}
                          disabled={year.is_archived || isUpdating}
                        >
                          Edit
                        </Button>
                        {!year.is_active && !year.is_archived && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleSetActive(year.id)}
                            disabled={isActivating}
                          >
                            Set Active
                          </Button>
                        )}
                        {!year.is_archived && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleArchive(year.id)}
                            disabled={isArchiving}
                          >
                            Archive
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(year.id)}
                          disabled={year.is_active || isDeleting}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Academic Year</DialogTitle>
            <DialogDescription>
              Update the details of the academic year.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditAcademicYear}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Academic Year Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. 2025-2026"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-start_date">Start Date</Label>
                <Input
                  id="edit-start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-end_date">End Date</Label>
                <Input
                  id="edit-end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AcademicYears;
