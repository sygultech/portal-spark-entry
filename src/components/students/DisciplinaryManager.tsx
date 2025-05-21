
import { 
  DisciplinaryRecord, 
  IncidentSeverity, 
  IncidentStatus, 
  ParentMeeting,
  DisciplinaryEvidence 
} from "@/types/student";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { incidentTypeOptions } from "@/data/student-form-options";
import { CalendarDays, File, FileText, Plus, Shield, Users } from "lucide-react";

interface DisciplinaryManagerProps {
  records: DisciplinaryRecord[];
  onCreateRecord: (record: Omit<DisciplinaryRecord, "id" | "created_at">) => void;
  onUpdateStatus: (recordId: string, status: IncidentStatus) => void;
  onAddParentMeeting: (recordId: string, meeting: { date: string; notes: string; attendees: string }) => void;
  onAddEvidence: (recordId: string, evidence: { type: string; file: File }) => void;
}

export function DisciplinaryManager({
  records,
  onCreateRecord,
  onUpdateStatus,
  onAddParentMeeting,
  onAddEvidence,
}: DisciplinaryManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<DisciplinaryRecord | null>(null);
  const [formTab, setFormTab] = useState("details");

  // Form states
  const [newRecord, setNewRecord] = useState<{
    incident_type: string;
    description: string;
    date: string;
    severity: IncidentSeverity;
    action_taken?: string;
    reported_by: string;
  }>({
    incident_type: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    severity: "minor",
    action_taken: "",
    reported_by: "",
  });

  const [newMeeting, setNewMeeting] = useState<Partial<ParentMeeting>>({
    date: new Date().toISOString().split("T")[0],
    attendees: "",
    discussion: "",
    outcome: "",
    follow_up_date: "",
  });

  const [newEvidence, setNewEvidence] = useState<{
    type: string;
    file: File | null;
  }>({
    type: "",
    file: null,
  });

  const handleCreateRecord = () => {
    if (!newRecord.incident_type || !newRecord.description || !newRecord.date) return;
    
    onCreateRecord({
      student_id: "",  // Will be set by the backend
      incident_type: newRecord.incident_type,
      description: newRecord.description,
      date: newRecord.date,
      severity: newRecord.severity,
      status: "pending",
      action_taken: newRecord.action_taken,
      reported_by: newRecord.reported_by,
      school_id: "", // Will be set by the backend
    });
    
    setIsOpen(false);
    setNewRecord({
      incident_type: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      severity: "minor",
      action_taken: "",
      reported_by: "",
    });
  };

  const handleAddMeeting = () => {
    if (!selectedRecord) return;
    if (!newMeeting.date || !newMeeting.attendees || !newMeeting.discussion) return;

    onAddParentMeeting(selectedRecord.id, {
      date: newMeeting.date,
      attendees: newMeeting.attendees,
      notes: newMeeting.discussion || ""
    });
    
    setNewMeeting({
      date: new Date().toISOString().split("T")[0],
      attendees: "",
      discussion: "",
      outcome: "",
      follow_up_date: "",
    });
    setFormTab("details");
  };

  const handleAddEvidence = () => {
    if (!selectedRecord || !newEvidence.file || !newEvidence.type) return;

    onAddEvidence(selectedRecord.id, {
      type: newEvidence.type,
      file: newEvidence.file,
    });

    setNewEvidence({
      type: "",
      file: null,
    });
    setFormTab("details");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setNewEvidence({
        ...newEvidence,
        file: files[0],
      });
    }
  };

  // Helper function to get badge variant based on severity
  const getSeverityVariant = (severity: IncidentSeverity) => {
    switch (severity) {
      case "severe":
        return "destructive";
      case "moderate":
        return "secondary";  // Changed from 'warning' to 'secondary'
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Disciplinary Records</h2>
        <Button onClick={() => setIsOpen(true)}>
          <Shield className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/10">
            <p className="text-muted-foreground">No disciplinary records found.</p>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="mt-2">
              Create New Record
            </Button>
          </div>
        ) : (
          records.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {record.incident_type}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        record.status === "resolved"
                          ? "default"
                          : record.status === "escalated"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {record.status}
                    </Badge>
                    <Badge
                      variant={getSeverityVariant(record.severity)}
                    >
                      {record.severity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Description</p>
                    <p>{record.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">Date</p>
                      <p>{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">Reported By</p>
                      <p>{record.reported_by}</p>
                    </div>
                  </div>

                  {record.action_taken && (
                    <div>
                      <p className="text-muted-foreground text-sm">Action Taken</p>
                      <p>{record.action_taken}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setFormTab("meetings");
                      }}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {record.parent_meetings && record.parent_meetings.length > 0
                        ? `${record.parent_meetings.length} Meeting${
                            record.parent_meetings.length > 1 ? "s" : ""
                          }`
                        : "Add Meeting"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedRecord(record);
                        setFormTab("evidence");
                      }}
                    >
                      <File className="h-4 w-4 mr-2" />
                      {record.evidence && record.evidence.length > 0
                        ? `${record.evidence.length} Evidence`
                        : "Add Evidence"}
                    </Button>

                    {record.status === "pending" && (
                      <div className="flex ml-auto gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(record.id, "resolved")}
                        >
                          Mark as Resolved
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onUpdateStatus(record.id, "escalated")}
                        >
                          Escalate
                        </Button>
                      </div>
                    )}

                    {record.status === "escalated" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto"
                        onClick={() => onUpdateStatus(record.id, "resolved")}
                      >
                        Mark as Resolved
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* New Record Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Disciplinary Record</DialogTitle>
            <DialogDescription>
              Create a new disciplinary record for a student.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="incident_type">Incident Type</Label>
              <Select
                value={newRecord.incident_type}
                onValueChange={(val) =>
                  setNewRecord({ ...newRecord, incident_type: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select incident type" />
                </SelectTrigger>
                <SelectContent>
                  {incidentTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={newRecord.date}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, date: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select
                value={newRecord.severity}
                onValueChange={(val: IncidentSeverity) =>
                  setNewRecord({ ...newRecord, severity: val })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minor">Minor</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRecord.description}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, description: e.target.value })
                }
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="action_taken">Action Taken (Optional)</Label>
              <Textarea
                id="action_taken"
                value={newRecord.action_taken}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, action_taken: e.target.value })
                }
                rows={2}
                placeholder="Describe any immediate actions taken"
              />
            </div>

            <div>
              <Label htmlFor="reported_by">Reported By</Label>
              <Input
                id="reported_by"
                value={newRecord.reported_by}
                onChange={(e) =>
                  setNewRecord({ ...newRecord, reported_by: e.target.value })
                }
                placeholder="Name of the person reporting"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateRecord}>Create Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record Details Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Disciplinary Record Details</DialogTitle>
          </DialogHeader>

          <Tabs value={formTab} onValueChange={setFormTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="meetings">Parent Meetings</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
            </TabsList>

            {selectedRecord && (
              <>
                <TabsContent value="details" className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Incident Information</h3>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-muted-foreground text-sm">Incident Type</p>
                        <p>{selectedRecord.incident_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Date</p>
                        <p>{new Date(selectedRecord.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Severity</p>
                        <Badge
                          variant={getSeverityVariant(selectedRecord.severity)}
                        >
                          {selectedRecord.severity}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Status</p>
                        <Badge
                          variant={
                            selectedRecord.status === "resolved"
                              ? "default"
                              : selectedRecord.status === "escalated"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {selectedRecord.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-sm">Description</p>
                    <p className="mt-1">{selectedRecord.description}</p>
                  </div>

                  {selectedRecord.action_taken && (
                    <div>
                      <p className="text-muted-foreground text-sm">Action Taken</p>
                      <p className="mt-1">{selectedRecord.action_taken}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="meetings" className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Add Parent Meeting</h3>
                    <div className="space-y-4 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="meeting-date">Meeting Date</Label>
                          <Input
                            id="meeting-date"
                            type="date"
                            value={newMeeting.date}
                            onChange={(e) =>
                              setNewMeeting({ ...newMeeting, date: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="meeting-followup">Follow-up Date (Optional)</Label>
                          <Input
                            id="meeting-followup"
                            type="date"
                            value={newMeeting.follow_up_date}
                            onChange={(e) =>
                              setNewMeeting({ ...newMeeting, follow_up_date: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="meeting-attendees">Attendees</Label>
                        <Input
                          id="meeting-attendees"
                          placeholder="Names of attendees"
                          value={newMeeting.attendees}
                          onChange={(e) =>
                            setNewMeeting({ ...newMeeting, attendees: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="meeting-discussion">Discussion</Label>
                        <Textarea
                          id="meeting-discussion"
                          placeholder="Summary of discussion"
                          value={newMeeting.discussion}
                          onChange={(e) =>
                            setNewMeeting({ ...newMeeting, discussion: e.target.value })
                          }
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label htmlFor="meeting-outcome">Outcome (Optional)</Label>
                        <Textarea
                          id="meeting-outcome"
                          placeholder="Result and decisions"
                          value={newMeeting.outcome}
                          onChange={(e) =>
                            setNewMeeting({ ...newMeeting, outcome: e.target.value })
                          }
                          rows={2}
                        />
                      </div>

                      <Button onClick={handleAddMeeting}>Add Meeting</Button>
                    </div>
                  </div>

                  {selectedRecord.parent_meetings && selectedRecord.parent_meetings.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Meeting History</h3>
                      <div className="space-y-4">
                        {selectedRecord.parent_meetings.map((meeting) => (
                          <Card key={meeting.id}>
                            <CardHeader className="py-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <CalendarDays className="h-4 w-4 mr-2" />
                                  <span>
                                    {new Date(meeting.date).toLocaleDateString()}
                                  </span>
                                </div>
                                {meeting.follow_up_date && (
                                  <Badge variant="outline">
                                    Follow-up: {new Date(meeting.follow_up_date).toLocaleDateString()}
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-muted-foreground text-sm">Attendees</p>
                              <p className="mb-2">{meeting.attendees}</p>
                              <p className="text-muted-foreground text-sm">Discussion</p>
                              <p className="mb-2">{meeting.discussion}</p>
                              {meeting.outcome && (
                                <>
                                  <p className="text-muted-foreground text-sm">Outcome</p>
                                  <p>{meeting.outcome}</p>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="evidence" className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Add Evidence</h3>
                    <div className="space-y-4 mt-2">
                      <div>
                        <Label htmlFor="evidence-type">Type</Label>
                        <Input
                          id="evidence-type"
                          placeholder="E.g., Photo, Video, Document, Statement"
                          value={newEvidence.type}
                          onChange={(e) =>
                            setNewEvidence({ ...newEvidence, type: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="evidence-file">File</Label>
                        <Input
                          id="evidence-file"
                          type="file"
                          onChange={handleFileChange}
                        />
                      </div>

                      <Button
                        onClick={handleAddEvidence}
                        disabled={!newEvidence.type || !newEvidence.file}
                      >
                        Upload Evidence
                      </Button>
                    </div>
                  </div>

                  {selectedRecord.evidence && selectedRecord.evidence.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-semibold mb-2">Evidence Files</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedRecord.evidence.map((item) => (
                          <Card key={item.id}>
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center">
                                <FileText className="h-8 w-8 mr-3" />
                                <div>
                                  <p className="font-medium">{item.type}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {item.uploaded_at && new Date(item.uploaded_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a
                                  href={item.file_path}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View
                                </a>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// force update
