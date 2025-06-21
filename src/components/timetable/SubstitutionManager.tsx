
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserX, UserCheck, Bell, Plus, Clock, Calendar, AlertTriangle } from "lucide-react";

interface SubstitutionManagerProps {
  selectedTerm: string;
}

// Mock data for absent teachers
const mockAbsentTeachers = [
  {
    id: "teacher-1",
    name: "Ms. Johnson",
    subject: "Mathematics",
    date: "2024-05-27",
    reason: "Sick Leave",
    periods: [
      { time: "08:00 - 08:45", class: "Grade 6A", subject: "Math" },
      { time: "09:30 - 10:15", class: "Grade 6B", subject: "Math" },
      { time: "13:30 - 14:15", class: "Grade 7A", subject: "Math" }
    ],
    notificationSent: true
  },
  {
    id: "teacher-3",
    name: "Dr. Brown",
    subject: "Science",
    date: "2024-05-28",
    reason: "Personal Leave",
    periods: [
      { time: "10:30 - 11:15", class: "Grade 7B", subject: "Science" },
      { time: "11:15 - 12:00", class: "Grade 6A", subject: "Science" }
    ],
    notificationSent: false
  },
];

// Mock available substitutes
const mockSubstitutes = [
  { 
    id: "sub-1", 
    name: "Mr. Wilson", 
    subjects: ["Mathematics", "Science"],
    availability: "Full-time",
    rating: 4.8
  },
  { 
    id: "sub-2", 
    name: "Ms. Taylor", 
    subjects: ["English", "History"],
    availability: "Part-time",
    rating: 4.6
  },
  { 
    id: "sub-3", 
    name: "Dr. Garcia", 
    subjects: ["Science", "Mathematics"],
    availability: "Full-time",
    rating: 4.9
  },
];

// Mock substitution history
const mockSubstitutionHistory = [
  {
    id: "sub-hist-1",
    date: "2024-05-26",
    absentTeacher: "Ms. Johnson",
    substitute: "Mr. Wilson",
    period: "08:00 - 08:45",
    class: "Grade 6A",
    subject: "Mathematics",
    status: "Completed",
    feedback: "Excellent coverage"
  },
  {
    id: "sub-hist-2",
    date: "2024-05-25",
    absentTeacher: "Dr. Brown",
    substitute: "Dr. Garcia",
    period: "10:30 - 11:15",
    class: "Grade 7B",
    subject: "Science",
    status: "Completed",
    feedback: "Good continuity"
  },
];

export const SubstitutionManager = ({ selectedTerm }: SubstitutionManagerProps) => {
  const [substitutions, setSubstitutions] = useState<any>({});
  const [activeTab, setActiveTab] = useState<"current" | "history" | "substitutes">("current");

  const handleSubstituteAssignment = (teacherId: string, periodIndex: number, substituteId: string) => {
    setSubstitutions((prev: any) => ({
      ...prev,
      [`${teacherId}-${periodIndex}`]: substituteId
    }));
    console.log(`Assigned substitute ${substituteId} for ${teacherId} period ${periodIndex}`);
  };

  const getAssignedSubstitute = (teacherId: string, periodIndex: number) => {
    const substituteId = substitutions[`${teacherId}-${periodIndex}`];
    return mockSubstitutes.find(sub => sub.id === substituteId);
  };

  const sendNotification = (teacherId: string) => {
    console.log(`Sending notification for teacher ${teacherId}`);
  };

  const autoAssignSubstitute = (teacherId: string, subject: string) => {
    const availableSubstitutes = mockSubstitutes.filter(sub => 
      sub.subjects.includes(subject) && sub.availability === "Full-time"
    );
    if (availableSubstitutes.length > 0) {
      // Auto-assign the highest rated available substitute
      const bestSubstitute = availableSubstitutes.reduce((prev, current) => 
        prev.rating > current.rating ? prev : current
      );
      console.log(`Auto-assigned ${bestSubstitute.name} for ${subject}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Substitution Management
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Absence
              </Button>
              <Button size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Send Alerts
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage teacher absences and assign substitutes for {selectedTerm}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today's Absences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockAbsentTeachers.length}</div>
            <p className="text-xs text-muted-foreground">teachers absent</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Periods Affected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockAbsentTeachers.reduce((acc, teacher) => acc + teacher.periods.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">need coverage</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Available Substitutes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockSubstitutes.filter(sub => sub.availability === "Full-time").length}
            </div>
            <p className="text-xs text-muted-foreground">ready to assign</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Coverage Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">85%</div>
            <p className="text-xs text-muted-foreground">periods covered</p>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex gap-2">
            <Button 
              variant={activeTab === "current" ? "default" : "outline"}
              onClick={() => setActiveTab("current")}
              size="sm"
            >
              Current Absences
            </Button>
            <Button 
              variant={activeTab === "substitutes" ? "default" : "outline"}
              onClick={() => setActiveTab("substitutes")}
              size="sm"
            >
              Available Substitutes
            </Button>
            <Button 
              variant={activeTab === "history" ? "default" : "outline"}
              onClick={() => setActiveTab("history")}
              size="sm"
            >
              Substitution History
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === "current" && (
            <div className="space-y-4">
              {mockAbsentTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>No teacher absences reported for today</p>
                </div>
              ) : (
                mockAbsentTeachers.map((teacher) => (
                  <Card key={teacher.id} className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <span>{teacher.name}</span>
                            <Badge variant="outline" className="ml-2">{teacher.subject}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">{teacher.reason}</Badge>
                          {!teacher.notificationSent && (
                            <Button 
                              onClick={() => sendNotification(teacher.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Bell className="h-4 w-4 mr-1" />
                              Notify
                            </Button>
                          )}
                          <Button 
                            onClick={() => autoAssignSubstitute(teacher.id, teacher.subject)}
                            size="sm"
                          >
                            Auto-Assign
                          </Button>
                        </div>
                      </CardTitle>
                      <CardDescription>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Date: {teacher.date}
                          {teacher.notificationSent && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              <Bell className="h-3 w-3 mr-1" />
                              Notified
                            </Badge>
                          )}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <h5 className="font-medium text-sm">Affected Periods:</h5>
                        {teacher.periods.map((period, periodIndex) => (
                          <div key={periodIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <div>
                                <span className="font-medium">{period.time}</span>
                                <div className="text-sm text-muted-foreground">
                                  {period.class} - {period.subject}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={substitutions[`${teacher.id}-${periodIndex}`] || ""}
                                onChange={(e) => handleSubstituteAssignment(teacher.id, periodIndex, e.target.value)}
                                className="px-3 py-1 border rounded-md text-sm min-w-[150px]"
                              >
                                <option value="">Select Substitute</option>
                                {mockSubstitutes
                                  .filter(sub => sub.subjects.includes(teacher.subject))
                                  .map((substitute) => (
                                    <option key={substitute.id} value={substitute.id}>
                                      {substitute.name} ({substitute.rating}⭐)
                                    </option>
                                  ))}
                              </select>
                              {getAssignedSubstitute(teacher.id, periodIndex) && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                  Assigned
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "substitutes" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockSubstitutes.map((substitute) => (
                <Card key={substitute.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      {substitute.name}
                      <Badge 
                        variant={substitute.availability === "Full-time" ? "default" : "secondary"}
                        className={substitute.availability === "Full-time" ? "bg-green-100 text-green-800" : ""}
                      >
                        {substitute.availability}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Rating:</span>
                        <span className="font-medium">{substitute.rating}⭐</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Qualified for:</p>
                        <div className="flex flex-wrap gap-1">
                          {substitute.subjects.map((subject) => (
                            <Badge key={subject} variant="outline" className="text-xs">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" className="w-full">
                        Quick Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {mockSubstitutionHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium text-sm">
                        {record.substitute} substituted for {record.absentTeacher}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.date} • {record.period} • {record.class} - {record.subject}
                      </p>
                      {record.feedback && (
                        <p className="text-xs text-green-600 mt-1">"{record.feedback}"</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {record.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Contact Alert */}
      {mockAbsentTeachers.some(teacher => !teacher.notificationSent) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> Some absences haven't been notified yet. 
            Send alerts to affected classes and available substitutes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
