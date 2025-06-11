
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, Book, MapPin } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { Room } from "@/hooks/useRooms";

interface RoomAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rooms: Room[];
  onSave: (allocationData: RoomAllocationData) => Promise<void>;
}

interface RoomAllocationData {
  room_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  time_slot: string;
  academic_year_id: string;
  term: string;
}

interface RoomAllocationFormData {
  room_id: string;
  class_id: string;
  subject_id: string;
  day_of_week: string;
  time_slot: string;
}

// Mock data - replace with actual data from your hooks
const mockClasses = [
  { id: "class-6a", name: "Class 6A" },
  { id: "class-6b", name: "Class 6B" },
  { id: "class-7a", name: "Class 7A" },
  { id: "class-7b", name: "Class 7B" },
];

const mockSubjects = [
  { id: "math", name: "Mathematics" },
  { id: "science", name: "Science" },
  { id: "english", name: "English" },
  { id: "history", name: "History" },
  { id: "geography", name: "Geography" },
];

const daysOfWeek = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
];

const timeSlots = [
  { id: "09:00-10:00", name: "09:00 - 10:00" },
  { id: "10:00-11:00", name: "10:00 - 11:00" },
  { id: "11:00-12:00", name: "11:00 - 12:00" },
  { id: "12:00-13:00", name: "12:00 - 13:00" },
  { id: "14:00-15:00", name: "14:00 - 15:00" },
  { id: "15:00-16:00", name: "15:00 - 16:00" },
];

export const RoomAllocationDialog: React.FC<RoomAllocationDialogProps> = ({
  open,
  onOpenChange,
  rooms,
  onSave
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<RoomAllocationFormData>({
    defaultValues: {
      room_id: '',
      class_id: '',
      subject_id: '',
      day_of_week: '',
      time_slot: ''
    }
  });

  const watchedRoomId = watch('room_id');

  useEffect(() => {
    if (watchedRoomId) {
      const room = rooms.find(r => r.id === watchedRoomId);
      setSelectedRoom(room || null);
    }
  }, [watchedRoomId, rooms]);

  const onSubmit = async (data: RoomAllocationFormData) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        academic_year_id: '', // Will be set by parent component
        term: '' // Will be set by parent component
      });
      onOpenChange(false);
      reset();
      setSelectedRoom(null);
    } catch (error) {
      console.error('Error saving room allocation:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
    setSelectedRoom(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Allocate Room
          </DialogTitle>
          <DialogDescription>
            Assign a room to a specific class, subject, and time period.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Room Selection */}
          <div className="space-y-2">
            <Label htmlFor="room_id">Select Room *</Label>
            <Controller
              name="room_id"
              control={control}
              rules={{ required: 'Please select a room' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{room.name}</span>
                          {room.capacity && (
                            <Badge variant="outline" className="ml-2">
                              {room.capacity} seats
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.room_id && (
              <span className="text-sm text-destructive">{errors.room_id.message}</span>
            )}
          </div>

          {/* Selected Room Details */}
          {selectedRoom && (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{selectedRoom.name}</h4>
                    {selectedRoom.type && (
                      <Badge variant="outline">{selectedRoom.type}</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    {selectedRoom.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        Capacity: {selectedRoom.capacity}
                      </div>
                    )}
                    {selectedRoom.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {selectedRoom.location}
                      </div>
                    )}
                  </div>
                  {selectedRoom.facilities && selectedRoom.facilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedRoom.facilities.slice(0, 3).map((facility) => (
                        <Badge key={facility} variant="secondary" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                      {selectedRoom.facilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedRoom.facilities.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Class and Subject Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_id">Class *</Label>
              <Controller
                name="class_id"
                control={control}
                rules={{ required: 'Please select a class' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose class" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.class_id && (
                <span className="text-sm text-destructive">{errors.class_id.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject_id">Subject *</Label>
              <Controller
                name="subject_id"
                control={control}
                rules={{ required: 'Please select a subject' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSubjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          <div className="flex items-center gap-2">
                            <Book className="h-3 w-3" />
                            {subject.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.subject_id && (
                <span className="text-sm text-destructive">{errors.subject_id.message}</span>
              )}
            </div>
          </div>

          {/* Day and Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day_of_week">Day of Week *</Label>
              <Controller
                name="day_of_week"
                control={control}
                rules={{ required: 'Please select a day' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose day" />
                    </SelectTrigger>
                    <SelectContent>
                      {daysOfWeek.map((day) => (
                        <SelectItem key={day.id} value={day.id}>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {day.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.day_of_week && (
                <span className="text-sm text-destructive">{errors.day_of_week.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="time_slot">Time Slot *</Label>
              <Controller
                name="time_slot"
                control={control}
                rules={{ required: 'Please select a time slot' }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot.id} value={slot.id}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {slot.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.time_slot && (
                <span className="text-sm text-destructive">{errors.time_slot.message}</span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Allocating...' : 'Allocate Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
