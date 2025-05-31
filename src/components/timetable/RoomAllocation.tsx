
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, MapPin, AlertTriangle, Monitor, FlaskConical, Dumbbell } from "lucide-react";

interface RoomAllocationProps {
  selectedTerm: string;
}

// Mock room data
const mockRooms = [
  { 
    id: "room-101", 
    name: "Room 101", 
    type: "Classroom", 
    capacity: 35,
    facilities: ["Projector", "Whiteboard", "AC"],
    icon: Monitor
  },
  { 
    id: "room-102", 
    name: "Room 102", 
    type: "Classroom", 
    capacity: 30,
    facilities: ["Whiteboard", "AC"],
    icon: Monitor
  },
  { 
    id: "lab-sci", 
    name: "Science Lab", 
    type: "Laboratory", 
    capacity: 25,
    facilities: ["Lab Equipment", "Projector", "Fume Hood"],
    icon: FlaskConical
  },
  { 
    id: "lab-comp", 
    name: "Computer Lab", 
    type: "Laboratory", 
    capacity: 30,
    facilities: ["Computers", "Projector", "AC"],
    icon: Monitor
  },
  { 
    id: "gym", 
    name: "Gymnasium", 
    type: "Sports", 
    capacity: 50,
    facilities: ["Sports Equipment", "Sound System"],
    icon: Dumbbell
  },
];

const timeSlots = [
  "08:00 - 08:45", "08:45 - 09:30", "09:30 - 10:15",
  "10:30 - 11:15", "11:15 - 12:00", "12:00 - 12:45",
  "13:30 - 14:15", "14:15 - 15:00",
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

// Mock room allocation data
const mockRoomAllocations: any = {
  "room-101": {
    "Monday": {
      "08:00 - 08:45": { class: "Grade 6A", subject: "Math", teacher: "Ms. Johnson" },
      "08:45 - 09:30": { class: "Grade 6B", subject: "English", teacher: "Mr. Smith" },
      "10:30 - 11:15": { class: "Grade 7A", subject: "History", teacher: "Ms. Davis" },
    },
  },
  "lab-sci": {
    "Wednesday": {
      "10:30 - 11:15": { class: "Grade 7A", subject: "Science", teacher: "Dr. Brown" },
      "11:15 - 12:00": { class: "Grade 7B", subject: "Science", teacher: "Dr. Brown" },
    },
  },
};

export const RoomAllocation = ({ selectedTerm }: RoomAllocationProps) => {
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]);
  const [conflicts, setConflicts] = useState<string[]>(["room-101-monday-0800"]);
  const [filterType, setFilterType] = useState<string>("all");

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

  const getUtilizationRate = (roomId: string) => {
    const totalSlots = weekDays.length * timeSlots.length;
    const usedSlots = Object.keys(mockRoomAllocations[roomId] || {}).reduce((acc, day) => {
      return acc + Object.keys(mockRoomAllocations[roomId][day] || {}).length;
    }, 0);
    return Math.round((usedSlots / totalSlots) * 100);
  };

  const filteredRooms = filterType === "all" 
    ? mockRooms 
    : mockRooms.filter(room => room.type === filterType);

  return (
    <div className="space-y-6">
      {/* Room Type Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Room Allocation Management
            <div className="flex gap-2">
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="all">All Room Types</option>
                <option value="Classroom">Classrooms</option>
                <option value="Laboratory">Laboratories</option>
                <option value="Sports">Sports Facilities</option>
              </select>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Manage room allocations and prevent double-booking for {selectedTerm}
          </CardDescription>
        </CardHeader>
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

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRooms.map((room) => {
          const Icon = room.icon;
          const utilization = getUtilizationRate(room.id);
          
          return (
            <Card 
              key={room.id} 
              className={`cursor-pointer transition-colors hover:shadow-md ${
                selectedRoom.id === room.id ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {room.name}
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge className={getRoomTypeColor(room.type)}>
                      {room.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Capacity: {room.capacity}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilization</span>
                      <span className={`font-medium ${
                        utilization >= 80 ? "text-red-600" :
                        utilization >= 60 ? "text-orange-600" : "text-green-600"
                      }`}>
                        {utilization}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          utilization >= 80 ? "bg-red-500" :
                          utilization >= 60 ? "bg-orange-500" : "bg-green-500"
                        }`}
                        style={{ width: `${utilization}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium mb-1">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.map((facility, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {facility}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Room Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {selectedRoom.name} - Weekly Schedule
          </CardTitle>
          <CardDescription>
            {selectedRoom.type} • Capacity: {selectedRoom.capacity} students • Utilization: {getUtilizationRate(selectedRoom.id)}%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr>
                  <th className="border border-gray-200 p-3 bg-gray-50 w-32 text-left">Time</th>
                  {weekDays.map((day) => (
                    <th key={day} className="border border-gray-200 p-3 bg-gray-50 min-w-40 text-left">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((timeSlot) => (
                  <tr key={timeSlot}>
                    <td className="border border-gray-200 p-3 font-medium text-sm bg-gray-50">
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

      {/* Room Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{mockRooms.length}</div>
            <p className="text-xs text-muted-foreground">managed facilities</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Average Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">68%</div>
            <p className="text-xs text-muted-foreground">across all rooms</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Conflicts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{conflicts.length}</div>
            <p className="text-xs text-muted-foreground">require resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Available Now</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
            <p className="text-xs text-muted-foreground">rooms free this period</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
