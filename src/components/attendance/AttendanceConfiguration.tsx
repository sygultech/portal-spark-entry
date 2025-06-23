import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useBatchManagement } from '@/hooks/useBatchManagement';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { attendanceService } from '@/services/attendanceService';
import { AttendanceMode, AttendanceConfiguration as AttendanceConfigType } from '@/types/attendance';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Settings, Clock, Bell } from 'lucide-react';
import AttendanceConfigurationDialog from './AttendanceConfigurationDialog';

const AttendanceConfiguration = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeBatches, isLoading: batchesLoading } = useBatchManagement();
  const { academicYears, isLoading: academicYearsLoading } = useAcademicYears();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AttendanceConfigType | null>(null);

  const schoolId = profile?.school_id || '';
  const currentAcademicYear = academicYears.find(year => year.is_current);

  // Fetch all configurations for the school
  const { data: configurations, isLoading: configLoading } = useQuery({
    queryKey: ['attendanceConfigurations', schoolId],
    queryFn: () => attendanceService.getAttendanceConfigurations(schoolId),
    enabled: !!schoolId
  });

  // Fetch specific configuration for selected batch
  const { data: batchConfig, isLoading: batchConfigLoading } = useQuery({
    queryKey: ['attendanceConfiguration', selectedBatch],
    queryFn: () => attendanceService.getAttendanceConfiguration(selectedBatch),
    enabled: !!selectedBatch
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ batchId, mode, settings }: { 
      batchId: string; 
      mode: AttendanceMode; 
      settings: Partial<AttendanceConfigType> 
    }) => attendanceService.updateAttendanceConfiguration(batchId, mode, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendanceConfigurations'] });
      queryClient.invalidateQueries({ queryKey: ['attendanceConfiguration'] });
      toast({
        title: 'Configuration Updated',
        description: 'Attendance configuration has been updated successfully.'
      });
      setDialogOpen(false);
      setEditingConfig(null);
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: 'Failed to update attendance configuration. Please try again.',
        variant: 'destructive'
      });
    }
  });

  const getModeDisplayName = (mode: AttendanceMode): string => {
    switch (mode) {
      case 'daily': return 'Daily Attendance';
      case 'period': return 'Period-wise Attendance';
      case 'session': return 'Session-based (AM/PM)';
      default: return 'Unknown Mode';
    }
  };

  const getModeColor = (mode: AttendanceMode): string => {
    switch (mode) {
      case 'daily': return 'bg-blue-100 text-blue-800';
      case 'period': return 'bg-green-100 text-green-800';
      case 'session': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditConfiguration = (config: AttendanceConfigType) => {
    setEditingConfig(config);
    setDialogOpen(true);
  };

  const handleCreateConfiguration = (batchId: string) => {
    setEditingConfig(null);
    setSelectedBatch(batchId);
    setDialogOpen(true);
  };

  if (batchesLoading || configLoading || academicYearsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading configurations...</span>
      </div>
    );
  }

  if (!currentAcademicYear) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Current Academic Year</CardTitle>
          <CardDescription>
            Please set a current academic year in the Academic section before configuring attendance.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Batches</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBatches.length}</div>
            <p className="text-xs text-muted-foreground">Active batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Configured</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{configurations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Attendance modes set</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auto Features</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {configurations?.filter(c => c.auto_absent_enabled).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Auto-absent enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Batch Configuration List */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Attendance Configurations</CardTitle>
          <CardDescription>
            Configure attendance modes and settings for each batch
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeBatches.map((batch) => {
              const config = configurations?.find(c => c.batch_id === batch.id);
              
              return (
                <div key={batch.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{batch.name}</h3>
                      <Badge variant="outline">{batch.course.name}</Badge>
                      {config && (
                        <Badge className={getModeColor(config.attendance_mode)}>
                          {getModeDisplayName(config.attendance_mode)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {config 
                        ? `Auto-absent: ${config.auto_absent_enabled ? 'Enabled' : 'Disabled'} | Notifications: ${config.notification_enabled ? 'On' : 'Off'}`
                        : 'No attendance configuration set'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {config ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditConfiguration(config)}
                      >
                        Edit Configuration
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleCreateConfiguration(batch.id)}
                      >
                        Configure Attendance
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <AttendanceConfigurationDialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingConfig(null);
        }}
        configuration={editingConfig}
        batchId={selectedBatch}
        schoolId={schoolId}
        onSubmit={(data) => {
          if (!selectedBatch || !currentAcademicYear) return;
          updateConfigMutation.mutate({
            batchId: selectedBatch,
            mode: data.attendance_mode as AttendanceMode,
            settings: {
              ...data,
              school_id: schoolId,
              academic_year_id: currentAcademicYear.id
            }
          });
        }}
        isLoading={updateConfigMutation.isPending}
      />
    </div>
  );
};

export default AttendanceConfiguration;
