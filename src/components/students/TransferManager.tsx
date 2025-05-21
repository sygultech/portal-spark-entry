
import { TransferRecord, StudentDocument } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

interface TransferManagerProps {
  transfers: TransferRecord[];
  onCreateTransfer: (transfer: TransferRecord) => void;
  onUpdateStatus: (transferId: string, status: TransferRecord['status']) => void;
  onAddDocument: (transferId: string, document: StudentDocument) => void;
  batches: { id: string; name: string }[];
}

export function TransferManager({
  transfers,
  onCreateTransfer,
  onUpdateStatus,
  onAddDocument,
  batches,
}: TransferManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTransfer, setNewTransfer] = useState<Partial<TransferRecord>>({
    type: "internal",
    status: "pending",
    date: new Date().toISOString().split("T")[0],
  });
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFile(files[0]);
    }
  };

  const handleCreate = () => {
    if (!newTransfer.type || !newTransfer.date || !newTransfer.reason) return;

    const transfer: TransferRecord = {
      id: Date.now().toString(),
      student_id: "", // This will be filled by backend
      type: newTransfer.type,
      date: newTransfer.date,
      reason: newTransfer.reason || "",
      status: "pending",
      from_batch_id: newTransfer.from_batch_id,
      to_batch_id: newTransfer.to_batch_id,
      to_school: newTransfer.to_school,
      tc_number: newTransfer.tc_number,
      school_id: "", // This will be filled by backend
      documents: [],
    };

    if (file) {
      const document: StudentDocument = {
        id: Date.now().toString(),
        student_id: "", // This will be filled by backend
        type: "transfer_certificate",
        name: file.name,
        file_path: URL.createObjectURL(file),
        verification_status: "pending",
        school_id: "", // This will be filled by backend
      };
      transfer.documents = [document];
    }

    onCreateTransfer(transfer);
    setDialogOpen(false);
    setNewTransfer({
      type: "internal",
      status: "pending",
      date: new Date().toISOString().split("T")[0],
    });
    setFile(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Transfer Records</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {transfers.map((transfer) => (
          <Card key={transfer.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {transfer.type === "internal" ? "Internal Transfer" : "External Transfer"}
              </CardTitle>
              <Badge
                variant={
                  transfer.status === "completed"
                    ? "success"
                    : transfer.status === "rejected"
                    ? "destructive"
                    : "secondary"
                }
              >
                {transfer.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{new Date(transfer.date).toLocaleDateString()}</span>
                </div>
                {transfer.type === "internal" ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">From Batch</span>
                      <span>{transfer.from_batch_id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To Batch</span>
                      <span>{transfer.to_batch_id}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">To School</span>
                    <span>{transfer.to_school}</span>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Reason</span>
                  <p className="mt-1">{transfer.reason}</p>
                </div>
                {transfer.tc_number && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">TC Number</span>
                    <span>{transfer.tc_number}</span>
                  </div>
                )}
              </div>
              {transfer.documents && transfer.documents.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Documents</p>
                  <div className="flex gap-2">
                    {transfer.documents.map((doc) => (
                      <Button key={doc.id} variant="outline" size="sm" asChild>
                        <a href={doc.file_path} target="_blank" rel="noopener noreferrer">
                          <FileText className="w-4 h-4 mr-2" />
                          {doc.name}
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              {transfer.status === "pending" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onUpdateStatus(transfer.id, "rejected")}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(transfer.id, "approved")}
                  >
                    Approve
                  </Button>
                </div>
              )}
              {transfer.status === "approved" && (
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(transfer.id, "completed")}
                  >
                    Mark as Completed
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Transfer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Transfer Type</Label>
              <Select
                value={newTransfer.type}
                onValueChange={(value: "internal" | "external") =>
                  setNewTransfer((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Internal Transfer</SelectItem>
                  <SelectItem value="external">External Transfer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={newTransfer.date}
                onChange={(e) =>
                  setNewTransfer((prev) => ({ ...prev, date: e.target.value }))
                }
              />
            </div>

            {newTransfer.type === "internal" ? (
              <>
                <div>
                  <Label>From Batch</Label>
                  <Select
                    value={newTransfer.from_batch_id}
                    onValueChange={(value) =>
                      setNewTransfer((prev) => ({ ...prev, from_batch_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To Batch</Label>
                  <Select
                    value={newTransfer.to_batch_id}
                    onValueChange={(value) =>
                      setNewTransfer((prev) => ({ ...prev, to_batch_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label>To School</Label>
                  <Input
                    value={newTransfer.to_school}
                    onChange={(e) =>
                      setNewTransfer((prev) => ({ ...prev, to_school: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <Label>TC Number</Label>
                  <Input
                    value={newTransfer.tc_number}
                    onChange={(e) =>
                      setNewTransfer((prev) => ({ ...prev, tc_number: e.target.value }))
                    }
                  />
                </div>
              </>
            )}

            <div>
              <Label>Reason</Label>
              <Textarea
                value={newTransfer.reason}
                onChange={(e) =>
                  setNewTransfer((prev) => ({ ...prev, reason: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Supporting Document</Label>
              <Input type="file" onChange={handleFileChange} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Transfer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// force update
