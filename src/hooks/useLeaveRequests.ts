
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { AttendanceLeaveRequest } from '@/types/attendance';

export function useLeaveRequests() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  const queryClient = useQueryClient();

  // Fetch leave requests
  const { data: leaveRequests, isLoading } = useQuery({
    queryKey: ['leave-requests', schoolId],
    queryFn: async () => {
      if (!schoolId) return [];
      
      const { data, error } = await supabase
        .from('attendance_leave_requests')
        .select(`
          *,
          student:student_details(first_name, last_name, admission_number),
          requested_by_profile:profiles!attendance_leave_requests_requested_by_fkey(first_name, last_name, email)
        `)
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AttendanceLeaveRequest[];
    },
    enabled: !!schoolId
  });

  // Create leave request mutation
  const createLeaveRequestMutation = useMutation({
    mutationFn: async (leaveData: Partial<AttendanceLeaveRequest>) => {
      const { data, error } = await supabase
        .from('attendance_leave_requests')
        .insert({
          ...leaveData,
          school_id: schoolId,
          requested_by: profile?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: 'Success',
        description: 'Leave request submitted successfully'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit leave request',
        variant: 'destructive'
      });
    }
  });

  // Approve/reject leave request mutation
  const updateLeaveRequestMutation = useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      rejection_reason 
    }: { 
      id: string; 
      status: 'approved' | 'rejected'; 
      rejection_reason?: string;
    }) => {
      const updates: any = {
        status,
        approved_by: profile?.id,
        approved_at: new Date().toISOString()
      };

      if (status === 'rejected' && rejection_reason) {
        updates.rejection_reason = rejection_reason;
      }

      const { data, error } = await supabase
        .from('attendance_leave_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: 'Success',
        description: 'Leave request updated successfully'
      });
    }
  });

  return {
    leaveRequests,
    isLoading,
    createLeaveRequest: createLeaveRequestMutation.mutate,
    updateLeaveRequest: updateLeaveRequestMutation.mutate,
    isCreating: createLeaveRequestMutation.isPending,
    isUpdating: updateLeaveRequestMutation.isPending
  };
}
