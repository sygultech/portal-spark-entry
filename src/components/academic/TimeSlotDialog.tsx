
import { useState, useEffect } from "react";
import { useSubjectTeachers } from "@/hooks/useSubjectTeachers";
import { useTimeSlots } from "@/hooks/useTimeSlots";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

interface TimeSlotDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subject: any;
}

const TimeSlotDialog = ({ 
  isOpen, 
  onClose, 
  subject
}: TimeSlotDialogProps) => {
  const { subjectTeachers, isLoading: teachersLoading } = useSubjectTeachers(subject?.id);
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const { timeSlots, isLoading: timeSlotsLoading, addTimeSlot, deleteTimeSlot } = useTimeSlots(selectedTeacher);
  const { toast } = useToast();
  
  const [dayOfWeek, setDayOfWeek] = useState<string>("1"); // Monday
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [roomNumber, setRoomNumber] = useState<string>("");
  
  useEffect(() => {
    if (isOpen) {
      setSelectedTeacher("");
      setDayOfWeek("1");
      setStartTime("09:00");
      setEndTime("10:00");
      setRoomNumber("");
    }
  }, [isOpen]);
  
  const handleTeacherChange = (value: string) => {
    setSelectedTeacher(value);
  };
  
  const handleAddTimeSlot = () => {
    if (!selectedTeacher) {
      toast({
        title: "Error",
        description: "Please select a teacher assignment first",
        variant: "destructive"
      });
      return;
    }
    
    // Validate times
    const start = new Date(`1970-01-01T${startTime}`);
    const end = new Date(`1970-01-01T${endTime}`);
    
    if (start >= end) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }
    
    addTimeSlot({
      subject_teacher_id: selectedTeacher,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      room_number: roomNumber || undefined
    });
  };
  
  const handleDeleteTimeSlot = (id: string) => {
    deleteTimeSlot(id);
  };
  
  const getDayName = (day: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[day] || "Unknown";
  };
  
  const formatTime = (timeString: string) => {
    try {
      const [hours, minutes] = timeString.split(":");
      return new Date(0, 0, 0, parseInt(hours), parseInt(minutes)).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (e) {
      return timeString;
    }
  };
  
  const canAddTimeSlot = selectedTeacher && dayOfWeek && startTime && endTime;
  const hasTeacherAssignments = subjectTeachers.length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Schedule Time Slots for {subject?.name}</DialogTitle>
          <DialogDescription>
            Add class schedule time slots for this subject
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <div>
            <Label className="text-sm font-medium mb-1 block">Select Teacher Assignment</Label>
            <Select value={selectedTeacher} onValueChange={handleTeacherChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a teacher assignment" />
              </SelectTrigger>
              <SelectContent>
                {!hasTeacherAssignments ? (
                  <SelectItem value="no-assignments" disabled>No teacher assignments available</SelectItem>
                ) : (
                  subjectTeachers.map((assignment) => (
                    <SelectItem 
                      key={assignment.id} 
                      value={assignment.id || "unknown-id"}
                    >
                      {assignment.teacher?.first_name || ''} {assignment.teacher?.last_name || ''} - {assignment.batch?.name || 'Unknown Batch'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {!hasTeacherAssignments && !teachersLoading && (
              <p className="text-sm text-muted-foreground mt-1">
                No teacher assignments found. Please assign teachers to this subject first.
              </p>
            )}
          </div>
          
          {selectedTeacher && (
            <>
              <Separator className="my-4" />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label>Day</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sunday</SelectItem>
                      <SelectItem value="1">Monday</SelectItem>
                      <SelectItem value="2">Tuesday</SelectItem>
                      <SelectItem value="3">Wednesday</SelectItem>
                      <SelectItem value="4">Thursday</SelectItem>
                      <SelectItem value="5">Friday</SelectItem>
                      <SelectItem value="6">Saturday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Start Time</Label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                
                <div>
                  <Label>End Time</Label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
                
                <div>
                  <Label>Room (Optional)</Label>
                  <Input 
                    placeholder="e.g. 101, Lab-2" 
                    value={roomNumber} 
                    onChange={(e) => setRoomNumber(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex justify-end mt-2">
                <Button 
                  onClick={handleAddTimeSlot}
                  disabled={!canAddTimeSlot}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Slot
                </Button>
              </div>
              
              <Separator className="my-4" />
              
              <div className="text-sm font-medium mb-2">Current Time Slots</div>
              
              {timeSlotsLoading ? (
                <div className="text-center py-4 text-muted-foreground">Loading time slots...</div>
              ) : timeSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                  <p>No time slots scheduled for this teacher assignment yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[200px] rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead className="w-[60px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {timeSlots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell>{getDayName(slot.day_of_week || 0)}</TableCell>
                          <TableCell>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </TableCell>
                          <TableCell>{slot.room_number || '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteTimeSlot(slot.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </>
          )}
        </div>
        
        <DialogFooter className="mt-4">
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TimeSlotDialog;

// force update

// force update
