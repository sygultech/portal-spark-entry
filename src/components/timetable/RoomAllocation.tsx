import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, MapPin, Search, Filter, Building, Users, Settings, Calendar } from "lucide-react";
import { AcademicYearSelector } from "./components/AcademicYearSelector";
import { RoomManagementDialog } from "./components/RoomManagementDialog";
import { RoomAllocationDialog } from "./components/RoomAllocationDialog";
import { useAcademicYearSelector } from "@/hooks/useAcademicYearSelector";
import { useRooms, Room } from "@/hooks/useRooms";
import { useRoomAllocations, RoomAllocationData } from "@/hooks/useRoomAllocations";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";

interface RoomAllocationProps {
  selectedTerm: string;
}

export const RoomAllocation = ({ selectedTerm }: RoomAllocationProps) => {
  const { profile } = useAuth();
  const { 
    academicYears, 
    selectedAcademicYear, 
    setSelectedAcademicYear, 
    selectedYear,
    isLoading: academicYearLoading 
  } = useAcademicYearSelector();

  const { rooms, isLoading, fetchRooms, addRoom, updateRoom, deleteRoom } = useRooms(profile?.school_id || '');
  const { allocations, isLoading: allocationsLoading, fetchAllocations, addAllocation } = useRoomAllocations(profile?.school_id || '');
  
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomDialogOpen, setRoomDialogOpen] = useState(false);
  const [roomDialogMode, setRoomDialogMode] = useState<'create' | 'edit'>('create');
  const [allocationDialogOpen, setAllocationDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  useEffect(() => {
    if (profile?.school_id) {
      fetchRooms();
      if (selectedYear?.id) {
        fetchAllocations(selectedYear.id, selectedTerm);
      }
    }
  }, [profile?.school_id, selectedYear?.id, selectedTerm, fetchRooms, fetchAllocations]);

  // Filter rooms based on search and type
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || room.type === typeFilter;
    return matchesSearch && matchesType;
  });

  // Get unique room types for filter
  const roomTypes = Array.from(new Set(rooms.map(room => room.type).filter(Boolean)));

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setRoomDialogMode('create');
    setRoomDialogOpen(true);
  };

  const handleAddAllocation = () => {
    setAllocationDialogOpen(true);
  };

  const handleEditRoom = (room: Room) => {
    setSelectedRoom(room);
    setRoomDialogMode('edit');
    setRoomDialogOpen(true);
  };

  const handleSaveRoom = async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const roomWithSchool = {
        ...roomData,
        school_id: profile?.school_id || ''
      };

      if (roomDialogMode === 'create') {
        await addRoom(roomWithSchool);
      } else if (selectedRoom) {
        await updateRoom(selectedRoom.id, roomData);
      }
    } catch (error) {
      console.error('Error saving room:', error);
    }
  };

  const handleSaveAllocation = async (allocationData: RoomAllocationData) => {
    try {
      const allocationWithDetails = {
        ...allocationData,
        school_id: profile?.school_id || '',
        academic_year_id: selectedYear?.id || '',
        term: selectedTerm
      };

      await addAllocation(allocationWithDetails);
    } catch (error) {
      console.error('Error saving allocation:', error);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    try {
      await deleteRoom(room.id);
      setRoomToDelete(null);
    } catch (error) {
      console.error('Error deleting room:', error);
    }
  };

  const getRoomUtilization = (room: Room) => {
    // Calculate utilization based on actual allocations
    const roomAllocations = allocations.filter(allocation => allocation.room_id === room.id);
    const totalSlots = 30; // 5 days × 6 periods (adjust based on your schedule)
    return Math.round((roomAllocations.length / totalSlots) * 100);
  };

  const getRoomStatusColor = (utilization: number) => {
    if (utilization >= 80) return "bg-red-100 text-red-800";
    if (utilization >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  const getRoomAllocationsCount = (room: Room) => {
    return allocations.filter(allocation => allocation.room_id === room.id).length;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Room Management & Allocation
              </div>
              <AcademicYearSelector
                academicYears={academicYears}
                selectedAcademicYear={selectedAcademicYear}
                onAcademicYearChange={setSelectedAcademicYear}
                isLoading={academicYearLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAllocation} size="sm" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Add Allocation
              </Button>
              <Button onClick={handleAddRoom} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage room information and view allocations for {selectedYear?.name || 'the selected academic year'}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search rooms by name, code, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Rooms Table */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No rooms found</p>
              {searchTerm && (
                <p className="text-sm">Try adjusting your search terms</p>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room Details</TableHead>
                    <TableHead>Type & Capacity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Facilities</TableHead>
                    <TableHead>Allocations</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRooms.map((room) => {
                    const utilization = getRoomUtilization(room);
                    const allocationsCount = getRoomAllocationsCount(room);
                    return (
                      <TableRow key={room.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{room.name}</div>
                            {room.code && (
                              <div className="text-sm text-muted-foreground">
                                Code: {room.code}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {room.type && (
                              <Badge variant="outline">{room.type}</Badge>
                            )}
                            {room.capacity && (
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {room.capacity} seats
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {room.location && (
                            <div className="text-sm text-muted-foreground">
                              {room.location}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {room.facilities.slice(0, 2).map((facility) => (
                                <Badge key={facility} variant="secondary" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                              {room.facilities.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{room.facilities.length - 2} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {allocationsCount} slots
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={getRoomStatusColor(utilization)}
                          >
                            {utilization}% utilized
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRoom(room)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Room</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{room.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteRoom(room)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Summary Statistics */}
          {rooms.length > 0 && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Rooms</div>
                  <div className="text-2xl font-bold">{rooms.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Allocations</div>
                  <div className="text-2xl font-bold">{allocations.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Total Capacity</div>
                  <div className="text-2xl font-bold">
                    {rooms.reduce((sum, room) => sum + (room.capacity || 0), 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm font-medium text-muted-foreground">Avg. Utilization</div>
                  <div className="text-2xl font-bold">
                    {rooms.length > 0 ? Math.round(rooms.reduce((sum, room) => sum + getRoomUtilization(room), 0) / rooms.length) : 0}%
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Room Management Dialog */}
      <RoomManagementDialog
        open={roomDialogOpen}
        onOpenChange={setRoomDialogOpen}
        room={selectedRoom}
        onSave={handleSaveRoom}
        mode={roomDialogMode}
      />

      {/* Room Allocation Dialog */}
      <RoomAllocationDialog
        open={allocationDialogOpen}
        onOpenChange={setAllocationDialogOpen}
        rooms={rooms}
        onSave={handleSaveAllocation}
      />
    </div>
  );
};
