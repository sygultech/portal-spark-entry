
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { CalendarDays, PlusCircle, Edit, Trash, Copy, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AcademicYear } from "@/types/academic";

const AcademicYearSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [openDialog, setOpenDialog] = useState(false);
  
  // Mock data for now - will be replaced once database tables are created
  const mockAcademicYears: AcademicYear[] = [
    {
      id: "1",
      name: "Academic Year 2024-2025",
      start_date: "2024-06-01",
      end_date: "2025-04-30",
      is_current: true,
      is_locked: false,
      school_id: profile?.school_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: "2",
      name: "Academic Year 2023-2024",
      start_date: "2023-06-01",
      end_date: "2024-04-30",
      is_current: false,
      is_locked: true,
      school_id: profile?.school_id || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  // Use mock data for now
  const { data: academicYears = mockAcademicYears, isLoading } = useQuery({
    queryKey: ['academicYears', profile?.school_id],
    queryFn: async () => {
      // Return mock data - comment out the actual database query for now
      return mockAcademicYears;
      
      /* This will be uncommented once the database tables are created
      if (!profile?.school_id) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('academic_years')
        .select('*')
        .eq('school_id', profile.school_id)
        .order('start_date', { ascending: false });
        
      if (error) throw error;
      return data as AcademicYear[];
      */
    },
    enabled: !!profile?.school_id
  });

  const handleOpenCreateDialog = () => {
    setOpenDialog(true);
    toast({
      title: "Feature Coming Soon",
      description: "The academic year management functionality will be available soon."
    });
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Academic Years</CardTitle>
            <CardDescription>Manage academic years for your school</CardDescription>
          </div>
          <Button onClick={handleOpenCreateDialog}>
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
              <Button onClick={handleOpenCreateDialog} className="mt-4">
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
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Cloning functionality will be available soon."
                        });
                      }}
                      title="Clone"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Edit functionality will be available soon."
                        });
                      }}
                      disabled={year.is_locked}
                      title={year.is_locked ? "This academic year is locked" : "Edit"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        toast({
                          title: "Feature Coming Soon",
                          description: "Delete functionality will be available soon."
                        });
                      }}
                      disabled={year.is_current || year.is_locked}
                      title={
                        year.is_current 
                          ? "Cannot delete current academic year" 
                          : year.is_locked 
                          ? "This academic year is locked"
                          : "Delete"
                      }
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default AcademicYearSection;
