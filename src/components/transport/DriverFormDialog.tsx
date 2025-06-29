
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { useCreateTransportDriver } from '@/hooks/useTransport';
import { TransportDriver } from '@/types/transport';

interface DriverFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  driver?: TransportDriver | null;
  onSuccess: () => void;
}

const DriverFormDialog: React.FC<DriverFormDialogProps> = ({
  open,
  onOpenChange,
  driver,
  onSuccess,
}) => {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: driver || {
      driver_name: '',
      phone: '',
      email: '',
      license_number: '',
      license_expiry: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      address: '',
      date_of_birth: '',
      blood_group: '',
      joining_date: new Date().toISOString().split('T')[0],
      status: 'active',
      verification_status: false,
    },
  });

  const createDriver = useCreateTransportDriver();

  const onSubmit = async (data: any) => {
    try {
      await createDriver.mutateAsync(data);
      onSuccess();
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver ? 'Update driver information' : 'Add a new driver to your transport team'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="driver_name">Driver Name *</Label>
              <Input
                id="driver_name"
                {...register('driver_name', { required: 'Driver name is required' })}
                placeholder="John Doe"
              />
              {errors.driver_name && (
                <p className="text-sm text-red-600">{errors.driver_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+91 9876543210"
              />
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="john.doe@example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="license_number">License Number *</Label>
              <Input
                id="license_number"
                {...register('license_number', { required: 'License number is required' })}
                placeholder="DL-01-20230001234"
              />
              {errors.license_number && (
                <p className="text-sm text-red-600">{errors.license_number.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="license_expiry">License Expiry *</Label>
              <Input
                id="license_expiry"
                type="date"
                {...register('license_expiry', { required: 'License expiry is required' })}
              />
              {errors.license_expiry && (
                <p className="text-sm text-red-600">{errors.license_expiry.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                {...register('emergency_contact_name')}
                placeholder="Jane Doe"
              />
            </div>

            <div>
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                {...register('emergency_contact_phone')}
                placeholder="+91 9876543211"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register('address')}
              placeholder="Complete address..."
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                {...register('date_of_birth')}
              />
            </div>

            <div>
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select
                value={watch('blood_group')}
                onValueChange={(value) => setValue('blood_group', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="joining_date">Joining Date</Label>
              <Input
                id="joining_date"
                type="date"
                {...register('joining_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <SelectItem value="on_leave">On Leave</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2 pt-6">
              <Checkbox
                id="verification_status"
                checked={watch('verification_status')}
                onCheckedChange={(checked) => setValue('verification_status', checked)}
              />
              <Label htmlFor="verification_status">Verified Driver</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createDriver.isPending}
            >
              {driver ? 'Update Driver' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DriverFormDialog;
