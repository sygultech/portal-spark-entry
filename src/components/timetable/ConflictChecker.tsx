
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, AlertTriangle, CheckCircle, Users, MapPin, Clock } from "lucide-react";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";

interface ConflictCheckerProps {
  selectedClass: string;
  selectedTerm: string;
}

// Mock conflict data - in real app this would come from backend
const mockConflicts = [
  {
    id: "conflict-1",
    type: "teacher_double_booking",
    severity: "high",
    message: "Ms. Johnson is assigned to two classes at the same time",
    details: {
      teacher: "Ms. Johnson",
      time: "Monday 09:00 - 09:45",
      classes: ["Class 6A", "Class 7B"],
      subjects: ["Mathematics", "Science"]
    }
  },
  {
    id: "conflict-2", 
    type: "room_double_booking",
    severity: "medium",
    message: "Room 101 is allocated to two classes simultaneously",
    details: {
      room: "Room 101",
      time: "Tuesday 11:00 - 11:45",
      classes: ["Class 6A", "Class 6B"],
      subjects: ["English", "History"]
    }
  },
  {
    id: "conflict-3",
    type: "scheduling_gap",
    severity: "low", 
    message: "Class 7A has a 2-hour gap between periods",
    details: {
      class: "Class 7A",
      day: "Wednesday",
      gap: "2 hours between Math and Science"
    }
  }
];

export const ConflictChecker = ({ selectedClass, selectedTerm }: ConflictCheckerProps) => {
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();
  
  const [conflicts, setConflicts] = useState(mockConflicts);
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const runConflictCheck = async () => {
    setIsChecking(true);
    // Simulate API call
    setTimeout(() => {
      setIsChecking(false);
      setLastChecked(new Date());
      // In real app, would update conflicts from API response
    }, 2000);
  };

  const resolveConflict = (conflictId: string) => {
    setConflicts(prev => prev.filter(conflict => conflict.id !== conflictId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "bg-red-100 text-red-800 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200"; 
      case "low": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high": return <AlertTriangle className="h-4 w-4" />;
      case "medium": return <AlertTriangle className="h-4 w-4" />;
      case "low": return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Conflict Checker
              </div>
              <AcademicYearSelector
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                isLoading={academicYearLoading}
              />
            </div>
            <Button 
              onClick={runConflictCheck} 
              disabled={isChecking}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
              {isChecking ? 'Checking...' : 'Run Check'}
            </Button>
          </CardTitle>
          <CardDescription>
            Detect and resolve scheduling conflicts for {selectedYear?.name || 'the selected academic year'}. Check for teacher double-bookings, room conflicts, and scheduling issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Status Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  {conflicts.filter(c => c.severity === 'high').length}
                </div>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">
                  {conflicts.filter(c => c.severity === 'medium').length}
                </div>
                <p className="text-sm text-muted-foreground">Medium Priority</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {conflicts.filter(c => c.severity === 'low').length}
                </div>
                <p className="text-sm text-muted-foreground">Low Priority</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{conflicts.length === 0 ? '✓' : conflicts.length}</div>
                <p className="text-sm text-muted-foreground">
                  {conflicts.length === 0 ? 'No Conflicts' : 'Total Issues'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Last Checked */}
          {lastChecked && (
            <div className="mb-4 text-sm text-muted-foreground">
              Last checked: {lastChecked.toLocaleString()}
            </div>
          )}

          {/* Conflicts List */}
          {conflicts.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Great!</strong> No scheduling conflicts detected. Your timetable is ready for publication.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {conflicts.map((conflict) => (
                <Card key={conflict.id} className={`border-l-4 ${getSeverityColor(conflict.severity)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(conflict.severity)}
                        <div className="flex-1">
                          <div className="font-medium">{conflict.message}</div>
                          
                          {/* Conflict Details */}
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {conflict.type === 'teacher_double_booking' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  Teacher: {conflict.details.teacher}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  Time: {conflict.details.time}
                                </div>
                                <div>Classes: {conflict.details.classes.join(', ')}</div>
                                <div>Subjects: {conflict.details.subjects.join(', ')}</div>
                              </>
                            )}
                            
                            {conflict.type === 'room_double_booking' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-3 w-3" />
                                  Room: {conflict.details.room}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  Time: {conflict.details.time}
                                </div>
                                <div>Classes: {conflict.details.classes.join(', ')}</div>
                                <div>Subjects: {conflict.details.subjects.join(', ')}</div>
                              </>
                            )}
                            
                            {conflict.type === 'scheduling_gap' && (
                              <>
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  Class: {conflict.details.class}
                                </div>
                                <div>Day: {conflict.details.day}</div>
                                <div>Issue: {conflict.details.gap}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {conflict.severity.toUpperCase()}
                        </Badge>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => resolveConflict(conflict.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
