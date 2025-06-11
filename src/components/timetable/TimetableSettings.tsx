import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Loader2, Timer } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TimePeriodConfiguration } from "./TimePeriodConfiguration";
import { BatchTaggingDialog } from "./components/BatchTaggingDialog";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { ConfigurationCard } from "./components/ConfigurationCard";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { useTimetableConfiguration } from "@/hooks/useTimetableConfiguration";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface TimePeriodConfig {
  id: string;
  name: string;
  isActive: boolean;
  isDefault: boolean;
}

export const TimetableSettings = () => {
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();
  
  const { getTimetableConfigurations, saveTimetableConfiguration } = useTimetableConfiguration();
  const { profile } = useAuth();
  const [periodConfigurations, setPeriodConfigurations] = useState<TimePeriodConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'view' | 'edit' | null>(null);
  const [batchTaggingDialogOpen, setBatchTaggingDialogOpen] = useState(false);
  const [selectedConfigForTagging, setSelectedConfigForTagging] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchConfigurations = async () => {
      if (!profile?.school_id || !selectedAcademicYear) return;
      
      setIsLoading(true);
      try {
        const configs = await getTimetableConfigurations(profile.school_id, selectedAcademicYear);
        setPeriodConfigurations(configs.map(config => ({
          id: config.id,
          name: config.name,
          isActive: config.isActive,
          isDefault: config.isDefault
        })));
      } catch (error) {
        console.error('Error fetching configurations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConfigurations();
  }, [profile?.school_id, selectedAcademicYear]);

  const handleAddPeriodConfiguration = () => {
    console.log('Adding new configuration');
    const newConfig: TimePeriodConfig = {
      id: `config-${Date.now()}`,
      name: `Configuration ${periodConfigurations.length + 1}`,
      isActive: false,
      isDefault: false
    };
    setPeriodConfigurations(prev => [...prev, newConfig]);
    setActiveConfigId(newConfig.id);
    setViewMode('edit');
    
    toast({
      title: "New Configuration Added",
      description: `${newConfig.name} has been created`
    });
  };

  const handleEditConfiguration = (configId: string) => {
    console.log('Edit button clicked for config:', configId);
    console.log('Current activeConfigId:', activeConfigId);
    console.log('Current viewMode:', viewMode);
    
    setActiveConfigId(configId);
    setViewMode('edit');
    
    console.log('After setting - activeConfigId:', configId, 'viewMode:', 'edit');
    
    toast({
      title: "Opening Configuration",
      description: "Loading configuration for editing..."
    });
  };

  const handleViewConfiguration = (configId: string) => {
    console.log('View button clicked for config:', configId);
    setActiveConfigId(configId);
    setViewMode('view');
  };

  const handleCloneConfiguration = async (configId: string) => {
    const originalConfig = periodConfigurations.find(c => c.id === configId);
    if (!originalConfig) return;

    // If it's an existing config (not a temp one), fetch its full data and clone it
    if (!configId.startsWith('config-') && profile?.school_id && selectedAcademicYear) {
      try {
        const configs = await getTimetableConfigurations(profile.school_id, selectedAcademicYear);
        const configToClone = configs.find(c => c.id === configId);
        
        if (configToClone) {
          // Create the clone with updated details
          const clonedConfig: TimePeriodConfig = {
            id: `config-${Date.now()}`, // Temporary ID for new config
            name: `${originalConfig.name} (Copy)`,
            isActive: false,
            isDefault: false
          };

          // Save the cloned configuration
          const result = await saveTimetableConfiguration({
            schoolId: profile.school_id,
            name: clonedConfig.name,
            isActive: clonedConfig.isActive,
            isDefault: clonedConfig.isDefault,
            academicYearId: selectedAcademicYear,
            isWeeklyMode: configToClone.isWeeklyMode,
            fortnightStartDate: configToClone.fortnightStartDate,
            selectedDays: configToClone.selectedDays,
            defaultPeriods: configToClone.defaultPeriods,
            daySpecificPeriods: configToClone.daySpecificPeriods,
            enableFlexibleTimings: Object.keys(configToClone.daySpecificPeriods || {}).length > 0,
            batchIds: null
          });

          if (result) {
            // Refresh configurations to show the new cloned one
            await fetchConfigurations();
            toast({
              title: "Configuration Cloned",
              description: `${clonedConfig.name} has been created successfully`
            });
          }
        }
      } catch (error) {
        console.error('Error cloning configuration:', error);
        toast({
          title: "Error Cloning Configuration",
          description: "Failed to clone the configuration. Please try again.",
          variant: "destructive"
        });
      }
    } else {
      // For temporary configs, just create a simple clone
      const clonedConfig: TimePeriodConfig = {
        id: `config-${Date.now()}`,
        name: `${originalConfig.name} (Copy)`,
        isActive: false,
        isDefault: false
      };

      setPeriodConfigurations(prev => [...prev, clonedConfig]);
      
      toast({
        title: "Configuration Cloned",
        description: `${clonedConfig.name} has been created`
      });
    }
  };

  const fetchConfigurations = async () => {
    if (!profile?.school_id || !selectedAcademicYear) return;
    
    setIsLoading(true);
    try {
      const configs = await getTimetableConfigurations(profile.school_id, selectedAcademicYear);
      setPeriodConfigurations(configs.map(config => ({
        id: config.id,
        name: config.name,
        isActive: config.isActive,
        isDefault: config.isDefault
      })));
    } catch (error) {
      console.error('Error fetching configurations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveConfiguration = async (configId: string) => {
    const config = periodConfigurations.find(c => c.id === configId);
    
    // If it's an existing configuration (not temporary), delete from database
    if (!configId.startsWith('config-') && profile?.school_id) {
      try {
        const { error } = await supabase
          .from('timetable_configurations')
          .delete()
          .eq('id', configId);

        if (error) {
          throw error;
        }
      } catch (error) {
        console.error('Error deleting configuration:', error);
        toast({
          title: "Error Deleting Configuration",
          description: "Failed to delete the configuration. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    setPeriodConfigurations(prev => prev.filter(c => c.id !== configId));
    
    if (activeConfigId === configId) {
      setActiveConfigId(null);
      setViewMode(null);
    }
    
    if (config) {
      toast({
        title: "Configuration Removed",
        description: `${config.name} has been deleted`
      });
    }
  };

  const handleConfigurationSaved = async () => {
    // Refresh configurations after saving
    await fetchConfigurations();
    setActiveConfigId(null);
    setViewMode(null);
  };

  const handleToggleActive = async (configId: string, isActive: boolean) => {
    // For temporary configurations, just update the state
    if (configId.startsWith('config-')) {
      setPeriodConfigurations(prev => prev.map(config => 
        config.id === configId ? { ...config, isActive } : config
      ));
      
      const config = periodConfigurations.find(c => c.id === configId);
      toast({
        title: isActive ? "Configuration Activated" : "Configuration Deactivated",
        description: `${config?.name} is now ${isActive ? 'active' : 'inactive'}`
      });
      return;
    }

    // For existing configurations, update in database
    try {
      const { error } = await supabase
        .from('timetable_configurations')
        .update({ is_active: isActive })
        .eq('id', configId);

      if (error) {
        throw error;
      }

      // Update local state
      setPeriodConfigurations(prev => prev.map(config => 
        config.id === configId ? { ...config, isActive } : config
      ));
      
      const config = periodConfigurations.find(c => c.id === configId);
      toast({
        title: isActive ? "Configuration Activated" : "Configuration Deactivated",
        description: `${config?.name} is now ${isActive ? 'active' : 'inactive'}`
      });
    } catch (error) {
      console.error('Error updating active status:', error);
      toast({
        title: "Error",
        description: "Failed to update configuration status. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleToggleDefault = async (configId: string, isDefault: boolean) => {
    // For temporary configurations, just update the state
    if (configId.startsWith('config-')) {
      setPeriodConfigurations(prev => prev.map(config => 
        config.id === configId 
          ? { ...config, isDefault }
          : { ...config, isDefault: false } // Only one can be default
      ));
      
      const config = periodConfigurations.find(c => c.id === configId);
      toast({
        title: isDefault ? "Default Set" : "Default Removed",
        description: `${config?.name} is ${isDefault ? 'now' : 'no longer'} the default configuration`
      });
      return;
    }

    // For existing configurations, update in database
    try {
      if (isDefault) {
        // First, unset any other default configuration for this school and academic year
        await supabase
          .from('timetable_configurations')
          .update({ is_default: false })
          .eq('school_id', profile?.school_id)
          .eq('academic_year_id', selectedAcademicYear);
      }

      // Then set this configuration as default (or remove default)
      const { error } = await supabase
        .from('timetable_configurations')
        .update({ is_default: isDefault })
        .eq('id', configId);

      if (error) {
        throw error;
      }

      // Update local state
      setPeriodConfigurations(prev => prev.map(config => 
        config.id === configId 
          ? { ...config, isDefault }
          : { ...config, isDefault: false } // Only one can be default
      ));
      
      const config = periodConfigurations.find(c => c.id === configId);
      toast({
        title: isDefault ? "Default Set" : "Default Removed",
        description: `${config?.name} is ${isDefault ? 'now' : 'no longer'} the default configuration`
      });
    } catch (error) {
      console.error('Error updating default status:', error);
      toast({
        title: "Error",
        description: "Failed to update default configuration. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBatchTagging = (configId: string) => {
    const config = periodConfigurations.find(c => c.id === configId);
    if (config?.isDefault) return;
    
    setSelectedConfigForTagging(configId);
    setBatchTaggingDialogOpen(true);
  };

  const handleCloseConfiguration = () => {
    console.log('Closing configuration editor');
    setActiveConfigId(null);
    setViewMode(null);
  };

  console.log('TimetableSettings render - activeConfigId:', activeConfigId, 'viewMode:', viewMode);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5" /> 
                Timetable Settings
              </div>
              <AcademicYearSelector
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                isLoading={academicYearLoading}
              />
            </div>
          </CardTitle>
          <CardDescription>
            Configure your school's timetable settings, periods, and working days for {selectedYear?.name || 'the selected academic year'}.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Period Configurations Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Period Configurations
            </span>
            <Button onClick={handleAddPeriodConfiguration} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Configuration
            </Button>
          </CardTitle>
          <CardDescription>
            Create and manage multiple timetable configurations for different scenarios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : periodConfigurations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No period configurations created yet.</p>
              <p className="text-sm">Click "Add Configuration" to create your first timetable setup.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {periodConfigurations.map(config => (
                <ConfigurationCard
                  key={config.id}
                  config={config}
                  onEdit={handleEditConfiguration}
                  onClone={handleCloneConfiguration}
                  onView={handleViewConfiguration}
                  onToggleActive={handleToggleActive}
                  onToggleDefault={handleToggleDefault}
                  onBatchTagging={handleBatchTagging}
                  onRemove={handleRemoveConfiguration}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Active Configuration Editor/Viewer */}
      {activeConfigId && viewMode && (
        <TimePeriodConfiguration 
          key={activeConfigId}
          configId={activeConfigId}
          onClose={handleCloseConfiguration}
          onSave={handleConfigurationSaved}
          academicYearId={selectedAcademicYear}
          configName={periodConfigurations.find(c => c.id === activeConfigId)?.name || ''}
          isActive={periodConfigurations.find(c => c.id === activeConfigId)?.isActive || false}
          isDefault={periodConfigurations.find(c => c.id === activeConfigId)?.isDefault || false}
          mode={viewMode}
        />
      )}

      {/* Batch Tagging Dialog */}
      <BatchTaggingDialog
        open={batchTaggingDialogOpen}
        onOpenChange={setBatchTaggingDialogOpen}
        configurationId={selectedConfigForTagging}
        configurationName={periodConfigurations.find(c => c.id === selectedConfigForTagging)?.name || ''}
      />
    </div>
  );
};
