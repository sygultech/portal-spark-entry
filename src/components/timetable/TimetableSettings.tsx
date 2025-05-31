import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Settings } from "lucide-react";
import { useTimetableSettings, TimetableSettings as TimetableSettingsType, WorkingDays } from "@/hooks/useTimetableSettings";
import { toast } from "@/components/ui/use-toast";

export const TimetableSettings = () => {
  const { isLoading, getTimetableSettings, updateTimetableSettings, updateWorkingDays, getWorkingDays } = useTimetableSettings();
  const [settings, setSettings] = useState<TimetableSettingsType>({
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
  });

  const [workingDays, setWorkingDays] = useState<WorkingDays>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const timetableSettings = await getTimetableSettings();
    if (timetableSettings) {
      setSettings(timetableSettings);
    }

    const workingDaysConfig = await getWorkingDays();
    if (workingDaysConfig) {
      setWorkingDays(workingDaysConfig);
    }
  };

  const weekDays = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  const handleDayToggle = async (dayId: string) => {
    const newWorkingDays = {
      ...workingDays,
      [dayId]: !workingDays[dayId as keyof WorkingDays]
    };
    setWorkingDays(newWorkingDays);
    await updateWorkingDays(newWorkingDays);
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    const updated = await updateTimetableSettings(settings);
    if (updated) {
      toast({
        title: "Success",
        description: "Timetable settings saved successfully"
      });
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Working Days Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Working Days
          </CardTitle>
          <CardDescription>Configure which days of the week have classes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {weekDays.map((day) => (
              <div key={day.id} className="flex items-center space-x-2">
                <Switch
                  id={day.id}
                  checked={workingDays[day.id as keyof WorkingDays]}
                  onCheckedChange={() => handleDayToggle(day.id)}
                />
                <label 
                  htmlFor={day.id} 
                  className="text-sm font-medium cursor-pointer"
                >
                  {day.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Configuration
          </CardTitle>
          <CardDescription>Set period durations and school timings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Period Duration (minutes)</label>
              <input
                type="number"
                value={settings.period_duration}
                onChange={(e) => handleInputChange("period_duration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="30"
                max="60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Break Duration (minutes)</label>
              <input
                type="number"
                value={settings.break_duration}
                onChange={(e) => handleInputChange("break_duration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="10"
                max="30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lunch Duration (minutes)</label>
              <input
                type="number"
                value={settings.lunch_duration}
                onChange={(e) => handleInputChange("lunch_duration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="30"
                max="60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Half Day End Time</label>
              <input
                type="time"
                value={settings.half_day_end_time}
                onChange={(e) => handleInputChange("half_day_end_time", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School Start Time</label>
              <input
                type="time"
                value={settings.school_start_time}
                onChange={(e) => handleInputChange("school_start_time", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">School End Time</label>
              <input
                type="time"
                value={settings.school_end_time}
                onChange={(e) => handleInputChange("school_end_time", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full md:w-auto">
          Save Settings
        </Button>
      </div>
    </div>
  );
};
