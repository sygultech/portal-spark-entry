
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, differenceInDays, isToday } from "date-fns";
import { Calendar as CalendarIcon, Check, Clock, File, FileText, Search, X } from "lucide-react";

const LeaveManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("applications");
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(addDays(new Date(), 1));
  const [leaveType, setLeaveType] = useState<string>("sick");
  const { toast } = useToast();
  
  // Mock leave types with quota
  const leaveTypes = [
    { id: "sick", name: "Sick Leave", quota: 10, used: 2, balance: 8 },
    { id: "casual", name: "Casual Leave", quota: 12, used: 5, balance: 7 },
    { id: "earned", name: "Earned Leave", quota: 15, used: 0, balance: 15 },
    { id: "maternity", name: "Maternity Leave", quota: 180, used: 0, balance: 180 },
    { id: "paternity", name: "Paternity Leave", quota: 15, used: 0, balance: 15 },
    { id: "unpaid", name: "Leave Without Pay", quota: 0, used: 0, balance: 0 },
  ];

  // Mock leave applications
  const leaveApplications = [
    { 
      id: 1, 
      staffName: "John Doe", 
      department: "Mathematics", 
      type: "Sick Leave", 
      startDate: "2025-05-25", 
      endDate: "2025-05-27", 
      days: 3, 
      status: "Approved", 
      appliedOn: "2025-05-20" 
    },
    { 
      id: 2, 
      staffName: "Jane Smith", 
      department: "Science", 
      type: "Casual Leave", 
      startDate: "2025-06-10", 
      endDate: "2025-06-12", 
      days: 3, 
      status: "Pending", 
      appliedOn: "2025-05-21" 
    },
    { 
      id: 3, 
      staffName: "Robert Johnson", 
      department: "Admin", 
      type: "Earned Leave", 
      startDate: "2025-07-01", 
      endDate: "2025-07-10", 
      days: 10, 
      status: "Rejected", 
      appliedOn: "2025-05-15",
      reason: "Staff shortage during evaluation period"
    },
  ];

  // Mock holidays
  const holidays = [
    { id: 1, name: "Memorial Day", date: "2025-05-26", type: "Public" },
    { id: 2, name: "Independence Day", date: "2025-07-04", type: "Public" },
    { id: 3, name: "Labor Day", date: "2025-09-01", type: "Public" },
    { id: 4, name: "Thanksgiving Day", date: "2025-11-27", type: "Public" },
    { id: 5, name: "Christmas Day", date: "2025-12-25", type: "Public" },
    { id: 6, name: "New Year's Day", date: "2026-01-01", type: "Public" },
    { id: 7, name: "School Foundation Day", date: "2025-06-15", type: "School" },
    { id: 8, name: "Teacher's Day", date: "2025-09-05", type: "School" }
  ];

  const handleApplyLeave = () => {
    if (!startDate || !endDate) return;
    
    const days = differenceInDays(endDate, startDate) + 1;
    
    toast({
      title: "Leave application submitted",
      description: `${days} days of ${leaveTypes.find(lt => lt.id === leaveType)?.name} requested successfully.`,
    });
  };

  const handleApproveLeave = (id: number) => {
    toast({
      title: "Leave approved",
      description: "The leave application has been approved",
    });
  };

  const handleRejectLeave = (id: number) => {
    toast({
      title: "Leave rejected",
      description: "The leave application has been rejected",
    });
  };

  const handleAddLeaveType = () => {
    toast({
      title: "Leave type added",
      description: "New leave type has been added successfully",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="applications">Leave Applications</TabsTrigger>
          <TabsTrigger value="allocations">Leave Allocations</TabsTrigger>
          <TabsTrigger value="apply">Apply Leave</TabsTrigger>
          <TabsTrigger value="holidays">Holidays</TabsTrigger>
        </TabsList>
        
        <TabsContent value="applications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Leave Applications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-8" 
                  placeholder="Search applications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveApplications.map((application) => (
                    <TableRow key={application.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {application.staffName.split(' ').map(name => name[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{application.staffName}</div>
                            <div className="text-xs text-muted-foreground">{application.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{application.type}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{application.startDate}</span>
                          <span className="mx-1">to</span>
                          <span className="font-medium">{application.endDate}</span>
                        </div>
                      </TableCell>
                      <TableCell>{application.days}</TableCell>
                      <TableCell>{application.appliedOn}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            application.status === "Approved" ? "success" : 
                            application.status === "Rejected" ? "destructive" : 
                            "outline"
                          }
                        >
                          {application.status === "Approved" && <Check className="mr-1 h-3 w-3" />}
                          {application.status === "Rejected" && <X className="mr-1 h-3 w-3" />}
                          {application.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                          {application.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <FileText className="mr-1 h-3 w-3" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Leave Application Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Staff Name</p>
                                    <p className="text-sm">{application.staffName}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Department</p>
                                    <p className="text-sm">{application.department}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Leave Type</p>
                                    <p className="text-sm">{application.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Status</p>
                                    <Badge 
                                      variant={
                                        application.status === "Approved" ? "success" : 
                                        application.status === "Rejected" ? "destructive" : 
                                        "outline"
                                      }
                                    >
                                      {application.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Period</p>
                                    <p className="text-sm">{application.startDate} to {application.endDate}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Applied On</p>
                                    <p className="text-sm">{application.appliedOn}</p>
                                  </div>
                                </div>
                                
                                {application.reason && (
                                  <div>
                                    <p className="text-sm font-medium">Rejection Reason</p>
                                    <p className="text-sm text-destructive">{application.reason}</p>
                                  </div>
                                )}
                              </div>
                              <DialogFooter className="gap-2">
                                {application.status === "Pending" && (
                                  <>
                                    <Button variant="outline" onClick={() => handleRejectLeave(application.id)}>
                                      Reject
                                    </Button>
                                    <Button onClick={() => handleApproveLeave(application.id)}>
                                      Approve
                                    </Button>
                                  </>
                                )}
                                {application.status !== "Pending" && (
                                  <Button variant="outline">
                                    Close
                                  </Button>
                                )}
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          {application.status === "Pending" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleApproveLeave(application.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRejectLeave(application.id)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="allocations" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Leave Types & Allocations</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Add Leave Type</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Leave Type</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="leaveName">Leave Type Name</Label>
                      <Input id="leaveName" placeholder="Enter leave type name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultQuota">Default Annual Quota</Label>
                      <Input id="defaultQuota" type="number" min="0" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="carryForward">Carry Forward Allowed</Label>
                      <Select defaultValue="no">
                        <SelectTrigger id="carryForward">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="applicableFor">Applicable For</Label>
                      <Select defaultValue="all">
                        <SelectTrigger id="applicableFor">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Staff</SelectItem>
                          <SelectItem value="teaching">Teaching Staff</SelectItem>
                          <SelectItem value="admin">Administrative Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea id="description" placeholder="Enter description" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddLeaveType}>Save Leave Type</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Annual Quota</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Applicable For</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaveTypes.map((leaveType) => (
                    <TableRow key={leaveType.id}>
                      <TableCell className="font-medium">{leaveType.name}</TableCell>
                      <TableCell>{leaveType.quota}</TableCell>
                      <TableCell>{leaveType.used}</TableCell>
                      <TableCell>{leaveType.balance}</TableCell>
                      <TableCell>All Staff</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="apply" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apply for Leave</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 max-w-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="leaveType">Leave Type</Label>
                    <Select value={leaveType} onValueChange={setLeaveType}>
                      <SelectTrigger id="leaveType">
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                      <SelectContent>
                        {leaveTypes.map(type => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.name} ({type.balance} days left)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Current Balance</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background flex items-center text-sm">
                      <span>{leaveTypes.find(lt => lt.id === leaveType)?.balance || 0} days</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          initialFocus
                          disabled={(date) => startDate ? date < startDate : date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea id="reason" rows={4} placeholder="Enter details about your leave request" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactDuringLeave">Contact During Leave</Label>
                  <Input id="contactDuringLeave" placeholder="Phone number" />
                </div>
                
                <div>
                  {startDate && endDate && (
                    <div className="text-sm bg-secondary/50 p-3 rounded-md">
                      <span className="font-medium">
                        Duration: {differenceInDays(endDate, startDate) + 1} day(s)
                      </span>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        Note: Weekends and holidays are included in this calculation.
                      </span>
                    </div>
                  )}
                </div>
                
                <Button onClick={handleApplyLeave}>Submit Leave Application</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="holidays" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Holiday Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upcoming">
                <TabsList className="mb-4">
                  <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                  <TabsTrigger value="past">Past</TabsTrigger>
                  <TabsTrigger value="all">All Holidays</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upcoming">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holiday Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Days Left</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.slice(0, 5).map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{holiday.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{holiday.type}</Badge>
                          </TableCell>
                          <TableCell>
                            {isToday(new Date(holiday.date)) ? (
                              <Badge variant="success">Today</Badge>
                            ) : (
                              differenceInDays(new Date(holiday.date), new Date()) + " days"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="past">
                  <p className="text-center text-muted-foreground py-10">No past holidays in the current year</p>
                </TabsContent>
                
                <TabsContent value="all">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holiday Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holidays.map((holiday) => (
                        <TableRow key={holiday.id}>
                          <TableCell className="font-medium">{holiday.name}</TableCell>
                          <TableCell>{holiday.date}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{holiday.type}</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaveManagement;
