
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Users, BookOpen, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryMembers, useLibraryMutations } from '@/hooks/useLibrary';

const LibraryMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState<string>('');
  const { profile } = useAuth();

  const { data: members, isLoading, error } = useLibraryMembers(memberTypeFilter);
  const { createLibraryMember } = useLibraryMutations();

  console.log('LibraryMembers - Profile:', profile);
  console.log('LibraryMembers - Members data:', members);
  console.log('LibraryMembers - Loading:', isLoading);
  console.log('LibraryMembers - Error:', error);

  const filteredMembers = members?.filter(member =>
    member.member_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.staff_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddMember = async (studentId: string) => {
    try {
      await createLibraryMember.mutateAsync({
        member_id: `LIB${Date.now()}`,
        member_type: 'student',
        student_id: studentId,
        borrowing_limit: 3
      });
    } catch (error) {
      console.error('Error adding library member:', error);
    }
  };

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
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
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    View History
                  </Button>
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
    </div>
  );
};

export default LibraryMembers;
