
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, CheckCircle, XCircle, Trash2, Download } from "lucide-react";
import { useState } from "react";
import { StudentDocument, DocumentType, DocumentVerificationStatus } from "@/types/student";

interface DocumentManagerProps {
  documents: StudentDocument[];
  onUpload: (document: Omit<StudentDocument, "id" | "upload_date">) => void;
  onDelete: (id: string) => void;
  onVerify: (id: string, status: "verified" | "rejected", verifiedBy: string) => void;
}

export function DocumentManager({
  documents,
  onUpload,
  onDelete,
  onVerify,
}: DocumentManagerProps) {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const documentTypes: DocumentType[] = [
    "Birth Certificate",
    "Previous School Records",
    "Medical Records",
    "Immunization Records",
    "Parent ID",
    "Address Proof",
    "Transfer Certificate",
    "Other",
  ];

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const type = formData.get("type") as string;
    
    if (!type || !documentTypes.includes(type as DocumentType)) {
      return;
    }
    
    const newDocument: Omit<StudentDocument, "id" | "upload_date"> = {
      student_id: formData.get("studentId") as string,
      type: type as string,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      file_path: selectedFile ? URL.createObjectURL(selectedFile) : "",
      verification_status: "pending" as DocumentVerificationStatus,
      school_id: ""
    };

    onUpload(newDocument);
    setIsUploadDialogOpen(false);
    setSelectedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload New Document</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Document Type</Label>
                  <Select name="type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {documentTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Document Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter document name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter document description"
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Upload File</Label>
                <Input
                  id="file"
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Selected file: {selectedFile.name}
                  </p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsUploadDialogOpen(false);
                    setSelectedFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Upload</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Total Documents</h3>
          <p className="text-2xl font-bold">{documents.length}</p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Pending Verification</h3>
          <p className="text-2xl font-bold">
            {documents.filter((d) => d.verification_status === "pending").length}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="font-semibold mb-2">Verified Documents</h3>
          <p className="text-2xl font-bold">
            {documents.filter((d) => d.verification_status === "verified").length}
          </p>
        </Card>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Upload Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Verified By</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.type}</TableCell>
              <TableCell>{doc.name}</TableCell>
              <TableCell>{doc.upload_date ? new Date(doc.upload_date).toLocaleDateString() : "-"}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-sm ${
                    doc.verification_status === "verified"
                      ? "bg-green-100 text-green-800"
                      : doc.verification_status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {doc.verification_status.charAt(0).toUpperCase() +
                    doc.verification_status.slice(1)}
                </span>
              </TableCell>
              <TableCell>{doc.verified_by || "-"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  {doc.verification_status === "pending" && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onVerify(doc.id, "verified", "Admin")}
                      >
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onVerify(doc.id, "rejected", "Admin")}
                      >
                        <XCircle className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(doc.id)}
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

// force update
