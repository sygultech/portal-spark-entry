
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Settings } from "lucide-react";

export const TimetableSettings = () => {
  const [settings, setSettings] = useState({
    workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    periodDuration: 45,
    breakDuration: 15,
    lunchDuration: 45,
    startTime: "08:00",
    endTime: "15:00",
    halfDayEnd: "12:00",
    enableHalfDays: true,
    enableExamDays: true,
    enableActivityDays: true,
  });

  const weekDays = [
    { id: "monday", label: "Monday" },
    { id: "tuesday", label: "Tuesday" },
    { id: "wednesday", label: "Wednesday" },
    { id: "thursday", label: "Thursday" },
    { id: "friday", label: "Friday" },
    { id: "saturday", label: "Saturday" },
    { id: "sunday", label: "Sunday" },
  ];

  const handleDayToggle = (dayId: string) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayId)
        ? prev.workingDays.filter(d => d !== dayId)
        : [...prev.workingDays, dayId]
    }));
  };

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    console.log("Saving timetable settings:", settings);
  };

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
                  checked={settings.workingDays.includes(day.id)}
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
                value={settings.periodDuration}
                onChange={(e) => handleInputChange("periodDuration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="30"
                max="60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Break Duration (minutes)</label>
              <input
                type="number"
                value={settings.breakDuration}
                onChange={(e) => handleInputChange("breakDuration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="10"
                max="30"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Lunch Duration (minutes)</label>
              <input
                type="number"
                value={settings.lunchDuration}
                onChange={(e) => handleInputChange("lunchDuration", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="30"
                max="60"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Half Day End Time</label>
              <input
                type="time"
                value={settings.halfDayEnd}
                onChange={(e) => handleInputChange("halfDayEnd", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">School Start Time</label>
              <input
                type="time"
                value={settings.startTime}
                onChange={(e) => handleInputChange("startTime", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">School End Time</label>
              <input
                type="time"
                value={settings.endTime}
                onChange={(e) => handleInputChange("endTime", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Days Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Special Days
          </CardTitle>
          <CardDescription>Enable special day types for flexible scheduling</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Half Days</h4>
                <p className="text-sm text-muted-foreground">
                  Enable scheduling for half-day sessions
                </p>
              </div>
              <Switch
                checked={settings.enableHalfDays}
                onCheckedChange={(checked) => handleInputChange("enableHalfDays", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Exam Days</h4>
                <p className="text-sm text-muted-foreground">
                  Enable special scheduling for examination periods
                </p>
              </div>
              <Switch
                checked={settings.enableExamDays}
                onCheckedChange={(checked) => handleInputChange("enableExamDays", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Activity Days</h4>
                <p className="text-sm text-muted-foreground">
                  Enable scheduling for sports and extracurricular activities
                </p>
              </div>
              <Switch
                checked={settings.enableActivityDays}
                onCheckedChange={(checked) => handleInputChange("enableActivityDays", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Preview</CardTitle>
          <CardDescription>Preview of the timetable structure based on current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Working Days:</span>
                <span className="font-medium">
                  {settings.workingDays.length} days ({settings.workingDays.join(", ")})
                </span>
              </div>
              <div className="flex justify-between">
                <span>School Hours:</span>
                <span className="font-medium">
                  {settings.startTime} - {settings.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Period Duration:</span>
                <span className="font-medium">{settings.periodDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Break Duration:</span>
                <span className="font-medium">{settings.breakDuration} minutes</span>
              </div>
              <div className="flex justify-between">
                <span>Lunch Duration:</span>
                <span className="font-medium">{settings.lunchDuration} minutes</span>
              </div>
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
