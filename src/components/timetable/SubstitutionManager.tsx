
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { UserX, UserCheck, Mail, Bell, Plus } from "lucide-react";

// Mock data
const mockAbsentTeachers = [
  {
    id: "teacher-1",
    name: "Ms. Johnson",
    subject: "Mathematics",
    date: "2024-05-27",
    reason: "Sick Leave",
    periods: ["08:00 - 08:45", "09:30 - 10:15", "13:30 - 14:15"]
  },
  {
    id: "teacher-3",
    name: "Dr. Brown",
    subject: "Science",
    date: "2024-05-28",
    reason: "Personal Leave",
    periods: ["10:30 - 11:15", "11:15 - 12:00"]
  },
];

const mockAvailableSubstitutes = [
  { id: "sub-1", name: "Mr. Wilson", subjects: ["Mathematics", "Science"] },
  { id: "sub-2", name: "Ms. Taylor", subjects: ["English", "History"] },
  { id: "sub-3", name: "Dr. Garcia", subjects: ["Science", "Mathematics"] },
];

export const SubstitutionManager = () => {
  const [substitutions, setSubstitutions] = useState<any>({});
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    appNotifications: true,
    smsNotifications: false,
  });

  const handleSubstituteAssignment = (teacherId: string, period: string, substituteId: string) => {
    setSubstitutions((prev: any) => ({
      ...prev,
      [`${teacherId}-${period}`]: substituteId
    }));
  };

  const getAssignedSubstitute = (teacherId: string, period: string) => {
    const substituteId = substitutions[`${teacherId}-${period}`];
    return mockAvailableSubstitutes.find(sub => sub.id === substituteId);
  };

  const handleNotificationToggle = (setting: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Absent Teachers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Absent Teachers
          </CardTitle>
          <CardDescription>Manage teacher absences and assign substitutes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockAbsentTeachers.map((teacher) => (
              <Card key={teacher.id} className="border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div>
                      <span>{teacher.name}</span>
                      <Badge variant="outline" className="ml-2">{teacher.subject}</Badge>
                    </div>
                    <Badge variant="destructive">{teacher.reason}</Badge>
                  </CardTitle>
                  <CardDescription>Date: {teacher.date}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h5 className="font-medium text-sm">Affected Periods:</h5>
                    {teacher.periods.map((period) => (
                      <div key={period} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium">{period}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Class 6A - {teacher.subject}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={substitutions[`${teacher.id}-${period}`] || ""}
                            onChange={(e) => handleSubstituteAssignment(teacher.id, period, e.target.value)}
                            className="px-3 py-1 border rounded-md text-sm"
                          >
                            <option value="">Select Substitute</option>
                            {mockAvailableSubstitutes
                              .filter(sub => sub.subjects.includes(teacher.subject))
                              .map((substitute) => (
                                <option key={substitute.id} value={substitute.id}>
                                  {substitute.name}
                                </option>
                              ))}
                          </select>
                          {getAssignedSubstitute(teacher.id, period) && (
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
            ))}
            
            {mockAbsentTeachers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>No teacher absences reported for today</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Substitutes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Available Substitutes
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Substitute
            </Button>
          </CardTitle>
          <CardDescription>Pool of available substitute teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockAvailableSubstitutes.map((substitute) => (
              <Card key={substitute.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{substitute.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Qualified for:</p>
                    <div className="flex flex-wrap gap-1">
                      {substitute.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure how substitution notifications are sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500" />
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Send emails to substitute teachers and affected classes
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.emailNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("emailNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-green-500" />
                <div>
                  <h4 className="font-medium">In-App Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Show notifications within the school management system
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.appNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("appNotifications", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-orange-500" />
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Send SMS alerts for urgent substitution requests
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationSettings.smsNotifications}
                onCheckedChange={(checked) => handleNotificationToggle("smsNotifications", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Substitution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Substitutions</CardTitle>
          <CardDescription>History of recent substitute assignments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                date: "2024-05-26",
                absentTeacher: "Ms. Johnson",
                substitute: "Mr. Wilson",
                period: "08:00 - 08:45",
                class: "Class 6A",
                subject: "Mathematics"
              },
              {
                date: "2024-05-25",
                absentTeacher: "Dr. Brown",
                substitute: "Dr. Garcia",
                period: "10:30 - 11:15",
                class: "Class 7B",
                subject: "Science"
              },
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-sm">
                    {record.substitute} substituted for {record.absentTeacher}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {record.date} • {record.period} • {record.class} - {record.subject}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Completed
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
