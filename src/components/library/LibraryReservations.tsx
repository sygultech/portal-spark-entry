
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useBookReservations, useLibraryMutations } from '@/hooks/useLibrary';

const LibraryReservations = () => {
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data: reservations, isLoading, error } = useBookReservations(statusFilter);
  const { updateReservationStatus } = useLibraryMutations();

  console.log('LibraryReservations - Reservations data:', reservations);
  console.log('LibraryReservations - Loading:', isLoading);
  console.log('LibraryReservations - Error:', error);

  const handleStatusUpdate = async (reservationId: string, newStatus: string) => {
    try {
      await updateReservationStatus.mutateAsync({
        reservationId,
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'available': return 'secondary';
      case 'fulfilled': return 'default';
      case 'expired': return 'destructive';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading reservations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading reservations</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Book Reservations</h2>
          <p className="text-muted-foreground">Manage book reservations</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="available">Available</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid gap-4">
        {reservations?.map((reservation) => (
          <Card key={reservation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {reservation.book_title || 'Unknown Book'}
                  </CardTitle>
                  <CardDescription>
                    Reserved by: {reservation.member_name || 'Unknown Member'}
                  </CardDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(reservation.status)}>
                  {reservation.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Reserved: {reservation.reservation_date}</span>
                  </div>
                  {reservation.available_date && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      <span>Available: {reservation.available_date}</span>
                    </div>
                  )}
                  {reservation.expiry_date && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Expires: {reservation.expiry_date}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {reservation.status === 'pending' && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'available')}
                      >
                        Mark Available
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                  {reservation.status === 'available' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleStatusUpdate(reservation.id, 'fulfilled')}
                    >
                      Mark Fulfilled
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reservations?.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No reservations found
        </div>
      </div>
    </div>
  );
};

export default LibraryReservations;
