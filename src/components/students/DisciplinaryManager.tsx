import { DisciplinaryRecord, ParentMeeting } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Plus, Shield, Users, FileEdit, Trash2, UserRound } from "lucide-react";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DisciplinaryManagerProps {
  records: DisciplinaryRecord[];
  onCreateRecord: (record: Omit<DisciplinaryRecord, "id" | "createdAt">) => void;
  onUpdateStatus: (id: string, status: DisciplinaryRecord["status"]) => void;
  onAddParentMeeting: (recordId: string, meeting: { date: string; notes: string }) => void;
  onAddEvidence: (recordId: string, evidence: { type: string; file: File }) => void;
}

export function DisciplinaryManager({
  records,
  onCreateRecord,
  onUpdateStatus,
  onAddParentMeeting,
  onAddEvidence,
}: DisciplinaryManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [newRecord, setNewRecord] = useState<Partial<DisciplinaryRecord>>({
    status: "pending",
    date: new Date().toISOString().split("T")[0],
  });
  const [newMeeting, setNewMeeting] = useState<Partial<ParentMeeting>>({
    date: new Date().toISOString().split("T")[0],
    attendees: [],
  });

  const incidentTypes = [
    "Behavioral",
    "Academic Dishonesty",
    "Attendance",
    "Bullying",
    "Vandalism",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newRecord = {
      studentId: formData.get("studentId") as string,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
      date: formData.get("date") as string,
      severity: formData.get("severity") as "minor" | "moderate" | "severe",
      status: "pending" as const,
      actionTaken: formData.get("actionTaken") as string,
      reportedBy: formData.get("reportedBy") as string,
    };

    onCreateRecord(newRecord);
    setIsAddDialogOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const handleAddMeeting = () => {
    if (!selectedRecord || !newMeeting.discussion || !newMeeting.outcome) return;

    const meeting: ParentMeeting = {
      id: Date.now().toString(),
      date: newMeeting.date || new Date().toISOString(),
      attendees: newMeeting.attendees || [],
      discussion: newMeeting.discussion,
      outcome: newMeeting.outcome,
      followUpDate: newMeeting.followUpDate,
    };

    onAddParentMeeting(selectedRecord.id, meeting);
    setMeetingDialogOpen(false);
    setNewMeeting({
      date: new Date().toISOString().split("T")[0],
      attendees: [],
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Disciplinary Records</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Disciplinary Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Incident Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select incident type" />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date of Incident</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select name="severity" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="minor">Minor</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="severe">Severe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportedBy">Reported By</Label>
                  <Input
                    id="reportedBy"
                    name="reportedBy"
                    placeholder="Enter reporter's name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the incident"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actionTaken">Action Taken</Label>
                <Textarea
                  id="actionTaken"
                  name="actionTaken"
                  placeholder="Describe the action taken"
                  className="min-h-[100px]"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total Incidents</h3>
          <p className="text-2xl font-bold">{records.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Pending Resolution</h3>
          <p className="text-2xl font-bold">
            {records.filter((r) => r.status === "pending").length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Severe Incidents</h3>
          <p className="text-2xl font-bold">
            {records.filter((r) => r.severity === "severe").length}
          </p>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
              <TableCell>{record.type}</TableCell>
              <TableCell className="max-w-[300px] truncate">
                {record.description}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    record.severity === "severe"
                      ? "bg-red-100 text-red-800"
                      : record.severity === "moderate"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    record.status === "resolved"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>{record.reportedBy}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Implement edit functionality
                    }}
                  >
                    <FileEdit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedRecord(record);
                      setMeetingDialogOpen(true);
                    }}
                  >
                    <UserRound className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      // Implement delete functionality
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Parent Meeting Dialog */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Parent Meeting</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newMeeting.date}
                onChange={(e) =>
                  setNewMeeting((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Attendees (comma-separated)</Label>
              <Input
                value={newMeeting.attendees?.join(", ")}
                onChange={(e) =>
                  setNewMeeting((prev) => ({
                    ...prev,
                    attendees: e.target.value.split(",").map((s) => s.trim()),
                  }))
                }
              />
            </div>

            <div>
              <Label>Discussion</Label>
              <Textarea
                value={newMeeting.discussion}
                onChange={(e) =>
                  setNewMeeting((prev) => ({ ...prev, discussion: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Outcome</Label>
              <Textarea
                value={newMeeting.outcome}
                onChange={(e) =>
                  setNewMeeting((prev) => ({ ...prev, outcome: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Follow-up Date (optional)</Label>
              <Input
                type="date"
                value={newMeeting.followUpDate}
                onChange={(e) =>
                  setNewMeeting((prev) => ({ ...prev, followUpDate: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMeetingDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMeeting}>Add Meeting</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 