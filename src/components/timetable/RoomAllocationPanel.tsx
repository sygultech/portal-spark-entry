
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, MapPin, AlertTriangle } from "lucide-react";

// Mock data
const mockRooms = [
  { 
    id: "room-101", 
    name: "Room 101", 
    type: "Classroom", 
    capacity: 35,
    facilities: ["Projector", "Whiteboard", "AC"]
  },
  { 
    id: "room-102", 
    name: "Room 102", 
    type: "Classroom", 
    capacity: 30,
    facilities: ["Whiteboard", "AC"]
  },
  { 
    id: "lab-sci", 
    name: "Science Lab", 
    type: "Laboratory", 
    capacity: 25,
    facilities: ["Lab Equipment", "Projector", "Fume Hood"]
  },
  { 
    id: "lab-comp", 
    name: "Computer Lab", 
    type: "Laboratory", 
    capacity: 30,
    facilities: ["Computers", "Projector", "AC"]
  },
  { 
    id: "gym", 
    name: "Gymnasium", 
    type: "Sports", 
    capacity: 50,
    facilities: ["Sports Equipment", "Sound System"]
  },
];

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

// Mock room allocation data
const mockRoomAllocations: any = {
  "room-101": {
    "Monday": {
      "08:00 - 08:45": { class: "Class 6A", subject: "Math", teacher: "Ms. Johnson" },
      "08:45 - 09:30": { class: "Class 6B", subject: "English", teacher: "Mr. Smith" },
      "10:30 - 11:15": { class: "Class 7A", subject: "History", teacher: "Ms. Davis" },
    },
    "Tuesday": {
      "09:30 - 10:15": { class: "Class 6A", subject: "Science", teacher: "Dr. Brown" },
      "11:15 - 12:00": { class: "Class 7B", subject: "Math", teacher: "Ms. Johnson" },
    },
  },
  "lab-sci": {
    "Wednesday": {
      "10:30 - 11:15": { class: "Class 7A", subject: "Science", teacher: "Dr. Brown" },
      "11:15 - 12:00": { class: "Class 7B", subject: "Science", teacher: "Dr. Brown" },
    },
  },
};

export const RoomAllocationPanel = () => {
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>(["room-101-monday-0800"]);

  const getRoomAllocation = (day: string, timeSlot: string) => {
    return mockRoomAllocations[selectedRoom.id]?.[day]?.[timeSlot];
  };

  const hasConflict = (roomId: string, day: string, timeSlot: string) => {
    const conflictKey = `${roomId}-${day.toLowerCase()}-${timeSlot.replace(/[^0-9]/g, '')}`;
    return conflicts.includes(conflictKey);
  };

  const getRoomTypeColor = (type: string) => {
    switch (type) {
      case "Classroom": return "bg-blue-100 text-blue-800";
      case "Laboratory": return "bg-purple-100 text-purple-800";
      case "Sports": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRooms.map((room) => (
              <Card 
                key={room.id} 
                className={`cursor-pointer transition-colors ${
                  selectedRoom.id === room.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedRoom(room)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {room.name}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <Badge className={getRoomTypeColor(room.type)}>
                      {room.type}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Capacity: {room.capacity} students
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map((facility, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

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
      <Card>
        <CardHeader>
          <CardTitle>{selectedRoom.name} - Weekly Schedule</CardTitle>
          <CardDescription>
            {selectedRoom.type} • Capacity: {selectedRoom.capacity} students
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

      {/* Room Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Utilization Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">72%</div>
            <p className="text-xs text-muted-foreground">of available time slots</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockRooms.length}</div>
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
