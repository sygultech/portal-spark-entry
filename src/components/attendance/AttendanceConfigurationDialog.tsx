import React, { useState, useEffect } from 'react';
import { AttendanceConfiguration, AttendanceMode } from '@/types/attendance';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, Bell, CheckCircle } from 'lucide-react';

interface AttendanceConfigurationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  configuration?: AttendanceConfiguration | null;
  batchId: string;
  schoolId: string;
  onSubmit: (data: Partial<AttendanceConfiguration>) => void;
  isLoading: boolean;
}

const AttendanceConfigurationDialog: React.FC<AttendanceConfigurationDialogProps> = ({
  isOpen,
  onClose,
  configuration,
  batchId,
  schoolId,
  onSubmit,
  isLoading
}) => {
  const [formData, setFormData] = useState({
    batch_id: batchId,
    school_id: schoolId,
    academic_year_id: configuration?.academic_year_id ?? '',
    attendance_mode: configuration?.attendance_mode ?? 'daily' as AttendanceMode,
    auto_absent_enabled: configuration?.auto_absent_enabled ?? false,
    auto_absent_time: configuration?.auto_absent_time ?? '16:00:00',
    notification_enabled: configuration?.notification_enabled ?? true,
    is_active: configuration?.is_active ?? true,
  });

  useEffect(() => {
    if (configuration) {
      setFormData({
        batch_id: configuration.batch_id,
        school_id: configuration.school_id,
        academic_year_id: configuration.academic_year_id,
        attendance_mode: configuration.attendance_mode,
        auto_absent_enabled: configuration.auto_absent_enabled,
        auto_absent_time: configuration.auto_absent_time ?? '16:00:00',
        notification_enabled: configuration.notification_enabled,
        is_active: configuration.is_active,
      });
    } else {
      setFormData({
        batch_id: batchId,
        school_id: schoolId,
        academic_year_id: '',
        attendance_mode: 'daily',
        auto_absent_enabled: false,
        auto_absent_time: '16:00:00',
        notification_enabled: true,
        is_active: true,
      });
    }
  }, [configuration, batchId, schoolId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const getModeDescription = (mode: AttendanceMode): string => {
    switch (mode) {
      case 'daily':
        return 'Record one attendance status per student per day. Simple and straightforward for basic attendance tracking.';
      case 'period':
        return 'Track attendance for each period/subject throughout the day. Requires timetable configuration.';
      case 'session':
        return 'Split the day into Morning (AM) and Afternoon (PM) sessions. Good for half-day programs.';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {configuration ? 'Edit Attendance Configuration' : 'Create Attendance Configuration'}
          </DialogTitle>
          <DialogDescription>
            Configure how attendance will be tracked for this batch. Choose the mode that best fits your requirements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Attendance Mode Selection */}
          <div className="space-y-4">
            <Label htmlFor="attendance_mode" className="text-base font-semibold">
              Attendance Mode
            </Label>
            
            <Select 
              value={formData.attendance_mode} 
              onValueChange={(value: AttendanceMode) => 
                setFormData(prev => ({ ...prev, attendance_mode: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select attendance mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Attendance</SelectItem>
                <SelectItem value="period">Period-wise Attendance</SelectItem>
                <SelectItem value="session">Session-based (AM/PM)</SelectItem>
              </SelectContent>
            </Select>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      {getModeDescription(formData.attendance_mode)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-Absent Feature */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Auto-Absent Feature
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically mark students as absent after a specified time
                </p>
              </div>
              <Switch
                checked={formData.auto_absent_enabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, auto_absent_enabled: checked }))
                }
              />
            </div>

            {formData.auto_absent_enabled && (
              <div className="ml-6 space-y-2">
                <Label htmlFor="auto_absent_time">Auto-Absent Time</Label>
                <Input
                  id="auto_absent_time"
                  type="time"
                  value={formData.auto_absent_time}
                  onChange={(e) =>
                    setFormData(prev => ({ ...prev, auto_absent_time: e.target.value }))
                  }
                  className="w-32"
                />
                <p className="text-xs text-muted-foreground">
                  Students will be automatically marked absent after this time if not marked present
                </p>
              </div>
            )}
          </div>

          {/* Notification Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Send notifications for attendance-related events
                </p>
              </div>
              <Switch
                checked={formData.notification_enabled}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, notification_enabled: checked }))
                }
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Active Configuration
                </Label>
                <p className="text-sm text-muted-foreground">
                  Enable this attendance configuration for the batch
                </p>
              </div>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData(prev => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : configuration ? 'Update Configuration' : 'Create Configuration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttendanceConfigurationDialog;
