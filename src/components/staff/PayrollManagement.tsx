
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Plus, Search, Settings } from "lucide-react";
import { format } from "date-fns";

const PayrollManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [activeTab, setActiveTab] = useState("payroll");
  const { toast } = useToast();
  
  // Mock data for payroll records
  const payrollData = [
    {
      id: 1,
      name: "John Doe",
      department: "Mathematics",
      position: "Senior Teacher",
      basic: 5000,
      hra: 2000,
      allowances: 1000,
      deductions: 500,
      net: 7500,
      status: "Paid",
      payDate: "2025-05-15"
    },
    {
      id: 2,
      name: "Jane Smith",
      department: "Science",
      position: "Teacher",
      basic: 4500,
      hra: 1800,
      allowances: 800,
      deductions: 450,
      net: 6650,
      status: "Processing",
      payDate: null
    },
    {
      id: 3,
      name: "Robert Johnson",
      department: "Admin",
      position: "Office Assistant",
      basic: 3500,
      hra: 1400,
      allowances: 600,
      deductions: 350,
      net: 5150,
      status: "Paid",
      payDate: "2025-05-15"
    }
  ];
  
  const handleGeneratePayroll = () => {
    toast({
      title: "Payroll generated",
      description: "Payroll has been successfully generated for May 2025",
    });
  };
  
  const handleDownloadPayslip = (id: number) => {
    toast({
      title: "Payslip downloaded",
      description: "Payslip has been downloaded as PDF",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="payroll">Payroll Processing</TabsTrigger>
          <TabsTrigger value="structure">Salary Structure</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Monthly Payroll</CardTitle>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Period:</span>
                  <Input 
                    type="month" 
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)} 
                    className="w-40"
                  />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Generate Payroll
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Monthly Payroll</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                      <p>This will generate payroll for all staff for {selectedMonth}.</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Note: Attendance and leave data will be included in calculations.
                      </p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button onClick={handleGeneratePayroll}>Generate</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-8" 
                  placeholder="Search staff..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Basic Pay</TableHead>
                    <TableHead>HRA</TableHead>
                    <TableHead>Allowances</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Salary</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{record.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{record.name}</div>
                            <div className="text-xs text-muted-foreground">{record.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${record.basic}</TableCell>
                      <TableCell>${record.hra}</TableCell>
                      <TableCell>${record.allowances}</TableCell>
                      <TableCell>${record.deductions}</TableCell>
                      <TableCell className="font-medium">${record.net}</TableCell>
                      <TableCell>
                        <Badge variant={record.status === "Paid" ? "success" : "outline"}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleDownloadPayslip(record.id)}>
                            <Download className="h-3 w-3 mr-1" /> Payslip
                          </Button>
                          <Button variant="outline" size="sm">
                            <FileText className="h-3 w-3 mr-1" /> Details
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="structure" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Salary Structure</CardTitle>
              <Button>
                <Settings className="h-4 w-4 mr-2" /> Configure Salary Components
              </Button>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="teaching">
                <TabsList className="mb-4">
                  <TabsTrigger value="teaching">Teaching Staff</TabsTrigger>
                  <TabsTrigger value="admin">Administrative Staff</TabsTrigger>
                  <TabsTrigger value="support">Support Staff</TabsTrigger>
                </TabsList>
                
                <TabsContent value="teaching">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Designation</TableHead>
                        <TableHead>Base Salary</TableHead>
                        <TableHead>HRA (%)</TableHead>
                        <TableHead>DA (%)</TableHead>
                        <TableHead>Special Allowance</TableHead>
                        <TableHead>PF Contribution (%)</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Principal</TableCell>
                        <TableCell>$7,000</TableCell>
                        <TableCell>40%</TableCell>
                        <TableCell>20%</TableCell>
                        <TableCell>$1,000</TableCell>
                        <TableCell>12%</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Senior Teacher</TableCell>
                        <TableCell>$5,000</TableCell>
                        <TableCell>40%</TableCell>
                        <TableCell>15%</TableCell>
                        <TableCell>$800</TableCell>
                        <TableCell>12%</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Teacher</TableCell>
                        <TableCell>$4,000</TableCell>
                        <TableCell>40%</TableCell>
                        <TableCell>15%</TableCell>
                        <TableCell>$600</TableCell>
                        <TableCell>12%</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Edit</Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TabsContent>
                
                <TabsContent value="admin">
                  <p className="text-center text-muted-foreground py-10">Select Administrative Staff template to view salary structure</p>
                </TabsContent>
                
                <TabsContent value="support">
                  <p className="text-center text-muted-foreground py-10">Select Support Staff template to view salary structure</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Monthly Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Total salary disbursement reports per month</p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Department Wise</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Breakdown of salary by department and role</p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Annual Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Yearly salary disbursement and tax reports</p>
                    <Button variant="outline" size="sm" className="mt-4 w-full">
                      <Download className="h-4 w-4 mr-2" /> Export Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PayrollManagement;
