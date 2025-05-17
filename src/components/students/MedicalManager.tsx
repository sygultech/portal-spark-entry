
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, FileEdit, Trash2 } from "lucide-react";
import { useState } from "react";
import { MedicalRecord, MedicalRecordStatus } from "@/types/student";

interface MedicalManagerProps {
  records: MedicalRecord[];
  onAddRecord: (record: Omit<MedicalRecord, "id" | "last_updated">) => void;
  onUpdateRecord: (id: string, record: Partial<MedicalRecord>) => void;
  onDeleteRecord: (id: string) => void;
}

export function MedicalManager({
  records,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}: MedicalManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newRecord = {
      student_id: formData.get("student_id") as string,
      condition: formData.get("condition") as string,
      diagnosis: formData.get("diagnosis") as string,
      medication: formData.get("medication") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      status: formData.get("status") as MedicalRecordStatus,
      notes: formData.get("notes") as string,
      school_id: "", // Will be set by the service
    };

    onAddRecord(newRecord);
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Medical Records</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Medical Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Medical Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="condition">Medical Condition</Label>
                  <Input
                    id="condition"
                    name="condition"
                    placeholder="Enter medical condition"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    name="diagnosis"
                    placeholder="Enter diagnosis"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medication">Medication</Label>
                  <Input
                    id="medication"
                    name="medication"
                    placeholder="Enter prescribed medication"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    name="status"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="resolved">Resolved</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Enter additional notes"
                  className="min-h-[100px]"
                />
              </div>
              <input type="hidden" name="student_id" value="" />
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
          <h3 className="font-semibold mb-2">Active Conditions</h3>
          <p className="text-2xl font-bold">
            {records.filter((r) => r.status === "active").length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Ongoing Treatments</h3>
          <p className="text-2xl font-bold">
            {records.filter((r) => r.status === "ongoing").length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Resolved Cases</h3>
          <p className="text-2xl font-bold">
            {records.filter((r) => r.status === "resolved").length}
          </p>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Condition</TableHead>
            <TableHead>Diagnosis</TableHead>
            <TableHead>Medication</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.condition}</TableCell>
              <TableCell>{record.diagnosis}</TableCell>
              <TableCell>{record.medication}</TableCell>
              <TableCell>{new Date(record.start_date).toLocaleDateString()}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-sm ${
                  record.status === "active"
                    ? "bg-green-100 text-green-800"
                    : record.status === "resolved"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {record.status?.charAt(0).toUpperCase() + record.status?.slice(1)}
                </span>
              </TableCell>
              <TableCell>{new Date(record.last_updated).toLocaleDateString()}</TableCell>
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
                    onClick={() => onDeleteRecord(record.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
