import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Timer, Plus, Trash2, Tag, Info, Settings } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { TimePeriodConfiguration } from "./TimePeriodConfiguration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BatchTaggingDialog } from "./components/BatchTaggingDialog";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";

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
  
  const [periodConfigurations, setPeriodConfigurations] = useState<TimePeriodConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);
  const [batchTaggingDialogOpen, setBatchTaggingDialogOpen] = useState(false);
  const [selectedConfigForTagging, setSelectedConfigForTagging] = useState<string | null>(null);

  const handleAddPeriodConfiguration = () => {
    const newConfig: TimePeriodConfig = {
      id: `config-${Date.now()}`,
      name: `Configuration ${periodConfigurations.length + 1}`,
      isActive: false,
      isDefault: false
    };
    setPeriodConfigurations(prev => [...prev, newConfig]);
    setActiveConfigId(newConfig.id);
    
    toast({
      title: "New Configuration Added",
      description: `${newConfig.name} has been created`
    });
  };

  const handleRemoveConfiguration = (configId: string) => {
    const config = periodConfigurations.find(c => c.id === configId);
    setPeriodConfigurations(prev => prev.filter(c => c.id !== configId));
    
    if (activeConfigId === configId) {
      setActiveConfigId(null);
    }
    
    if (config) {
      toast({
        title: "Configuration Removed",
        description: `${config.name} has been deleted`
      });
    }
  };

  const handleToggleConfiguration = (configId: string) => {
    if (activeConfigId === configId) {
      setActiveConfigId(null);
    } else {
      setActiveConfigId(configId);
    }
  };

  const handleConfigurationSaved = () => {
    setActiveConfigId(null);
    toast({
      title: "Configuration Saved",
      description: "Period configuration has been saved successfully"
    });
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
          {periodConfigurations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Timer className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No period configurations created yet.</p>
              <p className="text-sm">Click "Add Configuration" to create your first timetable setup.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {periodConfigurations.map(config => (
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
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Active</span>
                      <Switch
                        checked={config.isActive}
                        onCheckedChange={() => handleToggleActive(config.id)}
                      />
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Default</span>
                      <Switch
                        checked={config.isDefault}
                        onCheckedChange={() => handleToggleDefault(config.id)}
                      />
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
                      variant={activeConfigId === config.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleToggleConfiguration(config.id)}
                    >
                      {activeConfigId === config.id ? "Hide" : "Configure"}
                    </Button>
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

      {/* Active Configuration Editor */}
      {activeConfigId && (
        <TimePeriodConfiguration 
          key={activeConfigId}
          configId={activeConfigId}
          onClose={() => setActiveConfigId(null)}
          onSave={handleConfigurationSaved}
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
