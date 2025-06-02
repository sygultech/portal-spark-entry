import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Timer, Plus, Trash2, Tag } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TimePeriodConfiguration } from "./TimePeriodConfiguration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BatchTaggingDialog } from "./components/BatchTaggingDialog";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { useTimetableSettings } from "@/hooks/useTimetableSettings";
import { TimetableConfiguration } from "@/types/timetable";

export const TimetableSettings = () => {
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();

  const {
    configurations,
    isLoading: configurationsLoading,
    error,
    saveConfiguration,
    deleteConfiguration,
    updateConfiguration
  } = useTimetableSettings(selectedAcademicYear);

  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [batchTaggingDialogOpen, setBatchTaggingDialogOpen] = useState(false);
  const [selectedConfigForTagging, setSelectedConfigForTagging] = useState<string | null>(null);

  const handleAddPeriodConfiguration = () => {
    const newConfig: TimetableConfiguration = {
      id: `config-${Date.now()}`,
      name: `Configuration ${configurations.length + 1}`,
      isActive: false,
      isDefault: false,
      academicYearId: selectedAcademicYear,
      periods: []
    };
    setActiveConfigId(newConfig.id);
  };

  const handleRemoveConfiguration = async (configId: string) => {
    try {
      await deleteConfiguration(configId);
      if (activeConfigId === configId) {
        setActiveConfigId(null);
      }
    } catch (err) {
      console.error('Error removing configuration:', err);
    }
  };

  const handleToggleConfiguration = (configId: string) => {
    if (activeConfigId === configId) {
      setActiveConfigId(null);
    } else {
      setActiveConfigId(configId);
    }
  };

  const handleConfigurationSaved = async (config: TimetableConfiguration) => {
    try {
      if (config.id.startsWith('config-')) {
        // New configuration
        await saveConfiguration({
          schoolId: config.schoolId!,
          name: config.name,
          isActive: config.isActive,
          isDefault: config.isDefault,
          academicYearId: config.academicYearId,
          periods: config.periods,
          batchIds: config.batchIds
        });
      } else {
        // Update existing configuration
        await updateConfiguration(config.id, {
          name: config.name,
          isActive: config.isActive,
          isDefault: config.isDefault,
          periods: config.periods,
          batchIds: config.batchIds
        });
      }
      setActiveConfigId(null);
    } catch (err) {
      console.error('Error saving configuration:', err);
    }
  };

  const handleToggleActive = async (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    try {
      await updateConfiguration(configId, {
        isActive: !config.isActive
      });
    } catch (err) {
      console.error('Error toggling active status:', err);
    }
  };

  const handleToggleDefault = async (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (!config) return;

    try {
      await updateConfiguration(configId, {
        isDefault: !config.isDefault
      });
    } catch (err) {
      console.error('Error toggling default status:', err);
    }
  };

  const handleBatchTagging = (configId: string) => {
    const config = configurations.find(c => c.id === configId);
    if (config?.isDefault) {
      return;
    }
    setSelectedConfigForTagging(configId);
    setBatchTaggingDialogOpen(true);
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
            Configure your school's timetable period configurations for {selectedYear?.name || 'the selected academic year'}.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="time-periods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="time-periods" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Time & Periods
          </TabsTrigger>
        </TabsList>
        <TabsContent value="time-periods" className="space-y-6">
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
              {configurationsLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                  <p>Loading configurations...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Error loading configurations</p>
                  <p className="text-sm">{error}</p>
                </div>
              ) : configurations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No period configurations created yet.</p>
                  <p className="text-sm">Click "Add Configuration" to create your first timetable setup.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {configurations.map(config => (
                    <div key={config.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="font-medium">{config.name}</span>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {config.isActive && (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">Active</span>
                            )}
                            {config.isDefault && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Default</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Active</span>
                          <Button
                            variant={config.isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleActive(config.id)}
                          >
                            {config.isActive ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">Default</span>
                          <Button
                            variant={config.isDefault ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleToggleDefault(config.id)}
                          >
                            {config.isDefault ? "Unset" : "Set as Default"}
                          </Button>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleBatchTagging(config.id)}
                                disabled={config.isDefault}
                                className={`${config.isDefault ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                <Tag className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {config.isDefault 
                                ? "Default configurations apply to all batches automatically. Cannot tag specific batches."
                                : "Tag batches to this configuration"
                              }
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveConfiguration(config.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          {activeConfigId && (
            <TimePeriodConfiguration 
              key={activeConfigId}
              configId={activeConfigId}
              selectedAcademicYear={selectedAcademicYear}
              onClose={() => setActiveConfigId(null)}
              onSave={handleConfigurationSaved}
            />
          )}
        </TabsContent>
      </Tabs>

      <BatchTaggingDialog
        open={batchTaggingDialogOpen}
        onOpenChange={setBatchTaggingDialogOpen}
        configurationId={selectedConfigForTagging}
        configurationName={configurations.find(c => c.id === selectedConfigForTagging)?.name || ''}
      />
    </div>
  );
};
