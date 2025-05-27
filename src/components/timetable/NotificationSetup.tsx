
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone, Clock, Calendar } from "lucide-react";

export const NotificationSetup = () => {
  const [notifications, setNotifications] = useState({
    timetableChanges: {
      email: true,
      app: true,
      sms: false,
    },
    dailyReminders: {
      email: false,
      app: true,
      sms: false,
    },
    weeklySchedule: {
      email: true,
      app: false,
      sms: false,
    },
    substitutions: {
      email: true,
      app: true,
      sms: true,
    },
    roomConflicts: {
      email: true,
      app: true,
      sms: false,
    },
  });

  const [schedule, setSchedule] = useState({
    dailyReminderTime: "07:00",
    weeklyScheduleDay: "sunday",
    advanceNotification: 24, // hours
  });

  const [recipients, setRecipients] = useState({
    teachers: true,
    students: true,
    parents: false,
    administration: true,
  });

  const handleNotificationToggle = (category: string, method: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [method]: value
      }
    }));
  };

  const handleScheduleChange = (field: string, value: any) => {
    setSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRecipientToggle = (recipient: string, value: boolean) => {
    setRecipients(prev => ({
      ...prev,
      [recipient]: value
    }));
  };

  const sendTestNotification = (type: string) => {
    console.log(`Sending test ${type} notification`);
  };

  const notificationCategories = [
    {
      id: "timetableChanges",
      name: "Timetable Changes",
      description: "Notify when timetables are updated or modified",
      icon: Calendar,
      priority: "high"
    },
    {
      id: "dailyReminders",
      name: "Daily Reminders",
      description: "Daily schedule notifications for upcoming classes",
      icon: Clock,
      priority: "medium"
    },
    {
      id: "weeklySchedule",
      name: "Weekly Schedule",
      description: "Weekly timetable summary notifications",
      icon: Calendar,
      priority: "low"
    },
    {
      id: "substitutions",
      name: "Substitutions",
      description: "Alerts for teacher substitutions and changes",
      icon: Bell,
      priority: "high"
    },
    {
      id: "roomConflicts",
      name: "Room Conflicts",
      description: "Warnings about room allocation conflicts",
      icon: Bell,
      priority: "high"
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure when and how notifications are sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {notificationCategories.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium flex items-center gap-2">
                          {category.name}
                          <Badge className={getPriorityColor(category.priority)}>
                            {category.priority}
                          </Badge>
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Email</span>
                      </div>
                      <Switch
                        checked={notifications[category.id as keyof typeof notifications]?.email}
                        onCheckedChange={(checked) => 
                          handleNotificationToggle(category.id, "email", checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">In-App</span>
                      </div>
                      <Switch
                        checked={notifications[category.id as keyof typeof notifications]?.app}
                        onCheckedChange={(checked) => 
                          handleNotificationToggle(category.id, "app", checked)
                        }
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium">SMS</span>
                      </div>
                      <Switch
                        checked={notifications[category.id as keyof typeof notifications]?.sms}
                        onCheckedChange={(checked) => 
                          handleNotificationToggle(category.id, "sms", checked)
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Notification Schedule
          </CardTitle>
          <CardDescription>Configure when notifications are sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Daily Reminder Time</label>
              <input
                type="time"
                value={schedule.dailyReminderTime}
                onChange={(e) => handleScheduleChange("dailyReminderTime", e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Weekly Schedule Day</label>
              <select
                value={schedule.weeklyScheduleDay}
                onChange={(e) => handleScheduleChange("weeklyScheduleDay", e.target.value)}
                className="w-full p-2 border rounded-md"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="friday">Friday</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Advance Notice (hours)</label>
              <input
                type="number"
                value={schedule.advanceNotification}
                onChange={(e) => handleScheduleChange("advanceNotification", parseInt(e.target.value))}
                className="w-full p-2 border rounded-md"
                min="1"
                max="168"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Recipients</CardTitle>
          <CardDescription>Choose who receives notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Teachers</h4>
                <p className="text-sm text-muted-foreground">Teaching staff</p>
              </div>
              <Switch
                checked={recipients.teachers}
                onCheckedChange={(checked) => handleRecipientToggle("teachers", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Students</h4>
                <p className="text-sm text-muted-foreground">Student accounts</p>
              </div>
              <Switch
                checked={recipients.students}
                onCheckedChange={(checked) => handleRecipientToggle("students", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Parents</h4>
                <p className="text-sm text-muted-foreground">Parent accounts</p>
              </div>
              <Switch
                checked={recipients.parents}
                onCheckedChange={(checked) => handleRecipientToggle("parents", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Administration</h4>
                <p className="text-sm text-muted-foreground">Admin staff</p>
              </div>
              <Switch
                checked={recipients.administration}
                onCheckedChange={(checked) => handleRecipientToggle("administration", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>Send test notifications to verify settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => sendTestNotification("email")} 
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <Mail className="h-5 w-5 mb-2" />
              Test Email
            </Button>
            
            <Button 
              onClick={() => sendTestNotification("app")} 
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <Bell className="h-5 w-5 mb-2" />
              Test In-App
            </Button>
            
            <Button 
              onClick={() => sendTestNotification("sms")} 
              variant="outline"
              className="h-16 flex flex-col items-center justify-center"
            >
              <Smartphone className="h-5 w-5 mb-2" />
              Test SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button className="w-full md:w-auto">
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};
