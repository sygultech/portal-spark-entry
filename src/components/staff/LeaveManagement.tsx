
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Calendar, 
  Filter, 
  Search, 
  Check, 
  X, 
  Clock, 
  Plus 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Mock data for leave types
const mockLeaveTypes = [
  { id: 1, name: "Annual Leave", defaultDays: 20, description: "Yearly vacation days allocation" },
  { id: 2, name: "Sick Leave", defaultDays: 15, description: "Leave for medical reasons" },
  { id: 3, name: "Maternity Leave", defaultDays: 90, description: "Leave for childbirth and early childcare" },
  { id: 4, name: "Paternity Leave", defaultDays: 14, description: "Leave for non-birthing parents" },
  { id: 5, name: "Bereavement Leave", defaultDays: 5, description: "Leave for family loss" },
  { id: 6, name: "Unpaid Leave", defaultDays: 0, description: "Leave without pay" },
];

// Mock data for leave applications
const mockLeaveApplications = [
  {
    id: 1,
    staffId: 1,
    staffName: "John Doe",
    staffAvatar: "",
    staffDepartment: "Mathematics",
    leaveType: "Annual Leave",
    startDate: "2023-05-15",
    endDate: "2023-05-20",
    days: 6,
    reason: "Family vacation",
    status: "approved",
    appliedOn: "2023-05-01",
    approvedBy: "Sarah Johnson",
  },
  {
    id: 2,
    staffId: 2,
    staffName: "Jane Smith",
    staffAvatar: "",
    staffDepartment: "Science",
    leaveType: "Sick Leave",
    startDate: "2023-05-25",
    endDate: "2023-05-26",
    days: 2,
    reason: "Medical appointment",
    status: "pending",
    appliedOn: "2023-05-20",
    approvedBy: "",
  },
  {
    id: 3,
    staffId: 3,
    staffName: "Robert Johnson",
    staffAvatar: "",
    staffDepartment: "English",
    leaveType: "Unpaid Leave",
    startDate: "2023-06-01",
    endDate: "2023-06-10",
    days: 10,
    reason: "Personal reasons",
    status: "pending",
    appliedOn: "2023-05-15",
    approvedBy: "",
  },
  {
    id: 4,
    staffId: 4,
    staffName: "Michael Brown",
    staffAvatar: "",
    staffDepartment: "Physical Education",
    leaveType: "Annual Leave",
    startDate: "2023-06-15",
    endDate: "2023-06-18",
    days: 4,
    reason: "Family event",
    status: "approved",
    appliedOn: "2023-05-10",
    approvedBy: "Sarah Johnson",
  },
  {
    id: 5,
    staffId: 5,
    staffName: "Sarah Williams",
    staffAvatar: "",
    staffDepartment: "Administration",
    leaveType: "Sick Leave",
    startDate: "2023-05-10",
    endDate: "2023-05-12",
    days: 3,
    reason: "Feeling unwell",
    status: "rejected",
    appliedOn: "2023-05-09",
    approvedBy: "",
    rejectReason: "Insufficient staff during this period"
  },
];

// Mock staff leave balances
const mockLeaveBalances = [
  {
    staffId: 1,
    staffName: "John Doe",
    annualLeave: { total: 20, used: 6, remaining: 14 },
    sickLeave: { total: 15, used: 0, remaining: 15 },
    maternityLeave: { total: 0, used: 0, remaining: 0 },
    paternityLeave: { total: 14, used: 0, remaining: 14 },
    bereavementLeave: { total: 5, used: 0, remaining: 5 },
    unpaidLeave: { total: 0, used: 0, remaining: 0 },
  },
  {
    staffId: 2,
    staffName: "Jane Smith",
    annualLeave: { total: 20, used: 2, remaining: 18 },
    sickLeave: { total: 15, used: 2, remaining: 13 },
    maternityLeave: { total: 90, used: 0, remaining: 90 },
    paternityLeave: { total: 0, used: 0, remaining: 0 },
    bereavementLeave: { total: 5, used: 0, remaining: 5 },
    unpaidLeave: { total: 0, used: 0, remaining: 0 },
  },
];

// Mock holidays data
const mockHolidays = [
  { id: 1, name: "New Year's Day", date: "2023-01-01", type: "Public Holiday" },
  { id: 2, name: "Easter", date: "2023-04-09", type: "Public Holiday" },
  { id: 3, name: "Labor Day", date: "2023-05-01", type: "Public Holiday" },
  { id: 4, name: "Independence Day", date: "2023-07-04", type: "Public Holiday" },
  { id: 5, name: "Teachers' Day", date: "2023-10-05", type: "School Holiday" },
  { id: 6, name: "Christmas Day", date: "2023-12-25", type: "Public Holiday" },
];

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState("applications");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isApplyLeaveDialogOpen, setIsApplyLeaveDialogOpen] = useState(false);
  const [isLeaveTypeDialogOpen, setIsLeaveTypeDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [leaveApplications, setLeaveApplications] = useState(mockLeaveApplications);
  const { toast } = useToast();

  // Filter leave applications
  const filteredApplications = leaveApplications.filter(application => {
    const matchesSearch = 
      application.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      application.leaveType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || application.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAction = (id: number, action: string) => {
    // Update application status based on the action
    setLeaveApplications(leaveApplications.map(app => 
      app.id === id ? { ...app, status: action } : app
    ));
    
    toast({
      title: `Leave application ${action}`,
      description: `The leave application has been ${action}`,
    });
  };
  
  const handleLeaveTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLeaveTypeDialogOpen(false);
    
    toast({
      title: selectedLeave ? "Leave type updated" : "Leave type created",
      description: selectedLeave 
        ? "The leave type has been successfully updated" 
        : "New leave type has been successfully created",
    });
  };
  
  const handleApplyLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsApplyLeaveDialogOpen(false);
    
    toast({
      title: "Leave application submitted",
      description: "Your leave application has been submitted successfully",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold">Leave Management</h2>
        <Button onClick={() => setIsApplyLeaveDialogOpen(true)}>Apply for Leave</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="balances">Leave Balances</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Leave Applications Tab */}
        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Leave Applications</CardTitle>
              <CardDescription>View and manage leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    className="pl-8" 
                    placeholder="Search by staff name or leave type..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Leave Type</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.length > 0 ? filteredApplications.map(application => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={application.staffAvatar} alt={application.staffName} />
                              <AvatarFallback>
                                {application.staffName.charAt(0)}
                                {application.staffName.split(' ')[1]?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{application.staffName}</div>
                              <div className="text-xs text-muted-foreground">{application.staffDepartment}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{application.leaveType}</TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">
                            {new Date(application.startDate).toLocaleDateString()} - 
                            {new Date(application.endDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>{application.days}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              application.status === "approved" ? "default" : 
                              application.status === "pending" ? "outline" : "secondary"
                            }
                            className={
                              application.status === "rejected" ? "bg-red-100 text-red-800 hover:bg-red-100" : ""
                            }
                          >
                            {application.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                            {application.status === "approved" && <Check className="h-3 w-3 mr-1" />}
                            {application.status === "rejected" && <X className="h-3 w-3 mr-1" />}
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">View</Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Leave Application Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center space-x-4">
                                    <Avatar className="h-12 w-12">
                                      <AvatarImage src={application.staffAvatar} alt={application.staffName} />
                                      <AvatarFallback>
                                        {application.staffName.charAt(0)}
                                        {application.staffName.split(' ')[1]?.charAt(0)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <h4 className="text-lg font-medium">{application.staffName}</h4>
                                      <p className="text-sm text-muted-foreground">{application.staffDepartment}</p>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Leave Type</Label>
                                      <div className="font-medium">{application.leaveType}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Duration</Label>
                                      <div className="font-medium">{application.days} days</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">From</Label>
                                      <div className="font-medium">{new Date(application.startDate).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">To</Label>
                                      <div className="font-medium">{new Date(application.endDate).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Applied On</Label>
                                      <div className="font-medium">{new Date(application.appliedOn).toLocaleDateString()}</div>
                                    </div>
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Status</Label>
                                      <div>
                                        <Badge 
                                          variant={
                                            application.status === "approved" ? "default" : 
                                            application.status === "pending" ? "outline" : "secondary"
                                          }
                                          className={
                                            application.status === "rejected" ? "bg-red-100 text-red-800 hover:bg-red-100" : ""
                                          }
                                        >
                                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  <div>
                                    <Label className="text-xs text-muted-foreground">Reason</Label>
                                    <div className="mt-1 p-2 rounded border bg-muted/50">
                                      {application.reason}
                                    </div>
                                  </div>

                                  {application.status === "approved" && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Approved By</Label>
                                      <div className="font-medium">{application.approvedBy}</div>
                                    </div>
                                  )}

                                  {application.status === "rejected" && application.rejectReason && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">Rejection Reason</Label>
                                      <div className="mt-1 p-2 rounded border bg-muted/50 text-red-800">
                                        {application.rejectReason}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {application.status === "pending" && (
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => handleAction(application.id, "rejected")}>
                                      <X className="h-4 w-4 mr-2" />
                                      Reject
                                    </Button>
                                    <Button onClick={() => handleAction(application.id, "approved")}>
                                      <Check className="h-4 w-4 mr-2" />
                                      Approve
                                    </Button>
                                  </DialogFooter>
                                )}
                              </DialogContent>
                            </Dialog>

                            {application.status === "pending" && (
                              <>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleAction(application.id, "rejected")}>
                                  <X className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleAction(application.id, "approved")}>
                                  <Check className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                          No leave applications found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Leave Balances Tab */}
        <TabsContent value="balances" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockLeaveBalances.map(balance => (
              <Card key={balance.staffId}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {balance.staffName.charAt(0)}
                        {balance.staffName.split(' ')[1]?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{balance.staffName}</CardTitle>
                      <CardDescription>Leave balances for 2023</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Annual Leave</span>
                        <span>{balance.annualLeave.remaining} / {balance.annualLeave.total} days</span>
                      </div>
                      <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ 
                          width: `${(balance.annualLeave.remaining / balance.annualLeave.total) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Sick Leave</span>
                        <span>{balance.sickLeave.remaining} / {balance.sickLeave.total} days</span>
                      </div>
                      <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ 
                          width: `${(balance.sickLeave.remaining / balance.sickLeave.total) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                    {balance.maternityLeave.total > 0 && (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Maternity Leave</span>
                          <span>{balance.maternityLeave.remaining} / {balance.maternityLeave.total} days</span>
                        </div>
                        <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ 
                            width: `${(balance.maternityLeave.remaining / balance.maternityLeave.total) * 100}%` 
                          }}></div>
                        </div>
                      </div>
                    )}
                    {balance.paternityLeave.total > 0 && (
                      <div>
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Paternity Leave</span>
                          <span>{balance.paternityLeave.remaining} / {balance.paternityLeave.total} days</span>
                        </div>
                        <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ 
                            width: `${(balance.paternityLeave.remaining / balance.paternityLeave.total) * 100}%` 
                          }}></div>
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Bereavement Leave</span>
                        <span>{balance.bereavementLeave.remaining} / {balance.bereavementLeave.total} days</span>
                      </div>
                      <div className="mt-1 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ 
                          width: `${(balance.bereavementLeave.remaining / balance.bereavementLeave.total) * 100}%` 
                        }}></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Holidays Tab */}
        <TabsContent value="holidays" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Holidays</CardTitle>
              <CardDescription>School and public holidays for the academic year</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockHolidays.map(holiday => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{new Date(holiday.date).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={holiday.type === "Public Holiday" ? "outline" : "secondary"}>
                            {holiday.type}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Leave Types</h3>
            <Button onClick={() => {
              setSelectedLeave(null);
              setIsLeaveTypeDialogOpen(true);
            }}
            className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Leave Type
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Default Days</TableHead>
                    <TableHead className="hidden md:table-cell">Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockLeaveTypes.map(leaveType => (
                    <TableRow key={leaveType.id}>
                      <TableCell className="font-medium">{leaveType.name}</TableCell>
                      <TableCell>{leaveType.defaultDays}</TableCell>
                      <TableCell className="hidden md:table-cell">{leaveType.description}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setSelectedLeave(leaveType);
                            setIsLeaveTypeDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Apply Leave Dialog */}
      <Dialog open={isApplyLeaveDialogOpen} onOpenChange={setIsApplyLeaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for Leave</DialogTitle>
            <DialogDescription>
              Fill in the details to submit a leave application
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleApplyLeaveSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type</Label>
                <Select>
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockLeaveTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="days">Number of Days</Label>
                  <span className="text-sm text-muted-foreground">4 days</span>
                </div>
                <Input 
                  id="days" 
                  type="number"
                  min="1"
                  defaultValue={1}
                  readOnly
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  placeholder="Please provide the reason for your leave application"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsApplyLeaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leave Type Dialog */}
      <Dialog open={isLeaveTypeDialogOpen} onOpenChange={setIsLeaveTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedLeave ? "Edit Leave Type" : "Add Leave Type"}</DialogTitle>
            <DialogDescription>
              {selectedLeave ? "Update leave type settings" : "Create a new leave type for staff"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLeaveTypeSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Leave Type Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Sick Leave"
                  defaultValue={selectedLeave?.name || ""}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="defaultDays">Default Days Allocation</Label>
                <Input 
                  id="defaultDays" 
                  type="number"
                  min="0"
                  defaultValue={selectedLeave?.defaultDays || 0}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of this leave type"
                  rows={3}
                  defaultValue={selectedLeave?.description || ""}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsLeaveTypeDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {selectedLeave ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeaveManagement;
