import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Settings, Users } from "lucide-react";
import { useTimetableSettings, TimetableSettings as TimetableSettingsType, WorkingDays } from "@/hooks/useTimetableSettings";
import { toast } from "@/components/ui/use-toast";

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

export const TimetableSettings = () => {
  const { isLoading, getTimetableSettings, updateTimetableSettings, updateWorkingDays, getWorkingDays } = useTimetableSettings();
  const [settings, setSettings] = useState<TimetableSettingsType>(defaultSettings);
  const [workingDays, setWorkingDays] = useState<WorkingDays>(defaultWorkingDays);
  const [isSaving, setIsSaving] = useState(false);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" /> Timetable Settings
          </CardTitle>
          <CardDescription>
            Configure your school's timetable settings and working days.
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
    </div>
  );
};
