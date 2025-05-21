
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, PieChart, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for staff attendance
const mockStaffMembers = [
  { id: 1, name: "John Doe", avatar: "", department: "Mathematics", designation: "Teacher" },
  { id: 2, name: "Jane Smith", avatar: "", department: "Science", designation: "Senior Teacher" },
  { id: 3, name: "Robert Johnson", avatar: "", department: "English", designation: "Teacher" },
  { id: 4, name: "Michael Brown", avatar: "", department: "Physical Education", designation: "Coach" },
  { id: 5, name: "Sarah Williams", avatar: "", department: "Administration", designation: "Office Staff" },
];

// Generate mock attendance data
const generateMockAttendance = () => {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  const attendanceData = {};
  mockStaffMembers.forEach(staff => {
    attendanceData[staff.id] = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      if (date.getDay() === 0 || date.getDay() === 6) {
        // Weekend
        attendanceData[staff.id][day] = "weekend";
      } else if (Math.random() > 0.9) {
        // Absent
        attendanceData[staff.id][day] = "absent";
      } else if (Math.random() > 0.8) {
        // Late
        attendanceData[staff.id][day] = "late";
      } else if (Math.random() > 0.7) {
        // Leave
        attendanceData[staff.id][day] = "leave";
      } else {
        // Present
        attendanceData[staff.id][day] = "present";
      }
    }
  });
  
  return attendanceData;
};

const mockAttendanceData = generateMockAttendance();

// Function to get month names and current month
const getMonthName = (monthIndex) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return months[monthIndex];
};

const getCurrentMonth = () => {
  const now = new Date();
  return {
    index: now.getMonth(),
    name: getMonthName(now.getMonth()),
    year: now.getFullYear(),
    days: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  };
};

const AttendanceTracking = () => {
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [viewMode, setViewMode] = useState("daily");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [manualOverrideOpen, setManualOverrideOpen] = useState(false);
  const { toast } = useToast();

  // Generate days of the current month for the calendar header
  const daysInMonth = Array.from({ length: currentMonth.days }, (_, i) => i + 1);

  // Filter staff members based on department
  const filteredStaff = departmentFilter === "all" 
    ? mockStaffMembers 
    : mockStaffMembers.filter(staff => staff.department === departmentFilter);

  // Calculate attendance statistics
  const calculateStats = (staffId) => {
    const attendance = mockAttendanceData[staffId];
    let present = 0, absent = 0, late = 0, leave = 0, total = 0;

    for (const day in attendance) {
      if (attendance[day] !== "weekend") {
        total++;
        if (attendance[day] === "present") present++;
        if (attendance[day] === "absent") absent++;
        if (attendance[day] === "late") late++;
        if (attendance[day] === "leave") leave++;
      }
    }

    return {
      present,
      absent,
      late,
      leave,
      total,
      presentPercentage: total > 0 ? Math.round((present / total) * 100) : 0,
    };
  };

  const handleAttendanceChange = (staffId, day, status) => {
    // Update the attendance data (in a real app, this would update the database)
    mockAttendanceData[staffId][day] = status;
    
    toast({
      title: "Attendance updated",
      description: `Updated attendance for staff #${staffId} on day ${day} to ${status}`,
    });
  };

  const handleManualOverride = (staff) => {
    setSelectedStaff(staff);
    setManualOverrideOpen(true);
  };

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    setManualOverrideOpen(false);
    setSelectedStaff(null);
    
    toast({
      title: "Attendance overridden",
      description: "The attendance record has been successfully updated",
    });
  };

  const changeMonth = (offset) => {
    const newMonthIndex = (currentMonth.index + offset + 12) % 12;
    const newYear = currentMonth.year + Math.floor((currentMonth.index + offset) / 12);
    setCurrentMonth({
      index: newMonthIndex,
      name: getMonthName(newMonthIndex),
      year: newYear,
      days: new Date(newYear, newMonthIndex + 1, 0).getDate(),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Staff Attendance</h2>
          <p className="text-muted-foreground">Track and manage staff attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setViewMode("daily")} className={viewMode === "daily" ? "bg-secondary" : ""}>
            <Calendar className="h-4 w-4 mr-2" />
            Daily View
          </Button>
          <Button variant="outline" size="sm" onClick={() => setViewMode("summary")} className={viewMode === "summary" ? "bg-secondary" : ""}>
            <PieChart className="h-4 w-4 mr-2" />
            Summary
          </Button>
        </div>
      </div>

      {/* Filters and Month Navigation */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="Mathematics">Mathematics</SelectItem>
              <SelectItem value="Science">Science</SelectItem>
              <SelectItem value="English">English</SelectItem>
              <SelectItem value="Administration">Administration</SelectItem>
              <SelectItem value="Physical Education">Physical Education</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
            <span className="sr-only">Previous month</span>
            &lt;
          </Button>
          <div className="font-medium min-w-[150px] text-center">
            {currentMonth.name} {currentMonth.year}
          </div>
          <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
            <span className="sr-only">Next month</span>
            &gt;
          </Button>
        </div>
      </div>

      {viewMode === "daily" ? (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-background z-10">Staff</TableHead>
                  {daysInMonth.map(day => (
                    <TableHead 
                      key={day} 
                      className={`text-center min-w-[40px] ${day === selectedDate ? 'bg-muted' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      {day}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map(staff => (
                  <TableRow key={staff.id}>
                    <TableCell className="sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback>{staff.name.charAt(0)}{staff.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="text-xs text-muted-foreground">{staff.designation}</div>
                        </div>
                      </div>
                    </TableCell>
                    {daysInMonth.map(day => {
                      const status = mockAttendanceData[staff.id][day];
                      return (
                        <TableCell key={day} className={`text-center ${day === selectedDate ? 'bg-muted' : ''}`}>
                          <Select 
                            defaultValue={status} 
                            onValueChange={(value) => handleAttendanceChange(staff.id, day, value)}
                          >
                            <SelectTrigger className="h-7 w-7 p-0 border-0 bg-transparent">
                              <SelectValue>
                                <div className="w-full h-full flex items-center justify-center">
                                  {status === "present" && <div className="w-4 h-4 rounded-full bg-green-500" />}
                                  {status === "absent" && <div className="w-4 h-4 rounded-full bg-red-500" />}
                                  {status === "late" && <div className="w-4 h-4 rounded-full bg-yellow-500" />}
                                  {status === "leave" && <div className="w-4 h-4 rounded-full bg-blue-500" />}
                                  {status === "weekend" && <div className="w-4 h-4 rounded-full bg-gray-300" />}
                                </div>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                              <SelectItem value="late">Late</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                              {status === "weekend" && <SelectItem value="weekend">Weekend</SelectItem>}
                            </SelectContent>
                          </Select>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Staff Attendance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Summary</CardTitle>
              <CardDescription>Staff attendance statistics for {currentMonth.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStaff.map(staff => {
                  const stats = calculateStats(staff.id);
                  return (
                    <div key={staff.id} className="flex items-center p-4 border rounded-md">
                      <Avatar className="h-10 w-10 mr-4">
                        <AvatarImage src={staff.avatar} alt={staff.name} />
                        <AvatarFallback>{staff.name.charAt(0)}{staff.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{staff.name}</div>
                            <div className="text-xs text-muted-foreground">{staff.department} • {staff.designation}</div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleManualOverride(staff)}
                            className="text-xs"
                          >
                            Override
                          </Button>
                        </div>
                        <div className="mt-2 flex gap-2 flex-wrap">
                          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 hover:bg-green-100">
                            Present: {stats.present} ({stats.presentPercentage}%)
                          </Badge>
                          <Badge variant="default" className="bg-red-100 text-red-800 border-red-300 hover:bg-red-100">
                            Absent: {stats.absent}
                          </Badge>
                          <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-100">
                            Late: {stats.late}
                          </Badge>
                          <Badge variant="outline">
                            Leave: {stats.leave}
                          </Badge>
                        </div>
                        
                        <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500" 
                            style={{ width: `${stats.presentPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Attendance Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Department-wise attendance statistics</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
              <div className="w-full flex justify-center">
                <PieChart className="h-48 w-48 text-muted-foreground" />
              </div>
              <div className="w-full space-y-4">
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Mathematics Department</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Science Department</span>
                    <span>88%</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>English Department</span>
                    <span>95%</span>
                  </div>
                  <Progress value={95} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Administration</span>
                    <span>90%</span>
                  </div>
                  <Progress value={90} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Manual Override Dialog */}
      <Dialog open={manualOverrideOpen} onOpenChange={setManualOverrideOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Attendance Override</DialogTitle>
            <DialogDescription>
              Update attendance record for {selectedStaff?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleOverrideSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input 
                  id="date" 
                  type="date" 
                  defaultValue={`${currentMonth.year}-${String(currentMonth.index + 1).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Attendance Status</Label>
                <Select defaultValue="present">
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present</SelectItem>
                    <SelectItem value="absent">Absent</SelectItem>
                    <SelectItem value="late">Late</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea id="notes" placeholder="Add any relevant notes about this attendance record" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setManualOverrideOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceTracking;
