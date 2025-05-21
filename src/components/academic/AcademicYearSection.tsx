
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Check, CalendarDays, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import AcademicYearFormDialog from "./AcademicYearFormDialog";
import DeleteAcademicYearDialog from "./DeleteAcademicYearDialog";

interface AcademicYearSectionProps {
  onCurrentYearChange?: (yearId: string | null) => void;
}

const AcademicYearSection = ({ onCurrentYearChange }: AcademicYearSectionProps) => {
  const { profile } = useAuth();
  const { academicYears, isLoading, createAcademicYear, updateAcademicYear, deleteAcademicYear, setCurrentAcademicYear, toggleLockStatus } = useAcademicYears();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<any>(null);

  // When academic years load or change, notify parent component of current year
  useEffect(() => {
    if (academicYears?.length > 0) {
      const currentYear = academicYears.find(year => year.is_current);
      if (currentYear && onCurrentYearChange) {
        onCurrentYearChange(currentYear.id);
      }
    }
  }, [academicYears, onCurrentYearChange]);
  
  const handleCreateClick = () => {
    setSelectedYear(null);
    setIsDialogOpen(true);
  };
  
  const handleEditClick = (year: any) => {
    setSelectedYear(year);
    setIsDialogOpen(true);
  };
  
  const handleDeleteClick = (year: any) => {
    setSelectedYear(year);
    setIsDeleteDialogOpen(true);
  };
  
  const handleSetCurrentClick = (id: string) => {
    setCurrentAcademicYear(id);
    if (onCurrentYearChange) {
      onCurrentYearChange(id);
    }
  };
  
  const handleToggleLock = (id: string, isLocked: boolean) => {
    toggleLockStatus({ id, isLocked: !isLocked });
  };
  
  const handleSaveAcademicYear = async (values: any) => {
    if (selectedYear) {
      updateAcademicYear({
        id: selectedYear.id,
        ...values
      });
    } else if (profile?.school_id) {
      createAcademicYear({
        ...values,
        school_id: profile.school_id
      });
    }
    setIsDialogOpen(false);
  };
  
  const handleConfirmDelete = async () => {
    if (selectedYear) {
      deleteAcademicYear(selectedYear.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Academic Years</CardTitle>
          <CardDescription>Manage your school's academic years</CardDescription>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Academic Year
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-6 text-center text-muted-foreground">Loading academic years...</div>
        ) : academicYears.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground" />
            <div>
              <h3 className="text-lg font-medium">No academic years found</h3>
              <p className="text-sm text-muted-foreground">
                Create your first academic year to get started.
              </p>
            </div>
            <Button variant="outline" onClick={handleCreateClick}>
              <Plus className="mr-2 h-4 w-4" />
              Add Academic Year
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[400px] rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYears.map((year) => (
                  <TableRow key={year.id} className={year.is_current ? "bg-muted/40" : ""}>
                    <TableCell className="font-medium">{year.name}</TableCell>
                    <TableCell>
                      {format(new Date(year.start_date), "MMM d, yyyy")} - {format(new Date(year.end_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        {year.is_current && <Badge variant="default">Current</Badge>}
                        {year.is_locked && <Badge variant="secondary">Locked</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <span className="sr-only">Open menu</span>
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!year.is_current && (
                            <DropdownMenuItem onClick={() => handleSetCurrentClick(year.id)}>
                              <Check className="mr-2 h-4 w-4" /> Set as Current
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleEditClick(year)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleLock(year.id, year.is_locked)}>
                            {year.is_locked ? (
                              <>
                                <Unlock className="mr-2 h-4 w-4" /> Unlock
                              </>
                            ) : (
                              <>
                                <Lock className="mr-2 h-4 w-4" /> Lock
                              </>
                            )}
                          </DropdownMenuItem>
                          {!year.is_current && (
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteClick(year)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
      
      <AcademicYearFormDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleSaveAcademicYear}
        academicYear={selectedYear}
      />
      
      <DeleteAcademicYearDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        yearName={selectedYear?.name || ""}
      />
    </Card>
  );
};

export default AcademicYearSection;

// force update

// force update
