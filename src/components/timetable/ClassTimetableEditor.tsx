
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Edit, Trash2, Plus } from "lucide-react";

// Mock data
const mockClasses = [
  { id: "class-6a", name: "Class 6A", students: 30 },
  { id: "class-6b", name: "Class 6B", students: 28 },
  { id: "class-7a", name: "Class 7A", students: 32 },
  { id: "class-7b", name: "Class 7B", students: 29 },
];

const mockSubjects = [
  { id: "math", name: "Mathematics", color: "bg-blue-100 text-blue-800" },
  { id: "english", name: "English", color: "bg-green-100 text-green-800" },
  { id: "science", name: "Science", color: "bg-purple-100 text-purple-800" },
  { id: "history", name: "History", color: "bg-orange-100 text-orange-800" },
  { id: "pe", name: "Physical Education", color: "bg-red-100 text-red-800" },
  { id: "break", name: "Break", color: "bg-gray-100 text-gray-800" },
];

const mockTeachers = [
  { id: "teacher-1", name: "Ms. Johnson" },
  { id: "teacher-2", name: "Mr. Smith" },
  { id: "teacher-3", name: "Dr. Brown" },
  { id: "teacher-4", name: "Ms. Davis" },
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

export const ClassTimetableEditor = () => {
  const [selectedClass, setSelectedClass] = useState(mockClasses[0]);
  const [timetable, setTimetable] = useState<any>({});

  const updatePeriod = (day: string, timeSlot: string, subject: string, teacher: string) => {
    setTimetable((prev: any) => ({
      ...prev,
      [selectedClass.id]: {
        ...prev[selectedClass.id],
        [day]: {
          ...prev[selectedClass.id]?.[day],
          [timeSlot]: { subject, teacher }
        }
      }
    }));
  };

  const copyTimetable = () => {
    console.log("Copy timetable to another class");
  };

  const getPeriodData = (day: string, timeSlot: string) => {
    return timetable[selectedClass.id]?.[day]?.[timeSlot] || { subject: "", teacher: "" };
  };

  const isBreakTime = (timeSlot: string) => {
    return timeSlot.includes("10:15 - 10:30") || timeSlot.includes("12:45 - 13:30");
  };

  return (
    <div className="space-y-6">
      {/* Class Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Class Timetable Editor
            <div className="flex items-center gap-2">
              <Button onClick={copyTimetable} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Another Class
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Create and manage class-wise timetables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {mockClasses.map((cls) => (
              <Button
                key={cls.id}
                variant={selectedClass.id === cls.id ? "default" : "outline"}
                className="h-16 flex flex-col items-center justify-center"
                onClick={() => setSelectedClass(cls)}
              >
                <span className="font-medium">{cls.name}</span>
                <span className="text-xs text-muted-foreground">{cls.students} students</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Timetable for {selectedClass.name}</CardTitle>
          <CardDescription>Drag and drop subjects to create the weekly schedule</CardDescription>
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
                      const periodData = getPeriodData(day, timeSlot);
                      const isBreak = isBreakTime(timeSlot);
                      
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-1">
                          {isBreak ? (
                            <div className="h-16 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
                              {timeSlot.includes("10:15") ? "Morning Break" : "Lunch Break"}
                            </div>
                          ) : (
                            <div className="h-16 space-y-1">
                              <select
                                value={periodData.subject}
                                onChange={(e) => updatePeriod(day, timeSlot, e.target.value, periodData.teacher)}
                                className="w-full text-xs border rounded p-1"
                              >
                                <option value="">Select Subject</option>
                                {mockSubjects.filter(s => s.id !== "break").map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))}
                              </select>
                              {periodData.subject && (
                                <select
                                  value={periodData.teacher}
                                  onChange={(e) => updatePeriod(day, timeSlot, periodData.subject, e.target.value)}
                                  className="w-full text-xs border rounded p-1"
                                >
                                  <option value="">Select Teacher</option>
                                  {mockTeachers.map((teacher) => (
                                    <option key={teacher.id} value={teacher.id}>
                                      {teacher.name}
                                    </option>
                                  ))}
                                </select>
                              )}
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

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {mockSubjects.map((subject) => (
              <Badge key={subject.id} className={subject.color}>
                {subject.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
