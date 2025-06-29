
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Phone, Mail, Calendar, AlertTriangle } from 'lucide-react';
import { useTransportDrivers } from '@/hooks/useTransport';
import DriverFormDialog from './DriverFormDialog';

const DriverManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [driverDialogOpen, setDriverDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const { data: drivers = [], isLoading, error } = useTransportDrivers();

  const filteredDrivers = drivers.filter(driver =>
    driver.driver_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLicenseExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysDiff <= 30;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading drivers: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Driver Management</h2>
          <p className="text-muted-foreground">Manage transport drivers and their information</p>
        </div>
        <Button onClick={() => setDriverDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search drivers by name, phone, or license number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Drivers Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredDrivers.map((driver) => (
          <Card key={driver.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{driver.driver_name}</CardTitle>
                <div className="flex items-center gap-2">
                  {isLicenseExpiringSoon(driver.license_expiry) && (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <Badge className={getStatusColor(driver.status)}>
                    {driver.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                License: {driver.license_number}
                {!driver.verification_status && (
                  <Badge variant="outline" className="ml-2 text-orange-600">
                    Unverified
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.phone}</span>
                </div>

                {driver.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{driver.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>License expires: {new Date(driver.license_expiry).toLocaleDateString()}</span>
                </div>

                {driver.joining_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="font-medium">{new Date(driver.joining_date).toLocaleDateString()}</span>
                  </div>
                )}

                {driver.emergency_contact_name && (
                  <div className="text-sm">
                    <div className="text-muted-foreground">Emergency Contact:</div>
                    <div className="font-medium">{driver.emergency_contact_name}</div>
                    {driver.emergency_contact_phone && (
                      <div className="text-muted-foreground">{driver.emergency_contact_phone}</div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedDriver(driver);
                      setDriverDialogOpen(true);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDrivers.length === 0 && (
        <div className="text-center py-8">
          <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No drivers found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No drivers match your search criteria.' : 'Get started by adding your first driver.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setDriverDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          )}
        </div>
      )}

      <DriverFormDialog
        open={driverDialogOpen}
        onOpenChange={setDriverDialogOpen}
        driver={selectedDriver}
        onSuccess={() => {
          setDriverDialogOpen(false);
          setSelectedDriver(null);
        }}
      />
    </div>
  );
};

export default DriverManagement;
