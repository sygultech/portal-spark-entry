
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  is_archived: boolean;
  school_id: string;
}

const AcademicYears = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_date: format(new Date(), "yyyy-MM-dd"),
    end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
  });

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would fetch from Supabase
      // For now, we'll mock the data
      const mockData: AcademicYear[] = [
        {
          id: "1",
          name: "2024-2025",
          start_date: "2024-06-01",
          end_date: "2025-03-31",
          is_active: true,
          is_archived: false,
          school_id: profile?.school_id || "",
        },
        {
          id: "2",
          name: "2023-2024",
          start_date: "2023-06-01",
          end_date: "2024-03-31",
          is_active: false,
          is_archived: true,
          school_id: profile?.school_id || "",
        },
      ];
      
      setAcademicYears(mockData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching academic years:", error);
      toast({
        title: "Error fetching academic years",
        description: "Please try again later.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchAcademicYears();
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    // For now, we'll just update the local state with a mock response
    const newYear: AcademicYear = {
      id: Date.now().toString(),
      ...formData,
      is_active: false,
      is_archived: false,
      school_id: profile?.school_id || "",
    };

    setAcademicYears((prev) => [newYear, ...prev]);
    setIsOpen(false);
    toast({
      title: "Academic year created",
      description: `'${formData.name}' has been added successfully.`,
    });
    
    // Reset form
    setFormData({
      name: "",
      start_date: format(new Date(), "yyyy-MM-dd"),
      end_date: format(new Date(new Date().setFullYear(new Date().getFullYear() + 1)), "yyyy-MM-dd"),
    });
  };

  const setActiveYear = async (id: string) => {
    // In a real implementation, this would update Supabase
    // For now, we'll just update the local state
    setAcademicYears((prev) =>
      prev.map((year) => ({
        ...year,
        is_active: year.id === id,
      }))
    );
    
    toast({
      title: "Academic year updated",
      description: "Active academic year has been updated.",
    });
  };

  const archiveYear = async (id: string) => {
    // In a real implementation, this would update Supabase
    // For now, we'll just update the local state
    setAcademicYears((prev) =>
      prev.map((year) =>
        year.id === id
          ? { ...year, is_archived: true }
          : year
      )
    );
    
    toast({
      title: "Academic year archived",
      description: "The academic year has been archived.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Academic Years</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Add New Academic Year</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Academic Year</DialogTitle>
              <DialogDescription>
                Add a new academic year with start and end dates.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Academic Year Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. 2024-2025"
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
                <Button type="submit">Create Academic Year</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {academicYears.length > 0 ? (
                academicYears.map((year) => (
                  <TableRow key={year.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {year.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(year.start_date), "MMM d, yyyy")} - {format(new Date(year.end_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {year.is_active && (
                        <Badge variant="default" className="bg-green-500">Active</Badge>
                      )}
                      {year.is_archived && (
                        <Badge variant="outline" className="text-muted-foreground">Archived</Badge>
                      )}
                      {!year.is_active && !year.is_archived && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!year.is_active && !year.is_archived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveYear(year.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        {!year.is_archived && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => archiveYear(year.id)}
                          >
                            Archive
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={year.is_archived}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                    No academic years found. Create your first one.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default AcademicYears;
