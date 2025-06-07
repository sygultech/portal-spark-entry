
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Users, GraduationCap, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  course: {
    id: string;
    name: string;
  };
}

interface GroupedBatches {
  [courseId: string]: {
    courseName: string;
    batches: Batch[];
  };
}

export const BatchTaggingDialog = ({
  open,
  onOpenChange,
  configurationId,
  configurationName
}: BatchTaggingDialogProps) => {
  const { profile } = useAuth();
  const [groupedBatches, setGroupedBatches] = useState<GroupedBatches>({});
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get configuration's academic year
  const [configurationAcademicYear, setConfigurationAcademicYear] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfigurationAcademicYear = async () => {
      if (!configurationId) return;

      try {
        const { data, error } = await supabase
          .from('timetable_configurations')
          .select('academic_year_id')
          .eq('id', configurationId)
          .single();

        if (error) throw error;
        setConfigurationAcademicYear(data.academic_year_id);
      } catch (error) {
        console.error('Error fetching configuration academic year:', error);
      }
    };

    fetchConfigurationAcademicYear();
  }, [configurationId]);

  useEffect(() => {
    const fetchBatches = async () => {
      if (!profile?.school_id || !configurationAcademicYear) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('batches')
          .select(`
            id,
            name,
            code,
            capacity,
            course:courses!course_id (
              id,
              name
            )
          `)
          .eq('school_id', profile.school_id)
          .eq('academic_year_id', configurationAcademicYear)
          .eq('is_archived', false)
          .order('name');

        if (error) throw error;

        // Group batches by course
        const grouped: GroupedBatches = {};
        (data || []).forEach((batch: any) => {
          const courseId = batch.course?.id;
          const courseName = batch.course?.name || 'Unknown Course';

          if (!grouped[courseId]) {
            grouped[courseId] = {
              courseName,
              batches: []
            };
          }

          grouped[courseId].batches.push({
            id: batch.id,
            name: batch.name,
            code: batch.code,
            capacity: batch.capacity,
            course: {
              id: courseId,
              name: courseName
            }
          });
        });

        setGroupedBatches(grouped);
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast({
          title: "Error",
          description: "Failed to load batches. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [profile?.school_id, configurationAcademicYear]);

  // Fetch existing batch mappings when dialog opens
  useEffect(() => {
    const fetchExistingMappings = async () => {
      if (!configurationId || !open) return;

      try {
        const { data, error } = await supabase
          .from('batch_configuration_mapping')
          .select('batch_id')
          .eq('configuration_id', configurationId);

        if (error) throw error;
        setSelectedBatches((data || []).map(mapping => mapping.batch_id));
      } catch (error) {
        console.error('Error fetching existing mappings:', error);
      }
    };

    fetchExistingMappings();
  }, [configurationId, open]);

  // Reset selections when dialog opens/closes or configuration changes
  useEffect(() => {
    if (!open || !configurationId) {
      setSearchTerm("");
    }
  }, [open, configurationId]);

  // Filter batches based on search term
  const getFilteredGroupedBatches = () => {
    if (!searchTerm) return groupedBatches;

    const filtered: GroupedBatches = {};
    Object.entries(groupedBatches).forEach(([courseId, courseData]) => {
      const filteredBatches = courseData.batches.filter(batch =>
        batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        courseData.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filteredBatches.length > 0) {
        filtered[courseId] = {
          ...courseData,
          batches: filteredBatches
        };
      }
    });

    return filtered;
  };

  const filteredGroupedBatches = getFilteredGroupedBatches();
  const totalBatches = Object.values(groupedBatches).reduce((sum, course) => sum + course.batches.length, 0);
  const filteredTotalBatches = Object.values(filteredGroupedBatches).reduce((sum, course) => sum + course.batches.length, 0);

  const handleBatchToggle = (batchId: string) => {
    setSelectedBatches(prev =>
      prev.includes(batchId)
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const handleSelectAll = () => {
    const allFilteredBatchIds = Object.values(filteredGroupedBatches)
      .flatMap(course => course.batches.map(batch => batch.id));

    if (selectedBatches.length === allFilteredBatchIds.length && 
        allFilteredBatchIds.every(id => selectedBatches.includes(id))) {
      // Deselect all filtered batches
      setSelectedBatches(prev => prev.filter(id => !allFilteredBatchIds.includes(id)));
    } else {
      // Select all filtered batches (add to existing selection)
      setSelectedBatches(prev => {
        const newSelection = [...prev];
        allFilteredBatchIds.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleSave = async () => {
    if (!configurationId) return;

    setIsSaving(true);
    
    try {
      // First, delete existing mappings for this configuration
      const { error: deleteError } = await supabase
        .from('batch_configuration_mapping')
        .delete()
        .eq('configuration_id', configurationId);

      if (deleteError) throw deleteError;

      // Then, insert new mappings
      if (selectedBatches.length > 0) {
        const mappings = selectedBatches.map(batchId => ({
          configuration_id: configurationId,
          batch_id: batchId
        }));

        const { error: insertError } = await supabase
          .from('batch_configuration_mapping')
          .insert(mappings);

        if (insertError) throw insertError;
      }

      toast({
        title: "Batches Tagged Successfully",
        description: `${selectedBatches.length} batch(es) have been tagged to ${configurationName}`
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error saving batch mappings:', error);
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
              disabled={filteredTotalBatches === 0}
            >
              {selectedBatches.length === filteredTotalBatches ? "Deselect All" : "Select All"}
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

          {/* Batches List Grouped by Course */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Loading batches...</p>
              </div>
            ) : Object.keys(filteredGroupedBatches).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No batches found</p>
                {searchTerm && (
                  <p className="text-sm">Try adjusting your search terms</p>
                )}
              </div>
            ) : (
              Object.entries(filteredGroupedBatches).map(([courseId, courseData]) => (
                <Card key={courseId} className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookOpen className="h-5 w-5 text-primary" />
                      {courseData.courseName}
                      <Badge variant="outline" className="ml-auto">
                        {courseData.batches.length} batch(es)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {courseData.batches.map((batch) => (
                      <Card key={batch.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                        <CardContent className="p-3">
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
                                {batch.capacity && (
                                  <span>Capacity: {batch.capacity}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
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
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : `Save Configuration`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
