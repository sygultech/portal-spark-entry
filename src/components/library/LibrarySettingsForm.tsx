import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Save, DollarSign, Calendar, Users, Book } from 'lucide-react';
import { useLibrarySettings, useLibraryMutations } from '@/hooks/useLibrary';
import { useForm } from 'react-hook-form';
import { LibrarySettings } from '@/types/library';

const LibrarySettingsForm = () => {
  const { data: settings, isLoading } = useLibrarySettings();
  const { updateLibrarySettings } = useLibraryMutations();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset
  } = useForm<Partial<LibrarySettings>>({
    defaultValues: settings || {
      fine_per_day: 1.00,
      grace_period_days: 0,
      max_fine_amount: 100.00,
      student_borrowing_limit: 3,
      teacher_borrowing_limit: 5,
      staff_borrowing_limit: 3,
      student_borrowing_days: 14,
      teacher_borrowing_days: 30,
      staff_borrowing_days: 21,
      max_renewals: 2,
      reservation_hold_days: 3
    }
  });

  React.useEffect(() => {
    if (settings) {
      reset(settings);
    }
  }, [settings, reset]);

  const onSubmit = async (data: Partial<LibrarySettings>) => {
    try {
      await updateLibrarySettings.mutateAsync(data);
      reset(data);
    } catch (error) {
      console.error('Error updating library settings:', error);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Library Settings</h2>
          <p className="text-muted-foreground">Configure library policies and limits</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Fine Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Fine Management
            </CardTitle>
            <CardDescription>Configure overdue fines and penalties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fine_per_day">Fine Per Day (₹) *</Label>
                <Input
                  id="fine_per_day"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('fine_per_day', { 
                    required: 'Fine per day is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Fine cannot be negative' }
                  })}
                />
                {errors.fine_per_day && (
                  <p className="text-sm text-red-500">{errors.fine_per_day.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grace_period_days">Grace Period (Days)</Label>
                <Input
                  id="grace_period_days"
                  type="number"
                  min="0"
                  {...register('grace_period_days', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Grace period cannot be negative' }
                  })}
                />
                <p className="text-xs text-muted-foreground">Days before fine starts</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="max_fine_amount">Maximum Fine (₹)</Label>
                <Input
                  id="max_fine_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('max_fine_amount', { 
                    valueAsNumber: true,
                    min: { value: 0, message: 'Maximum fine cannot be negative' }
                  })}
                />
                <p className="text-xs text-muted-foreground">Maximum fine cap per book</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrowing Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Borrowing Limits
            </CardTitle>
            <CardDescription>Set borrowing limits for different member types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_borrowing_limit">Student Limit *</Label>
                <Input
                  id="student_borrowing_limit"
                  type="number"
                  min="1"
                  max="20"
                  {...register('student_borrowing_limit', { 
                    required: 'Student borrowing limit is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 book' },
                    max: { value: 20, message: 'Maximum 20 books' }
                  })}
                />
                {errors.student_borrowing_limit && (
                  <p className="text-sm text-red-500">{errors.student_borrowing_limit.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teacher_borrowing_limit">Teacher Limit *</Label>
                <Input
                  id="teacher_borrowing_limit"
                  type="number"
                  min="1"
                  max="20"
                  {...register('teacher_borrowing_limit', { 
                    required: 'Teacher borrowing limit is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 book' },
                    max: { value: 20, message: 'Maximum 20 books' }
                  })}
                />
                {errors.teacher_borrowing_limit && (
                  <p className="text-sm text-red-500">{errors.teacher_borrowing_limit.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff_borrowing_limit">Staff Limit *</Label>
                <Input
                  id="staff_borrowing_limit"
                  type="number"
                  min="1"
                  max="20"
                  {...register('staff_borrowing_limit', { 
                    required: 'Staff borrowing limit is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 book' },
                    max: { value: 20, message: 'Maximum 20 books' }
                  })}
                />
                {errors.staff_borrowing_limit && (
                  <p className="text-sm text-red-500">{errors.staff_borrowing_limit.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borrowing Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Borrowing Duration
            </CardTitle>
            <CardDescription>Set borrowing periods for different member types</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_borrowing_days">Student Duration (Days) *</Label>
                <Input
                  id="student_borrowing_days"
                  type="number"
                  min="1"
                  max="365"
                  {...register('student_borrowing_days', { 
                    required: 'Student borrowing duration is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 365, message: 'Maximum 365 days' }
                  })}
                />
                {errors.student_borrowing_days && (
                  <p className="text-sm text-red-500">{errors.student_borrowing_days.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="teacher_borrowing_days">Teacher Duration (Days) *</Label>
                <Input
                  id="teacher_borrowing_days"
                  type="number"
                  min="1"
                  max="365"
                  {...register('teacher_borrowing_days', { 
                    required: 'Teacher borrowing duration is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 365, message: 'Maximum 365 days' }
                  })}
                />
                {errors.teacher_borrowing_days && (
                  <p className="text-sm text-red-500">{errors.teacher_borrowing_days.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="staff_borrowing_days">Staff Duration (Days) *</Label>
                <Input
                  id="staff_borrowing_days"
                  type="number"
                  min="1"
                  max="365"
                  {...register('staff_borrowing_days', { 
                    required: 'Staff borrowing duration is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 365, message: 'Maximum 365 days' }
                  })}
                />
                {errors.staff_borrowing_days && (
                  <p className="text-sm text-red-500">{errors.staff_borrowing_days.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Book className="h-5 w-5" />
              Other Settings
            </CardTitle>
            <CardDescription>Additional library policies</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_renewals">Maximum Renewals *</Label>
                <Input
                  id="max_renewals"
                  type="number"
                  min="0"
                  max="10"
                  {...register('max_renewals', { 
                    required: 'Maximum renewals is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Minimum 0 renewals' },
                    max: { value: 10, message: 'Maximum 10 renewals' }
                  })}
                />
                <p className="text-xs text-muted-foreground">Number of times a book can be renewed</p>
                {errors.max_renewals && (
                  <p className="text-sm text-red-500">{errors.max_renewals.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reservation_hold_days">Reservation Hold (Days) *</Label>
                <Input
                  id="reservation_hold_days"
                  type="number"
                  min="1"
                  max="30"
                  {...register('reservation_hold_days', { 
                    required: 'Reservation hold days is required',
                    valueAsNumber: true,
                    min: { value: 1, message: 'Minimum 1 day' },
                    max: { value: 30, message: 'Maximum 30 days' }
                  })}
                />
                <p className="text-xs text-muted-foreground">Days to hold a reserved book</p>
                {errors.reservation_hold_days && (
                  <p className="text-sm text-red-500">{errors.reservation_hold_days.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={!isDirty}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={updateLibrarySettings.isPending || !isDirty}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LibrarySettingsForm;
