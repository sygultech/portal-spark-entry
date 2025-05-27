
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, FileSpreadsheet, User } from "lucide-react";

// Mock data
const mockTeachers = [
  { 
    id: "teacher-1", 
    name: "Ms. Johnson", 
    subject: "Mathematics",
    email: "johnson@school.edu"
  },
  { 
    id: "teacher-2", 
    name: "Mr. Smith", 
    subject: "English",
    email: "smith@school.edu"
  },
  { 
    id: "teacher-3", 
    name: "Dr. Brown", 
    subject: "Science",
    email: "brown@school.edu"
  },
  { 
    id: "teacher-4", 
    name: "Ms. Davis", 
    subject: "History",
    email: "davis@school.edu"
  },
];

const timeSlots = [
  "08:00 - 08:45",
  "08:45 - 09:30", 
  "09:30 - 10:15",
  "10:15 - 10:30", // Break
  "10:30 - 11:15",
  "11:15 - 12:00",
  "12:00 - 12:45",
  "12:45 - 13:30", // Lunch
  "13:30 - 14:15",
  "14:15 - 15:00",
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Mock teacher schedule data
const mockTeacherSchedules: any = {
  "teacher-1": {
    "Monday": {
      "08:00 - 08:45": { class: "Class 6A", subject: "Math" },
      "08:45 - 09:30": { class: "Class 6B", subject: "Math" },
      "10:30 - 11:15": { class: "Class 7A", subject: "Math" },
      "13:30 - 14:15": { class: "Class 7B", subject: "Math" },
    },
    "Tuesday": {
      "08:00 - 08:45": { class: "Class 6A", subject: "Math" },
      "09:30 - 10:15": { class: "Class 6B", subject: "Math" },
      "11:15 - 12:00": { class: "Class 7A", subject: "Math" },
    },
    // Add more days...
  },
  "teacher-2": {
    "Monday": {
      "09:30 - 10:15": { class: "Class 6A", subject: "English" },
      "11:15 - 12:00": { class: "Class 6B", subject: "English" },
      "14:15 - 15:00": { class: "Class 7A", subject: "English" },
    },
    // Add more...
  },
};

export const TeacherTimetableView = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(mockTeachers[0]);

  const getTeacherSchedule = (day: string, timeSlot: string) => {
    return mockTeacherSchedules[selectedTeacher.id]?.[day]?.[timeSlot];
  };

  const isBreakTime = (timeSlot: string) => {
    return timeSlot.includes("10:15 - 10:30") || timeSlot.includes("12:45 - 13:30");
  };

  const isFreeTime = (day: string, timeSlot: string) => {
    return !isBreakTime(timeSlot) && !getTeacherSchedule(day, timeSlot);
  };

  const handleDownload = (teacher: any) => {
    console.log(`Downloading timetable for ${teacher.name}`);
  };

  return (
    <div className="space-y-6">
      {/* Teacher Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Teacher Timetable View</CardTitle>
          <CardDescription>View individual teacher schedules and free periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {mockTeachers.map((teacher) => (
              <Button
                key={teacher.id}
                variant={selectedTeacher.id === teacher.id ? "default" : "outline"}
                className="h-20 flex flex-col items-center justify-center p-4"
                onClick={() => setSelectedTeacher(teacher)}
              >
                <User className="h-5 w-5 mb-1" />
                <span className="font-medium text-sm">{teacher.name}</span>
                <span className="text-xs text-muted-foreground">{teacher.subject}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Teacher Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">{selectedTeacher.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTeacher.email}</p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleDownload(selectedTeacher)} 
                variant="outline" 
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button 
                onClick={() => handleDownload(selectedTeacher)} 
                variant="outline" 
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
              <Button 
                onClick={() => handleDownload(selectedTeacher)} 
                variant="outline" 
                size="sm"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-2 bg-gray-50 w-32">Time</th>
                  {weekDays.map((day) => (
                    <th key={day} className="border border-gray-200 p-2 bg-gray-50 min-w-32">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-200 p-2 font-medium text-sm bg-gray-50">
                      {timeSlot}
                    </td>
                    {weekDays.map((day) => {
                      const schedule = getTeacherSchedule(day, timeSlot);
                      const isBreak = isBreakTime(timeSlot);
                      const isFree = isFreeTime(day, timeSlot);
                      
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-2">
                          {isBreak ? (
                            <div className="h-12 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
                              {timeSlot.includes("10:15") ? "Break" : "Lunch"}
                            </div>
                          ) : schedule ? (
                            <div className="h-12 bg-blue-50 border border-blue-200 rounded p-2 flex flex-col justify-center">
                              <div className="text-sm font-medium text-blue-900">{schedule.class}</div>
                              <div className="text-xs text-blue-700">{schedule.subject}</div>
                            </div>
                          ) : (
                            <div className="h-12 bg-green-50 border border-green-200 rounded p-2 flex items-center justify-center">
                              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                Free Period
                              </Badge>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">18</div>
            <p className="text-xs text-muted-foreground">periods per week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Free Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">12</div>
            <p className="text-xs text-muted-foreground">periods per week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Workload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">60%</div>
            <p className="text-xs text-muted-foreground">of total capacity</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
