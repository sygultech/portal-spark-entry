
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBookReservations, useLibraryMutations } from '@/hooks/useLibrary';
import { format } from 'date-fns';

const LibraryReservations = () => {
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: reservations = [], isLoading } = useBookReservations(statusFilter || undefined);
  const { updateReservationStatus } = useLibraryMutations();

  const handleStatusUpdate = async (reservationId: string, status: string) => {
    try {
      // This would need to be implemented in the service
      console.log('Update reservation status:', reservationId, status);
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'available':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>;
      case 'fulfilled':
        return <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case 'expired':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getReservationStats = () => {
    return {
      total: reservations.length,
      pending: reservations.filter(r => r.status === 'pending').length,
      available: reservations.filter(r => r.status === 'available').length,
      fulfilled: reservations.filter(r => r.status === 'fulfilled').length,
      expired: reservations.filter(r => r.status === 'expired').length
    };
  };

  const stats = getReservationStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Book Reservations</h2>
          <p className="text-muted-foreground">Manage book reservations and waiting lists</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.available}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.fulfilled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Reservations</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reservations found</h3>
                <p className="text-muted-foreground">
                  Book reservations will appear here when members reserve unavailable books
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reservations.map(reservation => (
                <Card key={reservation.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{reservation.book_title}</h3>
                          {getStatusBadge(reservation.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Reserved by: {reservation.member_name}
                        </p>
                        <div className="flex items-center space-x-4 text-sm">
                          <span>Reserved: {format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}</span>
                          {reservation.available_date && (
                            <span>Available: {format(new Date(reservation.available_date), 'MMM dd, yyyy')}</span>
                          )}
                          {reservation.expiry_date && (
                            <span>Expires: {format(new Date(reservation.expiry_date), 'MMM dd, yyyy')}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {reservation.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(reservation.id, 'available')}
                          >
                            Mark Available
                          </Button>
                        )}
                        {reservation.status === 'available' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, 'fulfilled')}
                            >
                              Mark Fulfilled
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(reservation.id, 'expired')}
                            >
                              Mark Expired
                            </Button>
                          </>
                        )}
                        {(reservation.status === 'pending' || reservation.status === 'available') && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {reservations.filter(r => r.status === 'pending').map(reservation => (
              <Card key={reservation.id} className="border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{reservation.book_title}</h3>
                        <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reserved by: {reservation.member_name}
                      </p>
                      <p className="text-sm">
                        Reserved on: {format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'available')}
                      >
                        Mark Available
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="available">
          <div className="grid gap-4">
            {reservations.filter(r => r.status === 'available').map(reservation => (
              <Card key={reservation.id} className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{reservation.book_title}</h3>
                        <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Available</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reserved by: {reservation.member_name}
                      </p>
                      <div className="text-sm">
                        <span>Available since: {reservation.available_date && format(new Date(reservation.available_date), 'MMM dd, yyyy')}</span>
                        {reservation.expiry_date && (
                          <span className="ml-4 text-red-600">
                            Expires: {format(new Date(reservation.expiry_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'fulfilled')}
                      >
                        Mark Fulfilled
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'expired')}
                      >
                        Mark Expired
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expired">
          <div className="grid gap-4">
            {reservations.filter(r => r.status === 'expired').map(reservation => (
              <Card key={reservation.id} className="border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{reservation.book_title}</h3>
                        <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reserved by: {reservation.member_name}
                      </p>
                      <div className="text-sm">
                        <span>Reserved: {format(new Date(reservation.reservation_date), 'MMM dd, yyyy')}</span>
                        {reservation.expiry_date && (
                          <span className="ml-4">
                            Expired: {format(new Date(reservation.expiry_date), 'MMM dd, yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryReservations;
