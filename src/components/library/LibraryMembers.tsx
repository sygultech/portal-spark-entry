
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Search, Plus, Users, BookOpen, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryMembers, useLibraryMutations } from '@/hooks/useLibrary';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AddLibraryMemberDialog from './AddLibraryMemberDialog';
import BulkAddMembersDialog from './BulkAddMembersDialog';
import EditLibraryMemberDialog from './EditLibraryMemberDialog';

const LibraryMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>('');
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);
  const [bulkAddDialogOpen, setBulkAddDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const { profile } = useAuth();

  const { data: members, isLoading, error, refetch } = useLibraryMembers(memberTypeFilter);
  const { createLibraryMember } = useLibraryMutations();

  const handleDeactivateMember = async (memberId: string) => {
    try {
      const { error } = await supabase.from('library_members')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member deactivated successfully');
      refetch();
    } catch (error) {
      console.error('Error deactivating member:', error);
      toast.error('Failed to deactivate member');
    }
  };

  console.log('LibraryMembers - Profile:', profile);
  console.log('LibraryMembers - Members data:', members);
  console.log('LibraryMembers - Loading:', isLoading);
  console.log('LibraryMembers - Error:', error);

  const filteredMembers = members?.filter(member =>
    member.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];



  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error loading library members</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Library Members</h2>
          <p className="text-muted-foreground">Manage library membership</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddMemberDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
          <Button variant="outline" onClick={() => setBulkAddDialogOpen(true)}>
            <Users className="h-4 w-4 mr-2" />
            Bulk Add
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={memberTypeFilter}
          onChange={(e) => setMemberTypeFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All Types</option>
          <option value="student">Students</option>
          <option value="teacher">Teachers</option>
          <option value="staff">Staff</option>
        </select>
      </div>

      <div className="grid gap-4">
        {filteredMembers.map((member) => (
          <Card key={member.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {member.student_name || member.staff_name || 'Unknown Member'}
                  </CardTitle>
                  <CardDescription>
                    Member ID: {member.member_id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.member_type === 'student' ? 'default' : 'secondary'}>
                    {member.member_type}
                  </Badge>
                  <Badge variant={member.is_active ? 'outline' : 'destructive'}>
                    {member.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>Limit: {member.borrowing_limit} books</span>
                  </div>
                  {member.current_books && (
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>Current: {member.current_books} books</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMember(member);
                      setEditMemberDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to deactivate this library member? 
                          They will no longer be able to borrow books.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeactivateMember(member.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Deactivate
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              {member.suspended_until && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  Suspended until: {member.suspended_until}
                  {member.suspension_reason && ` - ${member.suspension_reason}`}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMembers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No library members found
        </div>
      )}

      <AddLibraryMemberDialog
        open={addMemberDialogOpen}
        onOpenChange={setAddMemberDialogOpen}
        onSuccess={() => {
          refetch();
          setAddMemberDialogOpen(false);
        }}
      />

      <BulkAddMembersDialog
        open={bulkAddDialogOpen}
        onOpenChange={setBulkAddDialogOpen}
        onSuccess={() => {
          refetch();
          setBulkAddDialogOpen(false);
        }}
      />

      <EditLibraryMemberDialog
        open={editMemberDialogOpen}
        onOpenChange={setEditMemberDialogOpen}
        member={selectedMember}
        onSuccess={() => {
          refetch();
          setEditMemberDialogOpen(false);
          setSelectedMember(null);
        }}
      />
    </div>
  );
};

export default LibraryMembers;
