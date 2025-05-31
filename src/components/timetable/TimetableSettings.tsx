
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar, Settings, Users } from "lucide-react";

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
    maxTeacherWorkload: 30,
    allowDoubleBooking: false,
    autoConflictDetection: true,
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

  const calculatePeriodsPerDay = () => {
    const startMinutes = parseInt(settings.startTime.split(':')[0]) * 60 + parseInt(settings.startTime.split(':')[1]);
    const endMinutes = parseInt(settings.endTime.split(':')[0]) * 60 + parseInt(settings.endTime.split(':')[1]);
    const totalMinutes = endMinutes - startMinutes;
    const breakMinutes = settings.breakDuration + settings.lunchDuration;
    const availableMinutes = totalMinutes - breakMinutes;
    return Math.floor(availableMinutes / settings.periodDuration);
  };

  return (
    <div className="space-y-6">
      {/* Working Days Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Working Days Configuration
          </CardTitle>
          <CardDescription>Set which days of the week have scheduled classes</CardDescription>
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
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {settings.workingDays.length} working days per week
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time & Period Configuration
          </CardTitle>
          <CardDescription>Set period durations and school timing structure</CardDescription>
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
                max="90"
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
                max="90"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Teacher Workload</label>
              <input
                type="number"
                value={settings.maxTeacherWorkload}
                onChange={(e) => handleInputChange("maxTeacherWorkload", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="15"
                max="40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Calculated Information */}
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Calculated Schedule Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-green-700">
              <div>
                <strong>Periods per day:</strong> {calculatePeriodsPerDay()}
              </div>
              <div>
                <strong>Total weekly periods:</strong> {calculatePeriodsPerDay() * settings.workingDays.length}
              </div>
              <div>
                <strong>School day duration:</strong> {
                  ((parseInt(settings.endTime.split(':')[0]) * 60 + parseInt(settings.endTime.split(':')[1])) -
                  (parseInt(settings.startTime.split(':')[0]) * 60 + parseInt(settings.startTime.split(':')[1]))) / 60
                } hours
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Special Days Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Special Schedule Types
          </CardTitle>
          <CardDescription>Enable different schedule formats for special occasions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Half Days</h4>
                <p className="text-sm text-muted-foreground">
                  Enable shortened school days ending at {settings.halfDayEnd}
                </p>
              </div>
              <Switch
                checked={settings.enableHalfDays}
                onCheckedChange={(checked) => handleInputChange("enableHalfDays", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Examination Days</h4>
                <p className="text-sm text-muted-foreground">
                  Special scheduling for exam periods with modified timings
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
                  Special schedules for sports, cultural events, and field trips
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

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Advanced Timetable Rules
          </CardTitle>
          <CardDescription>Configure advanced validation and conflict detection rules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Automatic Conflict Detection</h4>
                <p className="text-sm text-muted-foreground">
                  Automatically detect and highlight scheduling conflicts
                </p>
              </div>
              <Switch
                checked={settings.autoConflictDetection}
                onCheckedChange={(checked) => handleInputChange("autoConflictDetection", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Allow Double Booking</h4>
                <p className="text-sm text-muted-foreground">
                  Allow teachers/rooms to be assigned to multiple classes (with warnings)
                </p>
              </div>
              <Switch
                checked={settings.allowDoubleBooking}
                onCheckedChange={(checked) => handleInputChange("allowDoubleBooking", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Settings Preview</CardTitle>
          <CardDescription>Preview of the timetable structure based on current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-3">Schedule Structure</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Working Days:</span>
                  <span className="font-medium">{settings.workingDays.length} days</span>
                </div>
                <div className="flex justify-between">
                  <span>School Hours:</span>
                  <span className="font-medium">{settings.startTime} - {settings.endTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Periods per Day:</span>
                  <span className="font-medium">{calculatePeriodsPerDay()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Periods:</span>
                  <span className="font-medium">{calculatePeriodsPerDay() * settings.workingDays.length}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium mb-3">Break Schedule</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Morning Break:</span>
                  <span className="font-medium">{settings.breakDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch Break:</span>
                  <span className="font-medium">{settings.lunchDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Period Duration:</span>
                  <span className="font-medium">{settings.periodDuration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Teacher Load:</span>
                  <span className="font-medium">{settings.maxTeacherWorkload} periods/week</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full md:w-auto">
          Save Timetable Settings
        </Button>
      </div>
    </div>
  );
};
