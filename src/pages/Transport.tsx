
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bus, 
  MapPin, 
  Users, 
  Settings, 
  Plus,
  Car,
  Route,
  DollarSign,
  Wrench,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasRole } from '@/utils/roleUtils';
import VehicleManagement from '@/components/transport/VehicleManagement';
import RouteManagement from '@/components/transport/RouteManagement';
import DriverManagement from '@/components/transport/DriverManagement';
import StudentTransportAssignments from '@/components/transport/StudentTransportAssignments';
import VehicleAssignments from '@/components/transport/VehicleAssignments';
import TransportFeeStructure from '@/components/transport/TransportFeeStructure';

const Transport = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('vehicles');

  if (!hasRole(profile, 'school_admin')) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            You don't have permission to access this module.
          </p>
        </div>
      </div>
    );
  }

  const transportStats = [
    {
      title: 'Total Vehicles',
      value: '12',
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Routes',
      value: '8',
      icon: Route,
      color: 'bg-green-500',
    },
    {
      title: 'Registered Drivers',
      value: '15',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Students Using Transport',
      value: '450',
      icon: Bus,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transport Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage school transportation system, routes, and assignments
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {transportStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active in current academic year
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Car className="h-4 w-4" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="routes" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Routes
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Drivers
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Bus className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="fees" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Fees
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vehicles" className="space-y-4">
          <VehicleManagement />
        </TabsContent>

        <TabsContent value="routes" className="space-y-4">
          <RouteManagement />
        </TabsContent>

        <TabsContent value="drivers" className="space-y-4">
          <DriverManagement />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <VehicleAssignments />
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <StudentTransportAssignments />
        </TabsContent>

        <TabsContent value="fees" className="space-y-4">
          <TransportFeeStructure />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Transport;
