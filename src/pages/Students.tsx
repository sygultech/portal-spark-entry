
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "@/components/students/StudentList";
import { StudentFormDialog } from "@/components/students/StudentFormDialog";
import { StudentProfile } from "@/components/students/StudentProfile";
import { DocumentManager } from "@/components/students/DocumentManager";
import { TransferManager } from "@/components/students/TransferManager";
import { DisciplinaryManager } from "@/components/students/DisciplinaryManager";
import { CertificateManager } from "@/components/students/CertificateManager";
import { CategoryManager } from "@/components/students/CategoryManager";
import { MedicalManager } from "@/components/students/MedicalManager";
import { QuickActions } from "@/components/students/QuickActions";
import { 
  Student, 
  StudentDocument, 
  TransferRecord, 
  DisciplinaryRecord, 
  Certificate, 
  StudentCategory, 
  MedicalRecord, 
  DisciplinaryEvidence,
  ParentMeeting
} from "@/types/student";
import { FileText, GraduationCap, Shield, Tag, UserPlus, Heart, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function Students() {
  const [activeTab, setActiveTab] = useState("list");
  const [formOpen, setFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);

  // Sample data - Replace with actual data from your backend
  const [students, setStudents] = useState<Student[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [categories, setCategories] = useState<StudentCategory[]>([]);

  // Sample certificate templates
  const certificateTemplates = [
    {
      id: "1",
      name: "Transfer Certificate",
      description: "Official transfer certificate for students leaving the school",
      fields: [
        { name: "reason", type: "text" as const, required: true, label: "Reason for Transfer" },
        { name: "last_attended_date", type: "date" as const, required: true, label: "Last Date Attended" },
        { name: "conduct", type: "text" as const, required: true, label: "Conduct" },
      ],
    },
    {
      id: "2",
      name: "Character Certificate",
      description: "Certificate attesting to the student's character and conduct",
      fields: [
        { name: "period_from", type: "date" as const, required: true, label: "Period From" },
        { name: "period_to", type: "date" as const, required: true, label: "Period To" },
        { name: "character", type: "text" as const, required: true, label: "Character Description" },
      ],
    },
  ];

  // Sample batches
  const batches = [
    { id: "1", name: "Grade 10A" },
    { id: "2", name: "Grade 10B" },
    { id: "3", name: "Grade 9A" },
  ];

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab("profile");
  };

  const handleCreateStudent = (student: Student) => {
    setStudents((prev) => [...prev, student]);
    setFormOpen(false);
    toast.success("Student added successfully");
  };

  const handleUpdateStudent = (student: Student) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? student : s))
    );
    setSelectedStudent(student);
    toast.success("Student updated successfully");
  };

  const handleBatchAction = (action: string, studentIds: string[]) => {
    switch (action) {
      case "promote":
        toast.success(`${studentIds.length} students promoted`);
        break;
      case "transfer":
        toast.success(`${studentIds.length} students marked for transfer`);
        break;
      case "print":
        toast.success("Generating documents...");
        break;
      default:
        break;
    }
  };

  const handleBulkImport = () => {
    setBulkImportOpen(true);
  };

  const handleExportData = () => {
    toast.success("Exporting student data...");
  };

  // Document management handlers
  const handleUploadDocument = (document: StudentDocument) => {
    setDocuments((prev) => [...prev, document]);
    toast.success("Document uploaded successfully");
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    toast.success("Document deleted successfully");
  };

  const handleVerifyDocument = (
    documentId: string,
    status: "verified" | "rejected",
    verifiedBy: string
  ) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === documentId
          ? {
              ...doc,
              verification_status: status,
              verified_by: verifiedBy,
              verification_date: new Date().toISOString(),
            }
          : doc
      )
    );
    toast.success(`Document ${status}`);
  };

  // Transfer management handlers
  const handleCreateTransfer = (transfer: TransferRecord) => {
    setTransfers((prev) => [...prev, transfer]);
    toast.success("Transfer request created");
  };

  const handleUpdateTransferStatus = (
    transferId: string,
    status: TransferRecord["status"]
  ) => {
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === transferId ? { ...transfer, status } : transfer
      )
    );
    toast.success(`Transfer status updated to ${status}`);
  };

  // Category management handlers
  const handleCreateCategory = (category: StudentCategory) => {
    setCategories((prev) => [...prev, category]);
    toast.success("Category created successfully");
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Quick Actions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Students Management</h1>
        </div>
        
        <QuickActions
          onAddStudent={() => setFormOpen(true)}
          onBulkImport={handleBulkImport}
          onExportData={handleExportData}
          totalStudents={students.length}
          activeStudents={students.filter(s => !s.transfer_records?.some(t => t.status === "completed")).length}
          pendingAdmissions={0} // Replace with actual count
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted">
          <TabsTrigger value="list">List View</TabsTrigger>
          {selectedStudent && <TabsTrigger value="profile">Profile</TabsTrigger>}
          <TabsTrigger value="medical">
            <Heart className="w-4 h-4 mr-2" />
            Medical
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="w-4 h-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="disciplinary">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Disciplinary
          </TabsTrigger>
          <TabsTrigger value="transfers">
            <GraduationCap className="w-4 h-4 mr-2" />
            Transfers
          </TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="categories">
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <StudentList
            students={students}
            onSelect={handleStudentSelect}
            categories={categories}
            onBatchAction={handleBatchAction}
          />
        </TabsContent>

        {selectedStudent && (
          <TabsContent value="profile">
            <StudentProfile student={selectedStudent} onEdit={() => setFormOpen(true)} />
          </TabsContent>
        )}

        <TabsContent value="medical">
          <MedicalManager
            records={medicalRecords}
            onAddRecord={(record) => {
              const newRecord = {
                ...record,
                id: Date.now().toString(),
                lastUpdated: new Date().toISOString(),
              };
              setMedicalRecords((prev) => [...prev, newRecord]);
              toast.success("Medical record added successfully");
            }}
            onUpdateRecord={(id, record) => {
              setMedicalRecords((prev) =>
                prev.map((r) =>
                  r.id === id
                    ? { ...r, ...record, lastUpdated: new Date().toISOString() }
                    : r
                )
              );
              toast.success("Medical record updated successfully");
            }}
            onDeleteRecord={(id) => {
              setMedicalRecords((prev) => prev.filter((r) => r.id !== id));
              toast.success("Medical record deleted successfully");
            }}
          />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentManager
            documents={documents}
            onUpload={handleUploadDocument}
            onDelete={handleDeleteDocument}
            onVerify={handleVerifyDocument}
          />
        </TabsContent>

        <TabsContent value="disciplinary">
          <DisciplinaryManager
            records={disciplinaryRecords}
            onCreateRecord={(record) => {
              const newRecord: DisciplinaryRecord = {
                id: Date.now().toString(),
                student_id: "",
                incident_type: record.incident_type,
                description: record.description,
                date: record.date,
                severity: record.severity,
                status: "pending",
                action_taken: record.action_taken,
                reported_by: record.reported_by,
                school_id: "",
                created_at: new Date().toISOString(),
              };
              setDisciplinaryRecords((prev) => [...prev, newRecord]);
              toast.success("Disciplinary record created successfully");
            }}
            onUpdateStatus={(id, status) => {
              setDisciplinaryRecords((prev) =>
                prev.map((r) => (r.id === id ? { ...r, status } : r))
              );
              toast.success("Status updated successfully");
            }}
            onAddParentMeeting={(recordId, meeting) => {
              const parentMeeting: ParentMeeting = {
                id: Date.now().toString(),
                disciplinary_record_id: recordId,
                date: meeting.date,
                attendees: meeting.attendees,
                discussion: meeting.notes,
                school_id: "",
              };
              
              setDisciplinaryRecords((prev) =>
                prev.map((r) =>
                  r.id === recordId
                    ? {
                        ...r,
                        parent_meetings: [
                          ...(r.parent_meetings || []),
                          parentMeeting
                        ],
                      }
                    : r
                )
              );
              toast.success("Parent meeting added successfully");
            }}
            onAddEvidence={(recordId, evidence) => {
              const newEvidence: DisciplinaryEvidence = {
                id: Date.now().toString(),
                disciplinary_record_id: recordId,
                type: evidence.type,
                file_path: URL.createObjectURL(evidence.file),
                uploaded_at: new Date().toISOString(),
                school_id: "",
              };
              
              setDisciplinaryRecords((prev) =>
                prev.map((r) =>
                  r.id === recordId
                    ? {
                        ...r,
                        evidence: [
                          ...(r.evidence || []),
                          newEvidence
                        ],
                      }
                    : r
                )
              );
              toast.success("Evidence added successfully");
            }}
          />
        </TabsContent>

        <TabsContent value="transfers">
          <TransferManager
            transfers={transfers}
            onCreateTransfer={handleCreateTransfer}
            onUpdateStatus={handleUpdateTransferStatus}
            onAddDocument={(transferId: string, document: StudentDocument) => {
              setTransfers(prev =>
                prev.map(transfer =>
                  transfer.id === transferId
                    ? { ...transfer, documents: [...(transfer.documents || []), document] }
                    : transfer
                )
              );
              handleUploadDocument(document);
            }}
            batches={batches}
          />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificateManager
            certificates={certificates}
            templates={certificateTemplates}
            onCreateCertificate={(cert) => {
              setCertificates((prev) => [...prev, cert]);
              toast.success("Certificate created");
            }}
            onUpdateStatus={(certId, status) => {
              setCertificates((prev) =>
                prev.map((cert) =>
                  cert.id === certId ? { ...cert, status } : cert
                )
              );
              toast.success(`Certificate ${status}`);
            }}
            onRevoke={(certId) => {
              setCertificates((prev) =>
                prev.map((cert) =>
                  cert.id === certId ? { ...cert, status: "revoked" } : cert
                )
              );
              toast.success("Certificate revoked");
            }}
            currentUser="Admin" // Replace with actual user
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager
            categories={categories}
            onCreateCategory={handleCreateCategory}
            onUpdateCategory={(categoryId, category) => {
              setCategories((prev) =>
                prev.map((cat) =>
                  cat.id === categoryId ? { ...cat, ...category } : cat
                )
              );
              toast.success("Category updated");
            }}
            onDeleteCategory={(categoryId) => {
              setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
              toast.success("Category deleted");
            }}
            onAssignStudents={(categoryId, studentIds) => {
              setCategories((prev) =>
                prev.map((cat) =>
                  cat.id === categoryId
                    ? { ...cat, students: [...(cat.students || []), ...studentIds] }
                    : cat
                )
              );
              toast.success(`${studentIds.length} students assigned to category`);
            }}
            onRemoveStudent={(categoryId, studentId) => {
              setCategories((prev) =>
                prev.map((cat) =>
                  cat.id === categoryId
                    ? {
                        ...cat,
                        students: cat.students?.filter((id) => id !== studentId),
                      }
                    : cat
                )
              );
              toast.success("Student removed from category");
            }}
            students={students.map((s) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` }))}
          />
        </TabsContent>
      </Tabs>

      <StudentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={selectedStudent ? handleUpdateStudent : handleCreateStudent}
        student={selectedStudent}
      />
    </div>
  );
}
