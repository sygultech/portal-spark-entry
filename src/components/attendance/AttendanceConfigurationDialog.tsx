
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useBatches } from '@/hooks/useBatches';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { AttendanceConfiguration } from '@/types/attendance';

interface AttendanceConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  configuration?: AttendanceConfiguration;
}

const AttendanceConfigurationDialog = ({ 
  isOpen, 
  onClose, 
  configuration 
}: AttendanceConfigurationDialogProps) => {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const queryClient = useQueryClient();
  const { batches } = useBatches();
  const { academicYears } = useAcademicYears();

  const [formData, setFormData] = useState({
    batch_id: configuration?.batch_id || '',
    academic_year_id: configuration?.academic_year_id || '',
    attendance_mode: configuration?.attendance_mode || 'daily',
    auto_absent_enabled: configuration?.auto_absent_enabled || false,
    auto_absent_time: configuration?.auto_absent_time || '16:00:00',
    notification_enabled: configuration?.notification_enabled || true,
    is_active: configuration?.is_active !== undefined ? configuration.is_active : true
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (configuration) {
        // Update existing configuration
        const { error } = await supabase
          .from('attendance_configurations')
          .update(data)
          .eq('id', configuration.id);
        
        if (error) throw error;
      } else {
        // Create new configuration
        const { error } = await supabase
          .from('attendance_configurations')
          .insert({
            ...data,
            school_id: schoolId
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-configurations'] });
      toast({
        title: 'Success',
        description: `Configuration ${configuration ? 'updated' : 'created'} successfully`
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save configuration',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {configuration ? 'Edit' : 'Create'} Attendance Configuration
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="batch_id">Batch</Label>
            <Select
              value={formData.batch_id}
              onValueChange={(value) => setFormData({ ...formData, batch_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="academic_year_id">Academic Year</Label>
            <Select
              value={formData.academic_year_id}
              onValueChange={(value) => setFormData({ ...formData, academic_year_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendance_mode">Attendance Mode</Label>
            <Select
              value={formData.attendance_mode}
              onValueChange={(value) => setFormData({ ...formData, attendance_mode: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="period_wise">Period-wise</SelectItem>
                <SelectItem value="session_based">Session-based</SelectItem>
                <SelectItem value="event_based">Event-based</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="auto_absent_enabled"
              checked={formData.auto_absent_enabled === true ? true : undefined}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, auto_absent_enabled: checked || false })
              }
            />
            <Label htmlFor="auto_absent_enabled">Enable Auto Absent</Label>
          </div>

          {formData.auto_absent_enabled && (
            <div className="space-y-2">
              <Label htmlFor="auto_absent_time">Auto Absent Time</Label>
              <Input
                id="auto_absent_time"
                type="time"
                value={formData.auto_absent_time}
                onChange={(e) => setFormData({ ...formData, auto_absent_time: e.target.value })}
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="notification_enabled"
              checked={formData.notification_enabled === true ? true : undefined}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, notification_enabled: checked || false })
              }
            />
            <Label htmlFor="notification_enabled">Enable Notifications</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active === true ? true : undefined}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, is_active: checked || false })
              }
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceConfigurationDialog;
