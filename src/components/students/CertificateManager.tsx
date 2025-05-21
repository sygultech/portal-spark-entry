
import { Certificate } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  fields: {
    name: string;
    type: "text" | "date" | "number";
    required: boolean;
    label: string;
  }[];
}

interface CertificateManagerProps {
  certificates: Certificate[];
  templates: CertificateTemplate[];
  onCreateCertificate: (certificate: Certificate) => void;
  onUpdateStatus: (certificateId: string, status: Certificate['status']) => void;
  onRevoke: (certificateId: string) => void;
  currentUser: string;
}

export function CertificateManager({
  certificates,
  templates,
  onCreateCertificate,
  onUpdateStatus,
  onRevoke,
  currentUser,
}: CertificateManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      setFormData({});
    }
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleCreate = () => {
    if (!selectedTemplate) return;

    const certificate: Certificate = {
      id: Date.now().toString(),
      type: selectedTemplate.name,
      template_id: selectedTemplate.id,
      student_id: "", // This should be set to the current student's ID
      issued_date: new Date().toISOString(),
      serial_number: `CERT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      status: "draft",
      issued_by: currentUser,
      data: formData,
      school_id: ""
    };

    onCreateCertificate(certificate);
    setDialogOpen(false);
    setSelectedTemplate(null);
    setFormData({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Certificates</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Certificate
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {certificates.map((certificate) => (
          <Card key={certificate.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {certificate.type}
              </CardTitle>
              <Badge
                variant={
                  certificate.status === "issued"
                    ? "success"
                    : certificate.status === "revoked"
                    ? "destructive"
                    : "secondary"
                }
              >
                {certificate.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Serial Number</span>
                  <span>{certificate.serial_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issued Date</span>
                  <span>{new Date(certificate.issued_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Issued By</span>
                  <span>{certificate.issued_by}</span>
                </div>
                {certificate.valid_until && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valid Until</span>
                    <span>{new Date(certificate.valid_until).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm text-muted-foreground">Certificate Data</p>
                <div className="border rounded-lg p-2 space-y-1">
                  {certificate.data && Object.entries(certificate.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-muted-foreground capitalize">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span>{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" asChild>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <FileText className="w-4 h-4 mr-2" />
                    View
                  </a>
                </Button>
                {certificate.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => onUpdateStatus(certificate.id, "issued")}
                  >
                    Issue
                  </Button>
                )}
                {certificate.status === "issued" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onRevoke(certificate.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Certificate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Certificate Type</Label>
              <Select
                value={selectedTemplate?.id}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplate && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate.description}
                </p>

                {selectedTemplate.fields.map((field) => (
                  <div key={field.name}>
                    <Label>
                      {field.label}
                      {field.required && <span className="text-red-500">*</span>}
                    </Label>
                    {field.type === "date" ? (
                      <Input
                        type="date"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    ) : field.type === "number" ? (
                      <Input
                        type="number"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    ) : (
                      <Input
                        type="text"
                        value={formData[field.name] || ""}
                        onChange={(e) => handleFieldChange(field.name, e.target.value)}
                        required={field.required}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!selectedTemplate || !Object.keys(formData).length}
            >
              Create Certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// force update

// force update
