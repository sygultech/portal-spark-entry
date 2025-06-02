import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2, MapPin, AlertTriangle, Monitor, FlaskConical, Dumbbell } from "lucide-react";

interface RoomAllocationProps {
  selectedTerm: string;
}

const timeSlots = [
  "08:00 - 08:45", "08:45 - 09:30", "09:30 - 10:15",
  "10:30 - 11:15", "11:15 - 12:00", "12:00 - 12:45",
  "13:30 - 14:15", "14:15 - 15:00",
];

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const mockRooms = [
  { id: "room-1", name: "Room 101", capacity: 30, type: "Classroom" },
  { id: "room-2", name: "Room 102", capacity: 25, type: "Classroom" },
  { id: "room-3", name: "Science Lab", capacity: 20, type: "Laboratory" },
  { id: "room-4", name: "Computer Lab", capacity: 25, type: "Laboratory" },
];

const mockRoomAllocations: any = {
  "room-1": {
    "Monday": {
      "08:00": { class: "Class 6A", subject: "Mathematics" },
      "09:00": { class: "Class 7B", subject: "Science" },
    },
    "Tuesday": {
      "10:00": { class: "Class 6B", subject: "English" },
    },
  },
  "room-2": {
    "Monday": {
      "11:00": { class: "Class 7A", subject: "History" },
    },
  },
};

export const RoomAllocation = ({ selectedTerm }: RoomAllocationProps) => {
  const [selectedRoom, setSelectedRoom] = useState(mockRooms[0]);
  const [isAddingAllocation, setIsAddingAllocation] = useState(false);

  const getRoomAllocation = (day: string, timeSlot: string) => {
    return mockRoomAllocations[selectedRoom.id]?.[day]?.[timeSlot];
  };

  const handleAddAllocation = () => {
    setIsAddingAllocation(true);
  };

  const handleDeleteAllocation = (day: string, timeSlot: string) => {
    // Implementation for deleting allocation
    console.log("Deleting allocation:", { day, timeSlot });
  };

  const handleEditAllocation = (day: string, timeSlot: string) => {
    // Implementation for editing allocation
    console.log("Editing allocation:", { day, timeSlot });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Room Allocation
            </div>
            <Button onClick={handleAddAllocation} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Allocation
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Room Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Select Room</h3>
              <div className="space-y-2">
                {mockRooms.map((room) => (
                  <div
                    key={room.id}
                    className={`p-3 rounded-lg border cursor-pointer ${
                      selectedRoom.id === room.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="font-medium">{room.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {room.type} • {room.capacity} seats
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Schedule */}
            <div className="md:col-span-3">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-muted">Time</th>
                      {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => (
                        <th key={day} className="border p-2 bg-muted">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00"].map((timeSlot) => (
                      <tr key={timeSlot}>
                        <td className="border p-2 font-medium">{timeSlot}</td>
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].map((day) => {
                          const allocation = getRoomAllocation(day, timeSlot);
                          return (
                            <td key={day} className="border p-2">
                              {allocation ? (
                                <div className="space-y-1">
                                  <div className="font-medium">{allocation.class}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {allocation.subject}
                                  </div>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => handleEditAllocation(day, timeSlot)}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 text-destructive"
                                      onClick={() => handleDeleteAllocation(day, timeSlot)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-muted-foreground text-sm">Available</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
