
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Search, Edit, UserCheck, UserX } from 'lucide-react';
import { useLibraryMembers, useLibraryMutations } from '@/hooks/useLibrary';
import { useStudents } from '@/hooks/useStudents';
import { CreateLibraryMemberData } from '@/types/library';
import { useForm } from 'react-hook-form';

const LibraryMembers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedMemberType, setSelectedMemberType] = useState<'student' | 'teacher' | 'staff'>('student');

  const { data: members = [], isLoading } = useLibraryMembers(memberTypeFilter || undefined);
  const { data: students = [] } = useStudents();
  const { createLibraryMember } = useLibraryMutations();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateLibraryMemberData>();

  const memberType = watch('member_type');

  const filteredMembers = members.filter(member => {
    const searchableText = `${member.student_name || member.staff_name || ''} ${member.member_id}`.toLowerCase();
    return searchableText.includes(searchTerm.toLowerCase());
  });

  const onSubmit = async (data: CreateLibraryMemberData) => {
    try {
      await createLibraryMember.mutateAsync(data);
      reset();
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error creating library member:', error);
    }
  };

  const resetForm = () => {
    reset();
    setIsAddDialogOpen(false);
  };

  const getMemberTypeStats = () => {
    const stats = {
      total: members.length,
      students: members.filter(m => m.member_type === 'student').length,
      teachers: members.filter(m => m.member_type === 'teacher').length,
      staff: members.filter(m => m.member_type === 'staff').length,
      active: members.filter(m => m.is_active).length,
      suspended: members.filter(m => m.suspended_until && new Date(m.suspended_until) > new Date()).length
    };
    return stats;
  };

  const stats = getMemberTypeStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Library Members</h2>
          <p className="text-muted-foreground">Manage library membership</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Library Member</DialogTitle>
              <DialogDescription>
                Register a new library member
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member_type">Member Type *</Label>
                <Select onValueChange={(value: any) => {
                  setValue('member_type', value);
                  setSelectedMemberType(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select member type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="member_id">Library ID *</Label>
                <Input
                  id="member_id"
                  {...register('member_id', { required: 'Library ID is required' })}
                  placeholder="e.g., LIB001"
                />
                {errors.member_id && (
                  <p className="text-sm text-red-500">{errors.member_id.message}</p>
                )}
              </div>

              {memberType === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="student_id">Select Student *</Label>
                  <Select onValueChange={(value) => setValue('student_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map(student => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.first_name} {student.last_name} ({student.admission_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="borrowing_limit">Borrowing Limit</Label>
                <Input
                  id="borrowing_limit"
                  type="number"
                  min="1"
                  max="10"
                  {...register('borrowing_limit', { valueAsNumber: true })}
                  placeholder="Default based on member type"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createLibraryMember.isPending}>
                  Add Member
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teachers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staff</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.staff}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspended</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search members by name or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={memberTypeFilter} onValueChange={setMemberTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="teacher">Teachers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Members</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading members...</div>
          ) : filteredMembers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No members found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'Try adjusting your search' : 'Add your first library member to get started'}
                </p>
                {!searchTerm && (
                  <Button onClick={() => setIsAddDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Member
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredMembers.map(member => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {member.student_name || member.staff_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          ID: {member.member_id} • Type: {member.member_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Borrowing Limit: {member.borrowing_limit}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current: {member.current_books || 0} books
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {member.suspended_until && new Date(member.suspended_until) > new Date() && (
                          <Badge variant="destructive">Suspended</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4">
            {filteredMembers.filter(m => m.is_active).map(member => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <UserCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {member.student_name || member.staff_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {member.member_id} • Type: {member.member_type}
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Active</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="suspended">
          <div className="grid gap-4">
            {filteredMembers.filter(m => m.suspended_until && new Date(m.suspended_until) > new Date()).map(member => (
              <Card key={member.id}>
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <UserX className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {member.student_name || member.staff_name || 'Unknown'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        ID: {member.member_id} • Suspended until: {member.suspended_until}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Reason: {member.suspension_reason}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Suspended</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LibraryMembers;
