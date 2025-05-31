import { useEffect, useState } from 'react';
import { useTimetable, TimeSlot } from '@/hooks/useTimetable';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { SubjectTeacherAssignment } from './SubjectTeacherAssignment';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TimetableProps {
  batchId: string;
  academicYearId: string;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Timetable = ({ batchId, academicYearId }: TimetableProps) => {
  const { isLoading, getBatchTimetable, createTimeSlot, updateTimeSlot, deleteTimeSlot } = useTimetable();
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  useEffect(() => {
    loadTimetable();
  }, [batchId]);

  const loadTimetable = async () => {
    const data = await getBatchTimetable(batchId);
    setTimetable(data);
  };

  const handleCreateSlot = async (data: Omit<TimeSlot, 'id' | 'created_at' | 'updated_at'>) => {
    const newSlot = await createTimeSlot(data);
    if (newSlot) {
      await loadTimetable();
      setIsDialogOpen(false);
    }
  };

  const handleUpdateSlot = async (id: string, data: Partial<TimeSlot>) => {
    const updatedSlot = await updateTimeSlot(id, data);
    if (updatedSlot) {
      await loadTimetable();
      setIsDialogOpen(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    const success = await deleteTimeSlot(id);
    if (success) {
      await loadTimetable();
    }
  };

  const TimeSlotDialog = ({ slot }: { slot?: TimeSlot }) => {
    const [formData, setFormData] = useState({
      day_of_week: slot?.day_of_week || 0,
      start_time: slot?.start_time || '',
      end_time: slot?.end_time || '',
      room_number: slot?.room_number || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (slot) {
        handleUpdateSlot(slot.id, formData);
      } else {
        handleCreateSlot({
          ...formData,
          subject_teacher_id: '' // This should be set based on the selected subject and teacher
        });
      }
    };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Add Time Slot</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{slot ? 'Edit Time Slot' : 'Add Time Slot'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Day</Label>
              <Select
                value={formData.day_of_week.toString()}
                onValueChange={(value) => setFormData({ ...formData, day_of_week: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((day, index) => (
                    <SelectItem key={day} value={index.toString()}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Time</Label>
              <Input
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>
            <div>
              <Label>End Time</Label>
              <Input
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            <div>
              <Label>Room Number</Label>
              <Input
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
              />
            </div>
            <Button type="submit">{slot ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="timetable">
        <TabsList>
          <TabsTrigger value="timetable">Timetable</TabsTrigger>
          <TabsTrigger value="assignments">Subject-Teacher Assignments</TabsTrigger>
        </TabsList>
        <TabsContent value="timetable">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Timetable</h2>
            <TimeSlotDialog />
          </div>
          <div className="grid grid-cols-7 gap-4">
            {DAYS.map((day, index) => (
              <Card key={day} className="p-4">
                <h3 className="font-semibold mb-2">{day}</h3>
                <div className="space-y-2">
                  {timetable
                    .filter((slot) => slot.day_of_week === index)
                    .map((slot) => (
                      <div key={slot.id} className="border p-2 rounded">
                        <p className="font-medium">{slot.subject?.name}</p>
                        <p className="text-sm text-gray-500">
                          {slot.start_time} - {slot.end_time}
                        </p>
                        <p className="text-sm text-gray-500">Room: {slot.room_number}</p>
                        <div className="flex gap-2 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedSlot(slot);
                              setIsDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteSlot(slot.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="assignments">
          <SubjectTeacherAssignment batchId={batchId} academicYearId={academicYearId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}; 