import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LibraryMember } from '@/types/library';
import { useLibrarySettings } from '@/hooks/useLibrary';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditLibraryMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: LibraryMember | null;
  onSuccess: () => void;
}

const EditLibraryMemberDialog: React.FC<EditLibraryMemberDialogProps> = ({
  open,
  onOpenChange,
  member,
  onSuccess,
}) => {
  const [borrowingLimit, setBorrowingLimit] = useState<number>(3);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [suspendedUntil, setSuspendedUntil] = useState<string>('');
  const [suspensionReason, setSuspensionReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { data: librarySettings } = useLibrarySettings();

  const getRecommendedLimit = (memberType: string) => {
    if (!librarySettings) return 3;
    switch (memberType) {
      case 'student': return librarySettings.student_borrowing_limit || 3;
      case 'teacher': return librarySettings.teacher_borrowing_limit || 5;
      case 'staff': return librarySettings.staff_borrowing_limit || 3;
      default: return 3;
    }
  };

  useEffect(() => {
    if (member && open) {
      setBorrowingLimit(member.borrowing_limit || 3);
      setIsActive(member.is_active);
      setSuspendedUntil(member.suspended_until || '');
      setSuspensionReason(member.suspension_reason || '');
    }
  }, [member, open]);

  const handleUpdateMember = async () => {
    if (!member) return;

    setLoading(true);
    try {
      const updates: any = {
        borrowing_limit: borrowingLimit,
        is_active: isActive,
        suspended_until: suspendedUntil || null,
        suspension_reason: suspensionReason || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('library_members')
        .update(updates)
        .eq('id', member.id);

      if (error) throw error;

      toast.success('Library member updated successfully');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating library member:', error);
      toast.error('Failed to update library member');
    } finally {
      setLoading(false);
    }
  };

  if (!member) return null;

  const isSuspended = suspendedUntil && new Date(suspendedUntil) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Library Member</DialogTitle>
          <DialogDescription>
            Update member settings and status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Member Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">
                  {member.student_name || member.staff_name || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Member ID:</span>
                <span className="text-sm font-mono">{member.member_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Type:</span>
                <Badge variant="secondary">
                  {member.member_type.charAt(0).toUpperCase() + member.member_type.slice(1)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <Label htmlFor="borrowingLimit">Borrowing Limit</Label>
              <Input
                id="borrowingLimit"
                type="number"
                min="1"
                max="20"
                value={borrowingLimit}
                onChange={(e) => setBorrowingLimit(parseInt(e.target.value) || 1)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Recommended for {member?.member_type}s: {getRecommendedLimit(member?.member_type || 'student')} books
              </p>
              
              {member && borrowingLimit > getRecommendedLimit(member.member_type) && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Exceeds school policy limit of {getRecommendedLimit(member.member_type)} books for {member.member_type}s
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active Status</Label>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>

            {isSuspended && (
              <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  Suspended until: {new Date(suspendedUntil).toLocaleDateString()}
                </p>
                {suspensionReason && (
                  <p className="text-xs text-red-600 mt-1">
                    Reason: {suspensionReason}
                  </p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="suspendedUntil">Suspend Until</Label>
              <Input
                id="suspendedUntil"
                type="date"
                value={suspendedUntil}
                onChange={(e) => setSuspendedUntil(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="suspensionReason">Suspension Reason</Label>
              <Textarea
                id="suspensionReason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdateMember} disabled={loading}>
            {loading ? 'Updating...' : 'Update Member'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditLibraryMemberDialog; 