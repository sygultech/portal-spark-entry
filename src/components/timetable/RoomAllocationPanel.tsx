import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, MapPin, AlertTriangle, X } from "lucide-react";
import { useRooms, Room } from '@/hooks/useRooms';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const timeSlots = [
  "08:00 - 08:45",
  "08:45 - 09:30", 
  "09:30 - 10:15",
  "10:30 - 11:15",
  "11:15 - 12:00",
  "12:00 - 12:45",
  "13:30 - 14:15",
  "14:15 - 15:00",
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Mock room allocation data (to be replaced with real allocation logic)
const mockRoomAllocations: any = {};

const commonFacilities = [
  "Projector",
  "Smart Board",
  "Air Conditioning",
  "Computer Lab",
  "Science Lab",
  "Library",
  "Sports Equipment",
  "Audio System",
  "Whiteboard",
  "Blackboard",
  "Internet Access",
  "Wheelchair Access",
  "First Aid Kit",
  "Fire Extinguisher",
  "Emergency Exit"
];

export const RoomAllocationPanel = () => {
  const { profile } = useAuth();
  const schoolId = profile?.school_id || '';
  const { rooms, isLoading, fetchRooms, addRoom, updateRoom, deleteRoom } = useRooms(schoolId);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showEditRoom, setShowEditRoom] = useState(false);
  const [editRoomData, setEditRoomData] = useState<Partial<Room> | null>(null);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const [facilityInput, setFacilityInput] = useState("");
  const [showFacilityPopover, setShowFacilityPopover] = useState(false);

  useEffect(() => {
    if (schoolId) fetchRooms();
  }, [schoolId, fetchRooms]);

  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
    if (rooms.length === 0) {
      setSelectedRoom(null);
    }
  }, [rooms]);

  const getRoomAllocation = (day: string, timeSlot: string) => {
    if (!selectedRoom) return null;
    return mockRoomAllocations[selectedRoom.id]?.[day]?.[timeSlot];
  };

  const hasConflict = (roomId: string, day: string, timeSlot: string) => {
    const conflictKey = `${roomId}-${day.toLowerCase()}-${timeSlot.replace(/[^0-9]/g, '')}`;
    return conflicts.includes(conflictKey);
  };

  const getRoomTypeColor = (type?: string) => {
    switch (type) {
      case "Classroom": return "bg-blue-100 text-blue-800";
      case "Laboratory": return "bg-purple-100 text-purple-800";
      case "Sports": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Add Room Dialog State
  const [newRoom, setNewRoom] = useState<Partial<Room>>({ name: '', type: '', capacity: undefined });

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.name || !schoolId) return;
    await addRoom({
      name: newRoom.name,
      code: newRoom.code,
      capacity: newRoom.capacity,
      type: newRoom.type,
      location: newRoom.location,
      description: newRoom.description,
      school_id: schoolId,
    });
    setShowAddRoom(false);
    setNewRoom({ name: '', type: '', capacity: undefined });
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoomData?.id) return;
    await updateRoom(editRoomData.id, editRoomData);
    setShowEditRoom(false);
    setEditRoomData(null);
  };

  const handleDeleteRoom = async (roomId: string) => {
    await deleteRoom(roomId);
    if (selectedRoom?.id === roomId) {
      setSelectedRoom(rooms.length > 1 ? rooms.find(r => r.id !== roomId) || null : null);
    }
  };

  const handleFacilityInput = (value: string) => {
    setFacilityInput(value);
  };

  const handleAddFacility = (facility: string) => {
    if (!facility) return;
    
    const facilityToAdd = facility.trim();
    if (!facilityToAdd) return;

    if (showAddRoom) {
      setNewRoom(prev => ({
        ...prev,
        facilities: [...(prev.facilities || []), facilityToAdd]
      }));
    } else if (showEditRoom && editRoomData) {
      setEditRoomData(prev => ({
        ...prev,
        facilities: [...(prev.facilities || []), facilityToAdd]
      }));
    }
    
    setFacilityInput("");
    setShowFacilityPopover(false);
  };

  const handleRemoveFacility = (facilityToRemove: string) => {
    if (showAddRoom) {
      setNewRoom(prev => ({
        ...prev,
        facilities: (prev.facilities || []).filter(f => f !== facilityToRemove)
      }));
    } else if (showEditRoom && editRoomData) {
      setEditRoomData(prev => ({
        ...prev,
        facilities: (prev.facilities || []).filter(f => f !== facilityToRemove)
      }));
    }
  };

  const renderFacilitiesInput = (isEdit: boolean = false) => {
    const facilities = isEdit ? editRoomData?.facilities || [] : newRoom.facilities || [];
    
    return (
      <div className="space-y-2">
        <Label>Facilities</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {facilities.map((facility) => (
            <Badge key={facility} variant="secondary" className="flex items-center gap-1">
              {facility}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveFacility(facility)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add facility..."
            value={facilityInput}
            onChange={(e) => setFacilityInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && facilityInput) {
                e.preventDefault();
                handleAddFacility(facilityInput);
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (facilityInput) {
                handleAddFacility(facilityInput);
              }
            }}
          >
            Add
          </Button>
        </div>
        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-2">Common facilities:</p>
          <div className="flex flex-wrap gap-2">
            {commonFacilities
              .filter(f => !facilities.includes(f))
              .map((facility) => (
                <Button
                  key={facility}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddFacility(facility)}
                >
                  {facility}
                </Button>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Room Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Room Management
            <Button onClick={() => setShowAddRoom(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </CardTitle>
          <CardDescription>Manage school rooms and their allocations</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading rooms...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map((room) => (
                <Card 
                  key={room.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedRoom?.id === room.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <CardHeader>
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {room.name}
                      </div>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); setEditRoomData(room); setShowEditRoom(true); }}>
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={(e) => { e.stopPropagation(); handleDeleteRoom(room.id); }}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <Badge className={getRoomTypeColor(room.type)}>
                        {room.type || 'Other'}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Capacity: {room.capacity || '-'} students
                      </p>
                      {room.location && <p className="text-xs text-muted-foreground">Location: {room.location}</p>}
                      {room.description && <p className="text-xs text-muted-foreground">{room.description}</p>}
                      {room.facilities && room.facilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {room.facilities.map((facility) => (
                            <Badge key={facility} variant="outline" className="text-xs">
                              {facility}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Room Dialog */}
      {showAddRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Add Room</h2>
            <form onSubmit={handleAddRoom} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={newRoom.name || ''} onChange={e => setNewRoom(r => ({ ...r, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={newRoom.type || ''} onChange={e => setNewRoom(r => ({ ...r, type: e.target.value }))} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={newRoom.capacity || ''} onChange={e => setNewRoom(r => ({ ...r, capacity: parseInt(e.target.value) }))} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={newRoom.location || ''} onChange={e => setNewRoom(r => ({ ...r, location: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={newRoom.description || ''} onChange={e => setNewRoom(r => ({ ...r, description: e.target.value }))} />
              </div>
              {renderFacilitiesInput()}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowAddRoom(false)}>Cancel</Button>
                <Button type="submit">Add</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Room Dialog */}
      {showEditRoom && editRoomData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Room</h2>
            <form onSubmit={handleEditRoom} className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={editRoomData.name || ''} onChange={e => setEditRoomData(r => ({ ...r, name: e.target.value }))} required />
              </div>
              <div>
                <Label>Type</Label>
                <Input value={editRoomData.type || ''} onChange={e => setEditRoomData(r => ({ ...r, type: e.target.value }))} />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={editRoomData.capacity || ''} onChange={e => setEditRoomData(r => ({ ...r, capacity: parseInt(e.target.value) }))} />
              </div>
              <div>
                <Label>Location</Label>
                <Input value={editRoomData.location || ''} onChange={e => setEditRoomData(r => ({ ...r, location: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editRoomData.description || ''} onChange={e => setEditRoomData(r => ({ ...r, description: e.target.value }))} />
              </div>
              {renderFacilitiesInput(true)}
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowEditRoom(false)}>Cancel</Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Room Conflicts Detected:</strong> {conflicts.length} scheduling conflicts found. 
            Please review room allocations to resolve overlapping bookings.
          </AlertDescription>
        </Alert>
      )}

      {/* Room Allocation Schedule */}
      {selectedRoom && (
        <Card>
          <CardHeader>
            <CardTitle>{selectedRoom.name} - Weekly Schedule</CardTitle>
            <CardDescription>
              {selectedRoom.type || 'Other'} • Capacity: {selectedRoom.capacity || '-'} students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-200">
                <thead>
                  <tr>
                    <th className="border border-gray-200 p-2 bg-gray-50 w-32">Time</th>
                    {weekDays.map((day) => (
                      <th key={day} className="border border-gray-200 p-2 bg-gray-50 min-w-40">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((timeSlot) => (
                    <tr key={timeSlot}>
                      <td className="border border-gray-200 p-2 font-medium text-sm bg-gray-50">
                        {timeSlot}
                      </td>
                      {weekDays.map((day) => {
                        const allocation = getRoomAllocation(day, timeSlot);
                        const hasConflictHere = hasConflict(selectedRoom.id, day, timeSlot);
                        return (
                          <td key={`${day}-${timeSlot}`} className="border border-gray-200 p-1">
                            {allocation ? (
                              <div className={`h-16 rounded p-2 flex flex-col justify-center ${
                                hasConflictHere 
                                  ? "bg-red-50 border-2 border-red-200" 
                                  : "bg-blue-50 border border-blue-200"
                              }`}>
                                {hasConflictHere && (
                                  <AlertTriangle className="h-3 w-3 text-red-500 mb-1" />
                                )}
                                <div className="text-sm font-medium text-blue-900">
                                  {allocation.class}
                                </div>
                                <div className="text-xs text-blue-700">
                                  {allocation.subject}
                                </div>
                                <div className="text-xs text-blue-600">
                                  {allocation.teacher}
                                </div>
                              </div>
                            ) : (
                              <div className="h-16 bg-gray-50 rounded p-2 flex items-center justify-center">
                                <span className="text-xs text-gray-500">Available</span>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{rooms.length > 0 ? '72%' : '-'}</div>
            <p className="text-xs text-muted-foreground">of available time slots</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{rooms.length}</div>
            <p className="text-xs text-muted-foreground">managed rooms</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">scheduling conflicts</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
