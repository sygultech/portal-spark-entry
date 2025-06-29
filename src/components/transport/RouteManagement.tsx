
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Route, MapPin, Clock } from 'lucide-react';
import { useTransportRoutes } from '@/hooks/useTransport';
import RouteFormDialog from './RouteFormDialog';

const RouteManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [routeDialogOpen, setRouteDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);

  const { data: routes = [], isLoading, error } = useTransportRoutes();

  const filteredRoutes = routes.filter(route =>
    route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.route_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.starting_point.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.ending_point.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTripTypeColor = (type: string) => {
    switch (type) {
      case 'round_trip': return 'bg-blue-100 text-blue-800';
      case 'one_way': return 'bg-purple-100 text-purple-800';
      case 'morning_only': return 'bg-yellow-100 text-yellow-800';
      case 'evening_only': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading routes: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Route Management</h2>
          <p className="text-muted-foreground">Manage transport routes and stops</p>
        </div>
        <Button onClick={() => setRouteDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Route
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search routes by name, code, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredRoutes.map((route) => (
          <Card key={route.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Route className="h-5 w-5" />
                  <CardTitle className="text-lg">{route.route_name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(route.status)}>
                    {route.status}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {route.route_code && `${route.route_code} • `}
                <Badge className={getTripTypeColor(route.trip_type)} variant="outline">
                  {route.trip_type.replace('_', ' ')}
                </Badge>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <div className="font-medium">From: {route.starting_point}</div>
                    <div className="text-muted-foreground">To: {route.ending_point}</div>
                  </div>
                </div>

                {route.distance_km && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance:</span>
                    <span className="font-medium">{route.distance_km} km</span>
                  </div>
                )}

                {route.estimated_duration_minutes && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{route.estimated_duration_minutes} min</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-sm">
                  {route.morning_start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Morning: {route.morning_start_time}</span>
                    </div>
                  )}
                  {route.evening_start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Evening: {route.evening_start_time}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedRoute(route);
                      setRouteDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-3 w-3 mr-1" />
                    Stops
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoutes.length === 0 && (
        <div className="text-center py-8">
          <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No routes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No routes match your search criteria.' : 'Get started by adding your first route.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setRouteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Route
            </Button>
          )}
        </div>
      )}

      <RouteFormDialog
        open={routeDialogOpen}
        onOpenChange={setRouteDialogOpen}
        route={selectedRoute}
        onSuccess={() => {
          setRouteDialogOpen(false);
          setSelectedRoute(null);
        }}
      />
    </div>
  );
};

export default RouteManagement;
