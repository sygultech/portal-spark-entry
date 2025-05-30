
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar, Settings, Users, Timer, Plus, Trash2 } from "lucide-react";
import { useTimetableSettings, TimetableSettings as TimetableSettingsType, WorkingDays } from "@/hooks/useTimetableSettings";
import { toast } from "@/components/ui/use-toast";
import { TimePeriodConfiguration } from "./TimePeriodConfiguration";

const defaultSettings: TimetableSettingsType = {
  id: '',
  school_id: '',
  period_duration: 45,
  break_duration: 15,
  lunch_duration: 45,
  school_start_time: '08:00:00',
  school_end_time: '15:00:00',
  half_day_end_time: '12:00:00',
  created_at: '',
  updated_at: ''
};

const defaultWorkingDays: WorkingDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false
};

interface TimePeriodConfig {
  id: string;
  name: string;
  isActive: boolean;
}

export const TimetableSettings = () => {
  const { isLoading, getTimetableSettings, updateTimetableSettings, updateWorkingDays, getWorkingDays } = useTimetableSettings();
  const [settings, setSettings] = useState<TimetableSettingsType>(defaultSettings);
  const [workingDays, setWorkingDays] = useState<WorkingDays>(defaultWorkingDays);
  const [isSaving, setIsSaving] = useState(false);
  const [periodConfigurations, setPeriodConfigurations] = useState<TimePeriodConfig[]>([]);
  const [activeConfigId, setActiveConfigId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const fetchedSettings = await getTimetableSettings();
      if (fetchedSettings) setSettings(fetchedSettings);
      const fetchedWorkingDays = await getWorkingDays();
      if (fetchedWorkingDays) setWorkingDays(fetchedWorkingDays);
    })();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = async (dayId: string) => {
    const newWorkingDays = {
      ...workingDays,
      [dayId]: !workingDays[dayId as keyof WorkingDays]
    };
    setWorkingDays(newWorkingDays);
    await updateWorkingDays(newWorkingDays);
    toast({ title: "Working days updated" });
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updateTimetableSettings(settings);
    setIsSaving(false);
    toast({ title: "Timetable settings saved" });
  };

  const handleAddPeriodConfiguration = () => {
    const newConfig: TimePeriodConfig = {
      id: `config-${Date.now()}`,
      name: `Configuration ${periodConfigurations.length + 1}`,
      isActive: false
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Timetable Settings
          </CardTitle>
          <CardDescription>
            Configure your school's timetable settings, periods, and working days.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="time-periods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time-periods" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Time & Periods
          </TabsTrigger>
          <TabsTrigger value="basic-settings" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Basic Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="time-periods" className="space-y-6">
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
                    <div key={config.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Timer className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{config.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
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
            />
          )}
        </TabsContent>

        <TabsContent value="basic-settings">
          <Card>
            <CardHeader>
              <CardTitle>Basic Timetable Settings</CardTitle>
              <CardDescription>
                Configure default durations and school timings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <label className="block font-medium">Period Duration (minutes)</label>
                  <input
                    type="number"
                    name="period_duration"
                    value={settings.period_duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  <label className="block font-medium">Break Duration (minutes)</label>
                  <input
                    type="number"
                    name="break_duration"
                    value={settings.break_duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  <label className="block font-medium">Lunch Duration (minutes)</label>
                  <input
                    type="number"
                    name="lunch_duration"
                    value={settings.lunch_duration}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block font-medium">School Start Time</label>
                  <input
                    type="time"
                    name="school_start_time"
                    value={settings.school_start_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  <label className="block font-medium">School End Time</label>
                  <input
                    type="time"
                    name="school_end_time"
                    value={settings.school_end_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                  <label className="block font-medium">Half Day End Time</label>
                  <input
                    type="time"
                    name="half_day_end_time"
                    value={settings.half_day_end_time}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="mt-6">
                <h3 className="font-medium mb-2">Working Days</h3>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(workingDays).map(([day, enabled]) => (
                    <div key={day} className="flex items-center gap-2">
                      <Switch
                        checked={enabled}
                        onCheckedChange={() => handleDayToggle(day)}
                        id={`switch-${day}`}
                      />
                      <label htmlFor={`switch-${day}`} className="capitalize">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
