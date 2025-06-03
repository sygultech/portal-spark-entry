
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
    setActiveConfigId(configId);
    setViewMode('edit');
  };

  const handleViewConfiguration = (configId: string) => {
    setActiveConfigId(configId);
    setViewMode('view');
  };

  const handleCloneConfiguration = (configId: string) => {
    const originalConfig = periodConfigurations.find(c => c.id === configId);
    if (!originalConfig) return;

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
  };

  const handleRemoveConfiguration = (configId: string) => {
    const config = periodConfigurations.find(c => c.id === configId);
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
    if (profile?.school_id && selectedAcademicYear) {
      const configs = await getTimetableConfigurations(profile.school_id, selectedAcademicYear);
      setPeriodConfigurations(configs.map(config => ({
        id: config.id,
        name: config.name,
        isActive: config.isActive,
        isDefault: config.isDefault
      })));
    }
    setActiveConfigId(null);
    setViewMode(null);
  };

  const handleToggleActive = (configId: string) => {
    setPeriodConfigurations(prev => prev.map(config => 
      config.id === configId ? { ...config, isActive: !config.isActive } : config
    ));
    
    const config = periodConfigurations.find(c => c.id === configId);
    toast({
      title: config?.isActive ? "Configuration Deactivated" : "Configuration Activated",
      description: `${config?.name} is now ${config?.isActive ? 'inactive' : 'active'}`
    });
  };

  const handleToggleDefault = (configId: string) => {
    setPeriodConfigurations(prev => prev.map(config => 
      config.id === configId 
        ? { ...config, isDefault: !config.isDefault }
        : { ...config, isDefault: false }
    ));
    
    const config = periodConfigurations.find(c => c.id === configId);
    toast({
      title: config?.isDefault ? "Default Removed" : "Default Set",
      description: `${config?.name} is ${config?.isDefault ? 'no longer' : 'now'} the default configuration`
    });
  };

  const handleBatchTagging = (configId: string) => {
    const config = periodConfigurations.find(c => c.id === configId);
    if (config?.isDefault) return;
    
    setSelectedConfigForTagging(configId);
    setBatchTaggingDialogOpen(true);
  };

  const handleCloseConfiguration = () => {
    setActiveConfigId(null);
    setViewMode(null);
  };

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
      {activeConfigId && (
        <TimePeriodConfiguration 
          key={activeConfigId}
          configId={activeConfigId}
          onClose={handleCloseConfiguration}
          onSave={handleConfigurationSaved}
          academicYearId={selectedAcademicYear}
          configName={periodConfigurations.find(c => c.id === activeConfigId)?.name || ''}
          isActive={periodConfigurations.find(c => c.id === activeConfigId)?.isActive || false}
          isDefault={periodConfigurations.find(c => c.id === activeConfigId)?.isDefault || false}
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
