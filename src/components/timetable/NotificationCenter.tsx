
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Bell, Mail, MessageSquare, Smartphone, Clock, Calendar, Users, Send } from "lucide-react";

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState({
    timetablePublish: {
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
    conflicts: {
      email: true,
      app: true,
      sms: false,
    },
    lastMinuteChanges: {
      email: true,
      app: true,
      sms: true,
    },
  });

  const [schedule, setSchedule] = useState({
    dailyReminderTime: "07:00",
    weeklyScheduleDay: "sunday",
    advanceNotification: 24,
    emergencyNotification: true,
  });

  const [recipients, setRecipients] = useState({
    teachers: true,
    students: true,
    parents: true,
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

  const sendBulkNotification = () => {
    console.log("Sending bulk notification about timetable changes");
  };

  const notificationCategories = [
    {
      id: "timetablePublish",
      name: "Timetable Publishing",
      description: "Notify when timetables are published or updated",
      icon: Calendar,
      priority: "high",
      frequency: "As needed"
    },
    {
      id: "dailyReminders",
      name: "Daily Schedule Reminders",
      description: "Daily notifications with today's schedule",
      icon: Clock,
      priority: "medium",
      frequency: "Daily at 7:00 AM"
    },
    {
      id: "weeklySchedule",
      name: "Weekly Schedule Summary",
      description: "Weekly overview of upcoming classes",
      icon: Calendar,
      priority: "low",
      frequency: "Weekly on Sunday"
    },
    {
      id: "substitutions",
      name: "Teacher Substitutions",
      description: "Immediate alerts for teacher changes",
      icon: Users,
      priority: "high",
      frequency: "Immediate"
    },
    {
      id: "conflicts",
      name: "Schedule Conflicts",
      description: "Warnings about scheduling conflicts",
      icon: Bell,
      priority: "high",
      frequency: "As detected"
    },
    {
      id: "lastMinuteChanges",
      name: "Last-Minute Changes",
      description: "Emergency schedule modifications",
      icon: Bell,
      priority: "high",
      frequency: "Emergency only"
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
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </div>
            <Button onClick={sendBulkNotification} size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send Bulk Update
            </Button>
          </CardTitle>
          <CardDescription>Configure when and how timetable notifications are sent to users</CardDescription>
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
                        <p className="text-xs text-muted-foreground mt-1">
                          Frequency: {category.frequency}
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
          <CardDescription>Configure timing and frequency of automated notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                <option value="saturday">Saturday</option>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Emergency Notifications</label>
              <div className="flex items-center justify-between p-2 border rounded-md">
                <span className="text-sm">Enable instant alerts</span>
                <Switch
                  checked={schedule.emergencyNotification}
                  onCheckedChange={(checked) => handleScheduleChange("emergencyNotification", checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Notification Recipients
          </CardTitle>
          <CardDescription>Choose which user groups receive different types of notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Teachers</h4>
                <p className="text-sm text-muted-foreground">All teaching staff</p>
                <Badge variant="outline" className="mt-1">142 users</Badge>
              </div>
              <Switch
                checked={recipients.teachers}
                onCheckedChange={(checked) => handleRecipientToggle("teachers", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Students</h4>
                <p className="text-sm text-muted-foreground">All student accounts</p>
                <Badge variant="outline" className="mt-1">1,247 users</Badge>
              </div>
              <Switch
                checked={recipients.students}
                onCheckedChange={(checked) => handleRecipientToggle("students", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Parents</h4>
                <p className="text-sm text-muted-foreground">Parent/guardian accounts</p>
                <Badge variant="outline" className="mt-1">892 users</Badge>
              </div>
              <Switch
                checked={recipients.parents}
                onCheckedChange={(checked) => handleRecipientToggle("parents", checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Administration</h4>
                <p className="text-sm text-muted-foreground">Admin and support staff</p>
                <Badge variant="outline" className="mt-1">28 users</Badge>
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
          <CardDescription>Send test notifications to verify your settings are working correctly</CardDescription>
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

      {/* Notification Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Sent Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">347</div>
            <p className="text-xs text-muted-foreground">notifications delivered</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98.2%</div>
            <p className="text-xs text-muted-foreground">successful delivery</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Open Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">76.4%</div>
            <p className="text-xs text-muted-foreground">email/app opens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">2,156</div>
            <p className="text-xs text-muted-foreground">receiving notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Save Settings */}
      <div className="flex justify-end">
        <Button className="w-full md:w-auto">
          Save Notification Settings
        </Button>
      </div>
    </div>
  );
};
