
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Users } from "lucide-react";
import { FeeAssignment as FeeAssignmentType } from "@/types/finance";
import FeeAssignmentWizard from "./FeeAssignmentWizard";

const FeeAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Mock data
  const [assignments, setAssignments] = useState<FeeAssignmentType[]>([
    {
      id: "1",
      structureId: "1",
      structureName: "Grade 1-5 Fee Structure",
      assignmentType: "batch",
      batchId: "batch1",
      batchName: "Grade 1A",
      assignedDate: "2024-03-15",
      totalAmount: 18500,
      paidAmount: 15000,
      balance: 3500
    },
    {
      id: "2",
      structureId: "1",
      structureName: "Grade 1-5 Fee Structure",
      assignmentType: "batch",
      batchId: "batch2",
      batchName: "Grade 2B",
      assignedDate: "2024-03-15",
      totalAmount: 18500,
      paidAmount: 18500,
      balance: 0
    },
    {
      id: "3",
      structureId: "2",
      structureName: "Grade 6-10 Fee Structure",
      assignmentType: "student",
      studentIds: ["student1", "student2", "student3"],
      assignedDate: "2024-03-20",
      totalAmount: 76500, // 3 students × 25500
      paidAmount: 51000,
      balance: 25500
    }
  ]);

  const filteredAssignments = assignments.filter(assignment =>
    assignment.structureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.batchName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAssignment = (newAssignment: Omit<FeeAssignmentType, 'id'>) => {
    const assignment: FeeAssignmentType = {
      ...newAssignment,
      id: Date.now().toString()
    };
    setAssignments([...assignments, assignment]);
    setIsWizardOpen(false);
  };

  const getStatusBadge = (paidAmount: number, totalAmount: number) => {
    const percentage = (paidAmount / totalAmount) * 100;
    if (percentage === 100) {
      return <Badge variant="success">Fully Paid</Badge>;
    } else if (percentage > 0) {
      return <Badge variant="secondary">Partially Paid</Badge>;
    } else {
      return <Badge variant="destructive">Unpaid</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Assignment</CardTitle>
            <p className="text-sm text-muted-foreground">
              Assign fee structures to batches or individual students
            </p>
          </div>
          <Dialog open={isWizardOpen} onOpenChange={setIsWizardOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Assign Fee Structure</DialogTitle>
              </DialogHeader>
              <FeeAssignmentWizard
                onSubmit={handleCreateAssignment}
                onCancel={() => setIsWizardOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Assignment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                  <p className="text-xs text-muted-foreground">Total Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.assignmentType === 'batch').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Batch Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => a.assignmentType === 'student').length}
                  </p>
                  <p className="text-xs text-muted-foreground">Student Assignments</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Structure Name</TableHead>
              <TableHead>Assignment Type</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.structureName}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {assignment.assignmentType === 'batch' ? 'Batch' : 'Individual'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {assignment.assignmentType === 'batch' 
                    ? assignment.batchName 
                    : `${assignment.studentIds?.length} students`
                  }
                </TableCell>
                <TableCell>{new Date(assignment.assignedDate).toLocaleDateString()}</TableCell>
                <TableCell>₹{assignment.totalAmount.toLocaleString()}</TableCell>
                <TableCell>₹{assignment.paidAmount.toLocaleString()}</TableCell>
                <TableCell>₹{assignment.balance.toLocaleString()}</TableCell>
                <TableCell>
                  {getStatusBadge(assignment.paidAmount, assignment.totalAmount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FeeAssignment;
