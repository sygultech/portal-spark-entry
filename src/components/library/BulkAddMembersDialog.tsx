import React, { useState, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Download, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLibraryMutations, useLibrarySettings } from '@/hooks/useLibrary';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BulkAddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface CSVMember {
  type: 'student' | 'teacher' | 'staff';
  first_name: string;
  last_name: string;
  email: string;
  employee_id?: string;
  admission_number?: string;
  borrowing_limit?: number;
  id?: string;
  status?: 'pending' | 'success' | 'error';
  error_message?: string;
}

interface BatchSelection {
  batch_id: string;
  batch_name: string;
  course_name: string;
  academic_year: string;
  student_count: number;
}

const BulkAddMembersDialog: React.FC<BulkAddMembersDialogProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState('batch');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [availableBatches, setAvailableBatches] = useState<BatchSelection[]>([]);
  const [csvMembers, setCsvMembers] = useState<CSVMember[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; total: number } | null>(null);
  const [memberType, setMemberType] = useState<'student' | 'teacher' | 'staff'>('student');
  const [defaultBorrowingLimit, setDefaultBorrowingLimit] = useState(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { profile } = useAuth();
  const { createLibraryMember } = useLibraryMutations();
  const { data: librarySettings } = useLibrarySettings();

  React.useEffect(() => {
    if (open) {
      fetchAvailableBatches();
      setResults(null);
      setProgress(0);
    }
  }, [open]);

  React.useEffect(() => {
    if (librarySettings) {
      switch (memberType) {
        case 'student':
          setDefaultBorrowingLimit(librarySettings.student_borrowing_limit || 3);
          break;
        case 'teacher':
          setDefaultBorrowingLimit(librarySettings.teacher_borrowing_limit || 5);
          break;
        case 'staff':
          setDefaultBorrowingLimit(librarySettings.staff_borrowing_limit || 3);
          break;
      }
    }
  }, [memberType, librarySettings]);

  const fetchAvailableBatches = async () => {
    if (!profile?.school_id) return;

    try {
      const { data: batchData, error } = await supabase
        .from('batches')
        .select(`
          id,
          name,
          course:courses(name),
          academic_year:academic_years(name)
        `)
        .eq('school_id', profile.school_id)
        .eq('status', 'active');

      if (error) throw error;

      // Get student count for each batch
      const batchesWithCount = await Promise.all(
        (batchData || []).map(async (batch) => {
          const { count } = await supabase
            .from('batch_students')
            .select('*', { count: 'exact' })
            .eq('batch_id', batch.id)
            .eq('is_current', true)
            .eq('status', 'active');

          return {
            batch_id: batch.id,
            batch_name: batch.name,
            course_name: (batch.course as any)?.name || 'Unknown',
            academic_year: (batch.academic_year as any)?.name || 'Unknown',
            student_count: count || 0,
          };
        })
      );

      setAvailableBatches(batchesWithCount);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Failed to fetch batches');
    }
  };

  const generateMemberId = (type: string, index: number) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const timestamp = Date.now().toString().slice(-6);
    const prefix = type === 'student' ? 'STU' : type === 'teacher' ? 'TCH' : 'STF';
    return `${prefix}${year}${timestamp}${index.toString().padStart(3, '0')}`;
  };

  const handleBatchSelection = (batchId: string) => {
    setSelectedBatches(prev => 
      prev.includes(batchId) 
        ? prev.filter(id => id !== batchId)
        : [...prev, batchId]
    );
  };

  const processBatchMembers = async () => {
    if (!profile?.school_id || selectedBatches.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;
    let failedCount = 0;

    try {
      // Fetch students from selected batches
      const { data: batchStudents, error } = await supabase
        .from('batch_students')
        .select(`
          student_id
        `)
        .in('batch_id', selectedBatches)
        .eq('is_current', true)
        .eq('status', 'active');

      if (error) throw error;

      const studentIds = batchStudents?.map(bs => bs.student_id) || [];

      // Get student details
      const { data: students } = await supabase
        .from('student_details')
        .select('id, first_name, last_name, email, admission_number')
        .in('id', studentIds)
        .eq('school_id', profile.school_id);

      // Filter out students who are already library members
      const { data: existingMembers } = await supabase
        .from('library_members')
        .select('student_id')
        .eq('school_id', profile.school_id)
        .eq('is_active', true)
        .not('student_id', 'is', null);

      const existingStudentIds = existingMembers?.map(m => m.student_id) || [];
      const newStudents = (students || []).filter(s => !existingStudentIds.includes(s.id));

      const totalStudents = newStudents.length;

      for (let i = 0; i < newStudents.length; i++) {
        const student = newStudents[i];
        try {
          const memberData = {
            member_id: generateMemberId('student', i),
            member_type: 'student' as const,
            student_id: student.id,
            borrowing_limit: defaultBorrowingLimit,
          };

          await createLibraryMember.mutateAsync(memberData);
          successCount++;
        } catch (error) {
          console.error('Error creating member for student:', student.first_name, error);
          failedCount++;
        }

        setProgress(((i + 1) / totalStudents) * 100);
      }

      setResults({
        success: successCount,
        failed: failedCount,
        total: totalStudents,
      });

      if (successCount > 0) {
        toast.success(`Successfully added ${successCount} library members`);
        onSuccess();
      }
    } catch (error) {
      console.error('Error processing batch members:', error);
      toast.error('Failed to process batch members');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

      const members: CSVMember[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const member: CSVMember = {
          type: memberType,
          first_name: '',
          last_name: '',
          email: '',
          status: 'pending',
        };

        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'first_name':
            case 'firstname':
              member.first_name = value;
              break;
            case 'last_name':
            case 'lastname':
              member.last_name = value;
              break;
            case 'email':
              member.email = value;
              break;
            case 'employee_id':
            case 'employeeid':
              member.employee_id = value;
              break;
            case 'admission_number':
            case 'admissionnumber':
              member.admission_number = value;
              break;
            case 'borrowing_limit':
            case 'borrowinglimit':
              member.borrowing_limit = parseInt(value) || defaultBorrowingLimit;
              break;
          }
        });

        if (member.first_name && member.last_name && member.email) {
          members.push(member);
        }
      }

      setCsvMembers(members);
    };

    reader.readAsText(file);
  };

  const processCsvMembers = async () => {
    if (!profile?.school_id || csvMembers.length === 0) return;

    setIsProcessing(true);
    setProgress(0);
    let successCount = 0;
    let failedCount = 0;

    const updatedMembers = [...csvMembers];

    for (let i = 0; i < updatedMembers.length; i++) {
      const member = updatedMembers[i];
      try {
        // First, find the person in the database
        let personId: string | null = null;

        if (memberType === 'student') {
          const { data: student } = await supabase
            .from('student_details')
            .select('id')
            .eq('school_id', profile.school_id)
            .eq('email', member.email)
            .single();
          personId = student?.id;
        } else {
          const { data: staff } = await supabase
            .from('staff_details')
            .select('id')
            .eq('school_id', profile.school_id)
            .eq('email', member.email)
            .eq('is_teacher', memberType === 'teacher')
            .single();
          personId = staff?.id;
        }

        if (!personId) {
          throw new Error(`${memberType} not found with email: ${member.email}`);
        }

        const memberData = {
          member_id: generateMemberId(memberType, i),
          member_type: memberType,
          borrowing_limit: member.borrowing_limit || defaultBorrowingLimit,
          ...(memberType === 'student' 
            ? { student_id: personId }
            : { staff_id: personId }
          ),
        };

        await createLibraryMember.mutateAsync(memberData);
        updatedMembers[i].status = 'success';
        successCount++;
      } catch (error: any) {
        console.error('Error creating member:', error);
        updatedMembers[i].status = 'error';
        updatedMembers[i].error_message = error.message;
        failedCount++;
      }

      setProgress(((i + 1) / updatedMembers.length) * 100);
    }

    setCsvMembers(updatedMembers);
    setResults({
      success: successCount,
      failed: failedCount,
      total: updatedMembers.length,
    });

    if (successCount > 0) {
      toast.success(`Successfully added ${successCount} library members`);
      onSuccess();
    }

    setIsProcessing(false);
  };

  const downloadTemplate = () => {
    const headers = ['first_name', 'last_name', 'email', 'borrowing_limit'];
    if (memberType !== 'student') {
      headers.splice(3, 0, 'employee_id');
    } else {
      headers.splice(3, 0, 'admission_number');
    }

    const csvContent = headers.join(',') + '\n' +
      'John,Doe,john.doe@example.com,' + 
      (memberType !== 'student' ? 'EMP001,' : 'ADM001,') + 
      defaultBorrowingLimit;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library_members_template_${memberType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Bulk Add Library Members</DialogTitle>
          <DialogDescription>
            Add multiple library members at once using batch selection or CSV import
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="batch">By Batch</TabsTrigger>
            <TabsTrigger value="csv">CSV Import</TabsTrigger>
          </TabsList>

          <TabsContent value="batch" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Batches</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Choose batches to add all students as library members
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {availableBatches.map((batch) => (
                    <Card
                      key={batch.batch_id}
                      className={`cursor-pointer transition-all border-2 ${
                        selectedBatches.includes(batch.batch_id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleBatchSelection(batch.batch_id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{batch.batch_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {batch.course_name} - {batch.academic_year}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {batch.student_count} students
                            </Badge>
                            {selectedBatches.includes(batch.batch_id) && (
                              <CheckCircle className="h-5 w-5 text-primary" />
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedBatches.length} batch(es) selected
                  </div>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="batchBorrowingLimit">Borrowing Limit:</Label>
                      <Input
                        id="batchBorrowingLimit"
                        type="number"
                        min="1"
                        max="20"
                        value={defaultBorrowingLimit}
                        onChange={(e) => setDefaultBorrowingLimit(parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                    </div>
                    <Button 
                      onClick={processBatchMembers}
                      disabled={selectedBatches.length === 0 || isProcessing}
                    >
                      {isProcessing ? 'Processing...' : 'Add Members'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">CSV Import</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Upload a CSV file to bulk add library members
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Select value={memberType} onValueChange={(value: any) => setMemberType(value)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="teacher">Teachers</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button variant="outline" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>

                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Upload CSV File</h3>
                  <p className="text-muted-foreground mb-4">
                    Choose a CSV file with member information
                  </p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>

                {csvMembers.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Preview ({csvMembers.length} members)</h4>
                      <Button onClick={processCsvMembers} disabled={isProcessing}>
                        {isProcessing ? 'Processing...' : 'Import Members'}
                      </Button>
                    </div>

                    <div className="max-h-40 overflow-y-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvMembers.map((member, index) => (
                            <tr key={index} className="border-t">
                              <td className="p-2">{member.first_name} {member.last_name}</td>
                              <td className="p-2">{member.email}</td>
                              <td className="p-2">
                                {member.status === 'success' && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {member.status === 'error' && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                {member.status === 'pending' && (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Processing members...</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {results && (
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2">Results</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{results.success}</div>
                  <div className="text-sm text-muted-foreground">Successful</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">{results.failed}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{results.total}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BulkAddMembersDialog; 