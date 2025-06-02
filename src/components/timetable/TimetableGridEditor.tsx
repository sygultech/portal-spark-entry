
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, Edit, Trash2, Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface TimetableGridEditorProps {
  selectedClass: string;
  selectedTerm: string;
}

// Mock data - in real app this would come from backend
const mockSubjects = [
  { id: "math", name: "Mathematics", color: "bg-blue-100 text-blue-800" },
  { id: "english", name: "English", color: "bg-green-100 text-green-800" },
  { id: "science", name: "Science", color: "bg-purple-100 text-purple-800" },
  { id: "history", name: "History", color: "bg-orange-100 text-orange-800" },
  { id: "pe", name: "Physical Education", color: "bg-red-100 text-red-800" },
  { id: "art", name: "Art", color: "bg-pink-100 text-pink-800" },
];

const mockTeachers = [
  { id: "teacher-1", name: "Ms. Johnson", subjects: ["math"] },
  { id: "teacher-2", name: "Mr. Smith", subjects: ["english"] },
  { id: "teacher-3", name: "Dr. Brown", subjects: ["science"] },
  { id: "teacher-4", name: "Ms. Davis", subjects: ["history"] },
  { id: "teacher-5", name: "Mr. Wilson", subjects: ["pe"] },
];

const mockRooms = [
  { id: "room-101", name: "Room 101", type: "Classroom" },
  { id: "room-102", name: "Room 102", type: "Classroom" },
  { id: "lab-sci", name: "Science Lab", type: "Laboratory" },
  { id: "gym", name: "Gymnasium", type: "Sports" },
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

export const TimetableGridEditor = ({ selectedClass, selectedTerm }: TimetableGridEditorProps) => {
  const [timetable, setTimetable] = useState<any>({});
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [draggedPeriod, setDraggedPeriod] = useState<any>(null);

  const updatePeriod = (day: string, timeSlot: string, subject: string, teacher: string, room: string) => {
    setTimetable((prev: any) => ({
      ...prev,
      [selectedClass]: {
        ...prev[selectedClass],
        [day]: {
          ...prev[selectedClass]?.[day],
          [timeSlot]: { subject, teacher, room }
        }
      }
    }));
    
    // Check for conflicts after update
    checkConflicts();
  };

  const checkConflicts = () => {
    // Simple conflict detection - teacher or room double booking
    const newConflicts: string[] = [];
    // Implementation would check for actual conflicts
    setConflicts(newConflicts);
  };

  const copyTimetable = () => {
    console.log("Copy timetable to another class");
  };

  const quickAssign = (day: string, timeSlot: string) => {
    // Quick assign mode - auto-suggest based on subject rotation
    console.log("Quick assign for", day, timeSlot);
  };

  const getPeriodData = (day: string, timeSlot: string) => {
    return timetable[selectedClass]?.[day]?.[timeSlot] || { subject: "", teacher: "", room: "" };
  };

  const isBreakTime = (timeSlot: string) => {
    return timeSlot.includes("10:15 - 10:30") || timeSlot.includes("12:45 - 13:30");
  };

  const hasConflict = (day: string, timeSlot: string) => {
    return conflicts.includes(`${day}-${timeSlot}`);
  };

  const getSubjectColor = (subjectId: string) => {
    const subject = mockSubjects.find(s => s.id === subjectId);
    return subject?.color || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Class Info & Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div>
              Timetable Grid Editor - {selectedClass.toUpperCase()}
              <Badge variant="outline" className="ml-2">{selectedTerm}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={copyTimetable} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Class
              </Button>
              <Button onClick={() => quickAssign("", "")} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Quick Assign
              </Button>
            </div>
          </CardTitle>
          <CardDescription>Drag and drop subjects to create the weekly schedule. Color-coded periods help identify conflicts.</CardDescription>
        </CardHeader>
      </Card>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Conflicts Detected:</strong> {conflicts.length} scheduling conflicts found. Please resolve before publishing.
          </AlertDescription>
        </Alert>
      )}

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Weekly Schedule Grid
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm text-muted-foreground">Conflict-free</span>
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
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 min-w-48 text-left">
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
                      const periodData = getPeriodData(day, timeSlot);
                      const isBreak = isBreakTime(timeSlot);
                      const hasConflictHere = hasConflict(day, timeSlot);
                      
                      return (
                        <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-1">
                          {isBreak ? (
                            <div className="h-20 flex items-center justify-center bg-gray-100 rounded text-sm text-gray-600">
                              {timeSlot.includes("10:15") ? "Morning Break" : "Lunch Break"}
                            </div>
                          ) : (
                            <div className={`h-20 space-y-1 ${hasConflictHere ? "ring-2 ring-red-500" : ""}`}>
                              <select
                                value={periodData.subject}
                                onChange={(e) => updatePeriod(day, timeSlot, e.target.value, periodData.teacher, periodData.room)}
                                className="w-full text-xs border rounded p-1"
                              >
                                <option value="">Select Subject</option>
                                {mockSubjects.map((subject) => (
                                  <option key={subject.id} value={subject.id}>
                                    {subject.name}
                                  </option>
                                ))}
                              </select>
                              
                              {periodData.subject && (
                                <>
                                  <select
                                    value={periodData.teacher}
                                    onChange={(e) => updatePeriod(day, timeSlot, periodData.subject, e.target.value, periodData.room)}
                                    className="w-full text-xs border rounded p-1"
                                  >
                                    <option value="">Select Teacher</option>
                                    {mockTeachers
                                      .filter(teacher => teacher.subjects.includes(periodData.subject))
                                      .map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                          {teacher.name}
                                        </option>
                                      ))}
                                  </select>
                                  
                                  <select
                                    value={periodData.room}
                                    onChange={(e) => updatePeriod(day, timeSlot, periodData.subject, periodData.teacher, e.target.value)}
                                    className="w-full text-xs border rounded p-1"
                                  >
                                    <option value="">Select Room</option>
                                    {mockRooms.map((room) => (
                                      <option key={room.id} value={room.id}>
                                        {room.name}
                                      </option>
                                    ))}
                                  </select>
                                </>
                              )}
                              
                              {periodData.subject && (
                                <div className={`mt-1 px-2 py-1 rounded text-xs text-center ${getSubjectColor(periodData.subject)}`}>
                                  {mockSubjects.find(s => s.id === periodData.subject)?.name}
                                </div>
                              )}
                              
                              {hasConflictHere && (
                                <div className="text-xs text-red-600 font-medium">⚠️ Conflict</div>
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

      {/* Subject Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Subject Color Legend</CardTitle>
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">40</div>
            <p className="text-xs text-muted-foreground">per week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">32</div>
            <p className="text-xs text-muted-foreground">periods filled</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Free Periods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-muted-foreground">remaining</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">need resolution</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
