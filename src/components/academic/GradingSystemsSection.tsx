
import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GradingSystem } from "@/types/academic";

const GradingSystemsSection = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  // Fetch grading systems
  const { data: gradingSystems = [], isLoading } = useQuery({
    queryKey: ['gradingSystems', profile?.school_id],
    queryFn: async () => {
      if (!profile?.school_id) throw new Error("School ID is required");
      
      const { data, error } = await supabase
        .from('grading_systems')
        .select(`
          *,
          grade_scales:grade_scales(*)
        `)
        .eq('school_id', profile.school_id)
        .order('name');
        
      if (error) throw error;
      return data as GradingSystem[];
    },
    enabled: !!profile?.school_id
  });

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Grading Systems</CardTitle>
          <CardDescription>Configure custom grading scales for your school</CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Grading System
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <FileText className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold">Grading Systems</h3>
          <p className="text-muted-foreground mt-2 max-w-md">
            Create custom grading systems for different courses and assessment types.
          </p>
          <Button className="mt-4">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create First Grading System
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradingSystemsSection;
