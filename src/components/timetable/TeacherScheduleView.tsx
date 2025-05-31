
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Printer, FileSpreadsheet, User, Clock } from "lucide-react";

interface TeacherScheduleViewProps {
  selectedTerm: string;
}

// Mock teacher data
const mockTeachers = [
  { 
    id: "teacher-1", 
    name: "Ms. Johnson", 
    subject: "Mathematics",
    email: "johnson@school.edu",
    maxWorkload: 30,
    currentWorkload: 24
  },
  { 
    id: "teacher-2", 
    name: "Mr. Smith", 
    subject: "English",
    email: "smith@school.edu",
    maxWorkload: 25,
    currentWorkload: 20
  },
  { 
    id: "teacher-3", 
    name: "Dr. Brown", 
    subject: "Science",
    email: "brown@school.edu",
    maxWorkload: 28,
    currentWorkload: 26
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
      "08:00 - 08:45": { class: "Grade 6A", subject: "Math", room: "Room 101" },
      "08:45 - 09:30": { class: "Grade 6B", subject: "Math", room: "Room 102" },
      "10:30 - 11:15": { class: "Grade 7A", subject: "Math", room: "Room 101" },
      "13:30 - 14:15": { class: "Grade 7B", subject: "Math", room: "Room 102" },
    },
    "Tuesday": {
      "08:00 - 08:45": { class: "Grade 6A", subject: "Math", room: "Room 101" },
      "09:30 - 10:15": { class: "Grade 6B", subject: "Math", room: "Room 102" },
      "11:15 - 12:00": { class: "Grade 7A", subject: "Math", room: "Room 101" },
    },
  },
};

export const TeacherScheduleView = ({ selectedTerm }: TeacherScheduleViewProps) => {
  const [selectedTeacher, setSelectedTeacher] = useState(mockTeachers[0]);
  const [viewMode, setViewMode] = useState<"individual" | "overview">("individual");

  const getTeacherSchedule = (day: string, timeSlot: string) => {
    return mockTeacherSchedules[selectedTeacher.id]?.[day]?.[timeSlot];
  };

  const isBreakTime = (timeSlot: string) => {
    return timeSlot.includes("10:15 - 10:30") || timeSlot.includes("12:45 - 13:30");
  };

  const isFreeTime = (day: string, timeSlot: string) => {
    return !isBreakTime(timeSlot) && !getTeacherSchedule(day, timeSlot);
  };

  const getWorkloadColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 70) return "text-orange-600";
    return "text-green-600";
  };

  const handleDownload = (teacher: any, format: string) => {
    console.log(`Downloading ${format} for ${teacher.name}`);
  };

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Teacher Schedule Management
            <div className="flex gap-2">
              <Button 
                variant={viewMode === "individual" ? "default" : "outline"}
                onClick={() => setViewMode("individual")}
                size="sm"
              >
                Individual View
              </Button>
              <Button 
                variant={viewMode === "overview" ? "default" : "outline"}
                onClick={() => setViewMode("overview")}
                size="sm"
              >
                Overview
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            View teacher schedules, workloads, and free periods for {selectedTerm}
          </CardDescription>
        </CardHeader>
      </Card>

      {viewMode === "individual" ? (
        <>
          {/* Teacher Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select Teacher</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

          {/* Selected Teacher Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{selectedTeacher.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTeacher.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{selectedTeacher.subject}</Badge>
                    <span className={`text-sm font-medium ${getWorkloadColor(selectedTeacher.currentWorkload, selectedTeacher.maxWorkload)}`}>
                      Workload: {selectedTeacher.currentWorkload}/{selectedTeacher.maxWorkload} periods
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleDownload(selectedTeacher, "pdf")} 
                    variant="outline" 
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    onClick={() => handleDownload(selectedTeacher, "excel")} 
                    variant="outline" 
                    size="sm"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                  <Button 
                    onClick={() => handleDownload(selectedTeacher, "print")} 
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
                      <th className="border border-gray-200 p-3 bg-gray-50 w-32 text-left">Time</th>
                      {weekDays.map((day) => (
                        <th key={day} className="border border-gray-200 p-3 bg-gray-50 min-w-40 text-left">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border border-gray-200 p-3 font-medium text-sm bg-gray-50">
                          {timeSlot}
                        </td>
                        {weekDays.map((day) => {
                          const schedule = getTeacherSchedule(day, timeSlot);
                          const isBreak = isBreakTime(timeSlot);
                          const isFree = isFreeTime(day, timeSlot);
                          
                          return (
                            <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-2">
                              {isBreak ? (
                                <div className="h-16 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {timeSlot.includes("10:15") ? "Break" : "Lunch"}
                                </div>
                              ) : schedule ? (
                                <div className="h-16 bg-blue-50 border border-blue-200 rounded p-2 flex flex-col justify-center">
                                  <div className="text-sm font-medium text-blue-900">{schedule.class}</div>
                                  <div className="text-xs text-blue-700">{schedule.subject}</div>
                                  <div className="text-xs text-blue-600">{schedule.room}</div>
                                </div>
                              ) : (
                                <div className="h-16 bg-green-50 border border-green-200 rounded p-2 flex items-center justify-center">
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

          {/* Teacher Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Weekly Classes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{selectedTeacher.currentWorkload}</div>
                <p className="text-xs text-muted-foreground">periods assigned</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Free Periods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {40 - selectedTeacher.currentWorkload - 10}
                </div>
                <p className="text-xs text-muted-foreground">available slots</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Workload</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getWorkloadColor(selectedTeacher.currentWorkload, selectedTeacher.maxWorkload)}`}>
                  {Math.round((selectedTeacher.currentWorkload / selectedTeacher.maxWorkload) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">of capacity</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {selectedTeacher.maxWorkload - selectedTeacher.currentWorkload}
                </div>
                <p className="text-xs text-muted-foreground">periods free</p>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* Overview Mode */
        <Card>
          <CardHeader>
            <CardTitle>All Teachers Overview</CardTitle>
            <CardDescription>Quick overview of all teacher workloads and availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockTeachers.map((teacher) => (
                <div key={teacher.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <h4 className="font-medium">{teacher.name}</h4>
                        <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{teacher.currentWorkload}/{teacher.maxWorkload} periods</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (teacher.currentWorkload / teacher.maxWorkload) >= 0.9 ? "bg-red-500" :
                        (teacher.currentWorkload / teacher.maxWorkload) >= 0.7 ? "bg-orange-500" : "bg-green-500"
                      }`}
                      style={{
                        width: `${(teacher.currentWorkload / teacher.maxWorkload) * 100}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Workload: {Math.round((teacher.currentWorkload / teacher.maxWorkload) * 100)}%</span>
                    <span>Available: {teacher.maxWorkload - teacher.currentWorkload} periods</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
