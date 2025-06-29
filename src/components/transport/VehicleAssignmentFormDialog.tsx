import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm, Controller } from 'react-hook-form';
import { useVehicles, useTransportRoutes, useTransportDrivers } from '@/hooks/useTransport';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VehicleAssignmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface AssignmentFormData {
  vehicle_id: string;
  route_id: string;
  driver_id: string;
  attendant_id?: string;
  start_date: string;
  end_date?: string;
}

const VehicleAssignmentFormDialog: React.FC<VehicleAssignmentFormDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const { data: vehicles = [] } = useVehicles();
  const { data: routes = [] } = useTransportRoutes();
  const { data: drivers = [] } = useTransportDrivers();

  const { control, handleSubmit, formState: { errors }, reset, formState: { isSubmitting } } = useForm<AssignmentFormData>({
    defaultValues: {
      vehicle_id: '',
      route_id: '',
      driver_id: '',
      attendant_id: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
    },
  });

  const onSubmit = async (data: AssignmentFormData) => {
    try {
      const assignmentData = {
        ...data,
        school_id: profile?.school_id,
        attendant_id: data.attendant_id && data.attendant_id.trim() !== '' ? data.attendant_id : null,
        end_date: data.end_date && data.end_date.trim() !== '' ? data.end_date : null,
        is_active: true,
      };

      const { error } = await supabase
        .from('vehicle_route_assignments')
        .insert(assignmentData);

      if (error) throw error;

      toast.success('Vehicle assignment created successfully');
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Vehicle Assignment</DialogTitle>
          <DialogDescription>
            Assign a vehicle and driver to a specific route
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vehicle_id">Vehicle *</Label>
            <Controller
              name="vehicle_id"
              control={control}
              rules={{ required: 'Please select a vehicle' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.vehicle_number} - {vehicle.registration_number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.vehicle_id && (
              <span className="text-sm text-destructive">{errors.vehicle_id.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="route_id">Route *</Label>
            <Controller
              name="route_id"
              control={control}
              rules={{ required: 'Please select a route' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.route_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.route_id && (
              <span className="text-sm text-destructive">{errors.route_id.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="driver_id">Driver *</Label>
            <Controller
              name="driver_id"
              control={control}
              rules={{ required: 'Please select a driver' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.driver_id && (
              <span className="text-sm text-destructive">{errors.driver_id.message}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendant_id">Attendant (Optional)</Label>
            <Controller
              name="attendant_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an attendant (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.driver_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Controller
                name="start_date"
                control={control}
                rules={{ required: 'Start date is required' }}
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                  />
                )}
              />
              {errors.start_date && (
                <span className="text-sm text-destructive">{errors.start_date.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date (Optional)</Label>
              <Controller
                name="end_date"
                control={control}
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleAssignmentFormDialog;
