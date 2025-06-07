
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { Room } from "@/hooks/useRooms";

interface RoomManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  room?: Room | null;
  onSave: (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  mode: 'create' | 'edit';
}

interface RoomFormData {
  name: string;
  code: string;
  capacity: number;
  type: string;
  location: string;
  description: string;
  facilities: string[];
}

const roomTypes = [
  "Classroom",
  "Laboratory",
  "Computer Lab",
  "Science Lab",
  "Library",
  "Auditorium",
  "Gymnasium",
  "Conference Room",
  "Music Room",
  "Art Room",
  "Other"
];

const commonFacilities = [
  "Projector",
  "Whiteboard",
  "Smart Board",
  "Air Conditioning",
  "WiFi",
  "Sound System",
  "Computers",
  "Laboratory Equipment",
  "Sports Equipment",
  "Musical Instruments"
];

export const RoomManagementDialog: React.FC<RoomManagementDialogProps> = ({
  open,
  onOpenChange,
  room,
  onSave,
  mode
}) => {
  const [newFacility, setNewFacility] = useState("");
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(room?.facilities || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<RoomFormData>({
    defaultValues: {
      name: room?.name || '',
      code: room?.code || '',
      capacity: room?.capacity || 0,
      type: room?.type || '',
      location: room?.location || '',
      description: room?.description || '',
      facilities: room?.facilities || []
    }
  });

  React.useEffect(() => {
    if (room) {
      setValue('name', room.name);
      setValue('code', room.code || '');
      setValue('capacity', room.capacity || 0);
      setValue('type', room.type || '');
      setValue('location', room.location || '');
      setValue('description', room.description || '');
      setSelectedFacilities(room.facilities || []);
    } else if (mode === 'create') {
      reset();
      setSelectedFacilities([]);
    }
  }, [room, mode, setValue, reset]);

  const addFacility = (facility: string) => {
    if (facility && !selectedFacilities.includes(facility)) {
      setSelectedFacilities([...selectedFacilities, facility]);
    }
    setNewFacility("");
  };

  const removeFacility = (facility: string) => {
    setSelectedFacilities(selectedFacilities.filter(f => f !== facility));
  };

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      await onSave({
        ...data,
        facilities: selectedFacilities,
        school_id: room?.school_id || '' // Will be set by the parent component
      });
      onOpenChange(false);
      if (mode === 'create') {
        reset();
        setSelectedFacilities([]);
      }
    } catch (error) {
      console.error('Error saving room:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Add New Room' : 'Edit Room'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Create a new room for your school' 
              : 'Update the room information'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Room Name *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Room name is required' })}
                placeholder="e.g., Room 101"
              />
              {errors.name && (
                <span className="text-sm text-destructive">{errors.name.message}</span>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Room Code</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="e.g., R101"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Room Type</Label>
              <Select onValueChange={(value) => setValue('type', value)} value={watch('type')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                {...register('capacity', { 
                  valueAsNumber: true, 
                  min: { value: 1, message: 'Capacity must be at least 1' } 
                })}
                placeholder="e.g., 30"
              />
              {errors.capacity && (
                <span className="text-sm text-destructive">{errors.capacity.message}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., Ground Floor, East Wing"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Additional details about the room..."
              rows={3}
            />
          </div>

          {/* Facilities */}
          <div className="space-y-4">
            <Label>Facilities</Label>
            
            {/* Add facility input */}
            <div className="flex gap-2">
              <Select onValueChange={addFacility}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add a facility" />
                </SelectTrigger>
                <SelectContent>
                  {commonFacilities
                    .filter(facility => !selectedFacilities.includes(facility))
                    .map((facility) => (
                      <SelectItem key={facility} value={facility}>
                        {facility}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  placeholder="Custom facility"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addFacility(newFacility);
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addFacility(newFacility)}
                  disabled={!newFacility.trim()}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Selected facilities */}
            {selectedFacilities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedFacilities.map((facility) => (
                  <Badge key={facility} variant="secondary" className="flex items-center gap-1">
                    {facility}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => removeFacility(facility)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Room' : 'Update Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
