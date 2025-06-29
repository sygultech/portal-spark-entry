
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useStudentTransportAssignments } from '@/hooks/useTransport';
import { Users, MapPin, Route, Plus } from 'lucide-react';

const StudentTransportAssignments = () => {
  const { data: assignments = [], isLoading, error } = useStudentTransportAssignments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading student assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading assignments: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Student Transport Assignments</h2>
          <p className="text-muted-foreground">Manage student transport assignments and stops</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Assign Students
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment: any) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {assignment.student_details?.first_name} {assignment.student_details?.last_name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={assignment.opt_in_status ? 'default' : 'secondary'}>
                    {assignment.opt_in_status ? 'Opted In' : 'Opted Out'}
                  </Badge>
                  <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                    {assignment.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                Admission: {assignment.student_details?.admission_number}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.transport_routes?.route_name}</div>
                    <div className="text-sm text-muted-foreground">Route</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.transport_stops?.stop_name}</div>
                    <div className="text-sm text-muted-foreground">Stop</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium">₹{assignment.transport_fee}</div>
                  <div className="text-sm text-muted-foreground">Monthly Fee</div>
                </div>

                <div>
                  <div className="font-medium">{new Date(assignment.assignment_date).toLocaleDateString()}</div>
                  <div className="text-sm text-muted-foreground">Assigned Date</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No student assignments found</h3>
          <p className="text-muted-foreground mb-4">
            Start by assigning students to transport routes and stops.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Assign Students
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentTransportAssignments;
