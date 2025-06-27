
import React, { useState, useEffect } from "react";
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
import { Plus, Search, Users, Loader2 } from "lucide-react";
import { FeeAssignment as FeeAssignmentType } from "@/types/finance";
import FeeAssignmentWizard from "./FeeAssignmentWizard";
import { feeAssignmentService, AssignmentResult } from "@/services/feeAssignmentService";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

const FeeAssignment = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await feeAssignmentService.getFeeAssignments();
      setAssignments(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load assignments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment =>
    assignment.feeStructureName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateAssignment = (result: AssignmentResult) => {
    // Reload assignments after successful creation
    loadAssignments();
    setIsWizardOpen(false);
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
                  {loading ? (
                    <>
                      <Skeleton className="h-6 w-8 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">{assignments.length}</p>
                      <p className="text-xs text-muted-foreground">Total Assignments</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  {loading ? (
                    <>
                      <Skeleton className="h-6 w-8 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">
                        {assignments.filter(a => a.assignmentType === 'batch').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Batch Assignments</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  {loading ? (
                    <>
                      <Skeleton className="h-6 w-8 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </>
                  ) : (
                    <>
                      <p className="text-2xl font-bold">
                        {assignments.filter(a => a.assignmentType === 'individual').length}
                      </p>
                      <p className="text-xs text-muted-foreground">Individual Assignments</p>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Structure Name</TableHead>
                <TableHead>Assignment Type</TableHead>
                <TableHead>Students Count</TableHead>
                <TableHead>Assigned Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Assigned By</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssignments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p className="text-muted-foreground">No fee assignments found.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create your first assignment using the wizard above.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.feeStructureName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {assignment.assignmentType === 'batch' ? 'Batch' : 'Individual'}
                      </Badge>
                    </TableCell>
                    <TableCell>{assignment.studentsCount} students</TableCell>
                    <TableCell>{new Date(assignment.assignmentDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{assignment.totalAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {assignment.assignedByName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {assignment.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeAssignment;
