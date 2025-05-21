import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentList } from "@/components/students/StudentList";
import { StudentProfile } from "@/components/students/StudentProfile";
import { DocumentManager } from "@/components/students/DocumentManager";
import { TransferManager } from "@/components/students/TransferManager";
import { DisciplinaryManager } from "@/components/students/DisciplinaryManager";
import { CertificateManager } from "@/components/students/CertificateManager";
import { CategoryManager } from "@/components/students/CategoryManager";
import { MedicalManager } from "@/components/students/MedicalManager";
import { QuickActions } from "@/components/students/QuickActions";
import { AddStudentForm } from "@/components/students/AddStudentForm";
import { 
  Student, 
  StudentDocument, 
  TransferRecord, 
  DisciplinaryRecord, 
  Certificate, 
  StudentCategory, 
  MedicalRecord, 
  DisciplinaryEvidence,
  ParentMeeting,
  MedicalRecordStatus
} from "@/types/student";
import { FileText, GraduationCap, Shield, Tag, UserPlus, Heart, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useStudentManagement } from "@/hooks/useStudentManagement";
import { useQueryClient } from "@tanstack/react-query";

export default function Students() {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;

  const {
    students,
    isStudentsLoading,
    categories,
    isCategoriesLoading,
    createStudent,
    updateStudent,
    isUpdatingStudent,
    addDisciplinaryRecord,
    addTransferRecord,
    generateCertificate
  } = useStudentManagement();

  const queryClient = useQueryClient();

  const handleRefreshStudents = () => {
    queryClient.invalidateQueries({ queryKey: ['students', schoolId] });
  };

  const [activeTab, setActiveTab] = useState("list");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [isAddStudentFormOpen, setIsAddStudentFormOpen] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [disciplinaryRecords, setDisciplinaryRecords] = useState<DisciplinaryRecord[]>([]);
  const [documents, setDocuments] = useState<StudentDocument[]>([]);
  const [transfers, setTransfers] = useState<TransferRecord[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student);
    setActiveTab("profile");
  };

  const handleCreateStudent = async (data: any) => {
    if (!schoolId) {
      toast.error("School ID not found. Please try again or contact support.");
      return;
    }
    try {
      await createStudent({
        ...data,
        school_id: schoolId
      });
      setIsAddStudentFormOpen(false);
      toast.success("Student added successfully");
    } catch (error) {
      console.error('Error creating student:', error);
      toast.error("Failed to add student. Please try again.");
    }
  };

  const handleUpdateStudent = async (studentData: any) => {
    if (!selectedStudent) return;
    try {
      await updateStudent({ id: selectedStudent.id, data: studentData });
    } catch (error) {
      console.error('Error updating student:', error);
    }
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
  const handleCreateTransfer = async (transfer: TransferRecord) => {
    try {
      await addTransferRecord(transfer);
      setTransfers((prev) => [...prev, transfer]);
    } catch (error) {
      console.error('Error creating transfer:', error);
    }
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Quick Actions */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Students Management</h1>
          <Button onClick={() => setIsAddStudentFormOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New Student
          </Button>
        </div>
        
        <QuickActions
          onBulkImport={handleBulkImport}
          onExportData={handleExportData}
          totalStudents={students.length}
          activeStudents={students.filter(s => !s.transfer_records?.some(t => t.status === "completed")).length}
          pendingAdmissions={0}
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

        <TabsContent value="list">
          <StudentList
            students={students}
            onSelect={handleStudentSelect}
            categories={categories}
            onBatchAction={handleBatchAction}
            onRefresh={handleRefreshStudents}
          />
        </TabsContent>

        {selectedStudent && (
          <TabsContent value="profile">
            <StudentProfile student={selectedStudent} onEdit={() => {}} />
          </TabsContent>
        )}

        <TabsContent value="medical">
          <MedicalManager
            records={medicalRecords}
            onAddRecord={(record) => {
              const newRecord: MedicalRecord = {
                ...record,
                id: Date.now().toString(),
                school_id: record.school_id || "",
                last_updated: new Date().toISOString(),
              };
              setMedicalRecords((prev) => [...prev, newRecord]);
              toast.success("Medical record added successfully");
            }}
            onUpdateRecord={(id, record) => {
              setMedicalRecords((prev) =>
                prev.map((r) =>
                  r.id === id
                    ? { ...r, ...record, last_updated: new Date().toISOString() }
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
            onCreateRecord={async (record) => {
              if (!selectedStudent) return;
              try {
                await addDisciplinaryRecord({
                  studentId: selectedStudent.id,
                  data: record
                });
                setDisciplinaryRecords((prev) => [...prev, record]);
              } catch (error) {
                console.error('Error adding disciplinary record:', error);
              }
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
            batches={[
              { id: "1", name: "Grade 10A" },
              { id: "2", name: "Grade 10B" },
              { id: "3", name: "Grade 9A" },
            ]}
          />
        </TabsContent>

        <TabsContent value="certificates">
          <CertificateManager
            certificates={certificates}
            templates={[
              {
                id: "1",
                name: "Transfer Certificate",
                description: "Official transfer certificate for students leaving the school",
                fields: [
                  { name: "reason", type: "text", required: true, label: "Reason for Transfer" },
                  { name: "last_attended_date", type: "date", required: true, label: "Last Date Attended" },
                  { name: "conduct", type: "text", required: true, label: "Conduct" },
                ],
              },
              {
                id: "2",
                name: "Character Certificate",
                description: "Certificate attesting to the student's character and conduct",
                fields: [
                  { name: "period_from", type: "date", required: true, label: "Period From" },
                  { name: "period_to", type: "date", required: true, label: "Period To" },
                  { name: "character", type: "text", required: true, label: "Character Description" },
                ],
              },
            ]}
            onCreateCertificate={async (certificate) => {
              try {
                await generateCertificate(certificate);
                setCertificates((prev) => [...prev, certificate]);
              } catch (error) {
                console.error('Error generating certificate:', error);
              }
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
            currentUser="Admin"
          />
        </TabsContent>

        <TabsContent value="categories">
          <CategoryManager
            categories={categories}
            onCreateCategory={(category) => {
              toast.success("Category created successfully");
            }}
            onUpdateCategory={(categoryId, category) => {
              toast.success("Category updated successfully");
            }}
            onDeleteCategory={(categoryId) => {
              toast.success("Category deleted successfully");
            }}
            onAssignStudents={(categoryId, studentIds) => {
              toast.success(`${studentIds.length} students assigned to category`);
            }}
            onRemoveStudent={(categoryId, studentId) => {
              toast.success("Student removed from category");
            }}
            students={students.map((s) => ({ id: s.id, name: `${s.first_name} ${s.last_name}` }))}
          />
        </TabsContent>
      </Tabs>

      <AddStudentForm
        isOpen={isAddStudentFormOpen}
        onClose={() => setIsAddStudentFormOpen(false)}
        onSubmit={handleCreateStudent}
      />
    </div>
  );
}

// force update

// force update
