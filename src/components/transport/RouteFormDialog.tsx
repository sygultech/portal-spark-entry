
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useCreateTransportRoute } from '@/hooks/useTransport';
import { TransportRoute } from '@/types/transport';

interface RouteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route?: TransportRoute | null;
  onSuccess: () => void;
}

const RouteFormDialog: React.FC<RouteFormDialogProps> = ({
  open,
  onOpenChange,
  route,
  onSuccess,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: route || {
      route_name: '',
      route_code: '',
      starting_point: '',
      ending_point: '',
      trip_type: 'round_trip',
      distance_km: '',
      estimated_duration_minutes: '',
      morning_start_time: '',
      evening_start_time: '',
      status: 'active',
    },
  });

  const createRoute = useCreateTransportRoute();

  const onSubmit = async (data: any) => {
    try {
      await createRoute.mutateAsync({
        ...data,
        distance_km: data.distance_km ? parseFloat(data.distance_km) : null,
        estimated_duration_minutes: data.estimated_duration_minutes ? parseInt(data.estimated_duration_minutes) : null,
      });
      onSuccess();
    } catch (error) {
      console.error('Error saving route:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{route ? 'Edit Route' : 'Add New Route'}</DialogTitle>
          <DialogDescription>
            {route ? 'Update route information' : 'Create a new transport route'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="route_name">Route Name *</Label>
              <Input
                id="route_name"
                {...register('route_name', { required: 'Route name is required' })}
                placeholder="School to City Center"
              />
              {errors.route_name && (
                <p className="text-sm text-red-600">{errors.route_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="route_code">Route Code</Label>
              <Input
                id="route_code"
                {...register('route_code')}
                placeholder="RT-001"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="starting_point">Starting Point *</Label>
            <Input
              id="starting_point"
              {...register('starting_point', { required: 'Starting point is required' })}
              placeholder="School Main Gate"
            />
            {errors.starting_point && (
              <p className="text-sm text-red-600">{errors.starting_point.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="ending_point">Ending Point *</Label>
            <Input
              id="ending_point"
              {...register('ending_point', { required: 'Ending point is required' })}
              placeholder="City Center Bus Stand"
            />
            {errors.ending_point && (
              <p className="text-sm text-red-600">{errors.ending_point.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="trip_type">Trip Type *</Label>
              <Select
                value={watch('trip_type')}
                onValueChange={(value) => setValue('trip_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trip type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_trip">Round Trip</SelectItem>
                  <SelectItem value="one_way">One Way</SelectItem>
                  <SelectItem value="morning_only">Morning Only</SelectItem>
                  <SelectItem value="evening_only">Evening Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="distance_km">Distance (km)</Label>
              <Input
                id="distance_km"
                type="number"
                step="0.1"
                {...register('distance_km')}
                placeholder="25.5"
              />
            </div>

            <div>
              <Label htmlFor="estimated_duration_minutes">Duration (minutes)</Label>
              <Input
                id="estimated_duration_minutes"
                type="number"
                {...register('estimated_duration_minutes')}
                placeholder="45"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="morning_start_time">Morning Start Time</Label>
              <Input
                id="morning_start_time"
                type="time"
                {...register('morning_start_time')}
              />
            </div>

            <div>
              <Label htmlFor="evening_start_time">Evening Start Time</Label>
              <Input
                id="evening_start_time"
                type="time"
                {...register('evening_start_time')}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createRoute.isPending}
            >
              {route ? 'Update Route' : 'Add Route'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RouteFormDialog;
