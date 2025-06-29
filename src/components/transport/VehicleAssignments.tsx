
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useVehicleRouteAssignments } from '@/hooks/useTransport';
import { Car, Route, User, Plus } from 'lucide-react';

const VehicleAssignments = () => {
  const { data: assignments = [], isLoading, error } = useVehicleRouteAssignments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading assignments...</p>
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
          <h2 className="text-2xl font-bold">Vehicle Route Assignments</h2>
          <p className="text-muted-foreground">Assign vehicles and drivers to routes</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment: any) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {assignment.vehicles?.vehicle_number}
                </CardTitle>
                <Badge variant={assignment.is_active ? 'default' : 'secondary'}>
                  {assignment.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <CardDescription>
                Assignment started: {new Date(assignment.start_date).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.transport_routes?.route_name}</div>
                    <div className="text-sm text-muted-foreground">Route</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.transport_drivers?.driver_name}</div>
                    <div className="text-sm text-muted-foreground">Driver</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{assignment.vehicles?.registration_number}</div>
                    <div className="text-sm text-muted-foreground">Registration</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-8">
          <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assignments found</h3>
          <p className="text-muted-foreground mb-4">
            Start by assigning vehicles to routes with drivers.
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      )}
    </div>
  );
};

export default VehicleAssignments;
