
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Search } from "lucide-react";

const ResignationExit = () => {
  const [activeTab, setActiveTab] = useState("resignations");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  // Mock resignation data
  const resignations = [
    { 
      id: 1, 
      staffName: "John Doe", 
      department: "Mathematics", 
      designation: "Teacher", 
      resignationDate: "2023-07-15", 
      lastWorkingDay: "2023-09-15", 
      status: "Approved", 
      reason: "Pursuing higher education" 
    },
    { 
      id: 2, 
      staffName: "Jane Smith", 
      department: "Science", 
      designation: "Senior Teacher", 
      resignationDate: "2023-08-01", 
      lastWorkingDay: "2023-10-01", 
      status: "Pending", 
      reason: "Relocating to different city" 
    }
  ];

  const handleResignation = () => {
    toast({
      title: "Resignation submitted",
      description: "The resignation has been successfully submitted",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="resignations">Resignations</TabsTrigger>
          <TabsTrigger value="interviews">Exit Interviews</TabsTrigger>
          <TabsTrigger value="checklists">Exit Checklists</TabsTrigger>
        </TabsList>
        
        <TabsContent value="resignations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>Resignation Management</CardTitle>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Submit Resignation</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Resignation</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="resignationDate">Resignation Date</Label>
                        <Input id="resignationDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastWorkingDate">Last Working Day</Label>
                        <Input id="lastWorkingDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Resignation</Label>
                        <Textarea id="reason" placeholder="Please provide reason for resignation" />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleResignation}>Submit</Button>
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
                  placeholder="Search resignations..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Staff</TableHead>
                    <TableHead>Resignation Date</TableHead>
                    <TableHead>Last Working Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resignations.map((resignation) => (
                    <TableRow key={resignation.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {resignation.staffName.split(' ').map(name => name[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{resignation.staffName}</div>
                            <div className="text-xs text-muted-foreground">{resignation.department}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{resignation.resignationDate}</TableCell>
                      <TableCell>{resignation.lastWorkingDay}</TableCell>
                      <TableCell>
                        <Badge variant={resignation.status === "Approved" ? "default" : "outline"}>
                          {resignation.status === "Approved" ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {resignation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="interviews">
          <Card>
            <CardHeader>
              <CardTitle>Exit Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No exit interviews found</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle>Exit Checklists</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">No exit checklists found</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ResignationExit;
