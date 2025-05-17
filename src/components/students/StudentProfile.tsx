import { Student, Document, DisciplinaryRecord, TransferRecord, Certificate } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, FileText, GraduationCap, Library, Receipt, Shield, UserRound, Users } from "lucide-react";

interface StudentProfileProps {
  student: Student;
  onEdit: () => void;
}

export function StudentProfile({ student, onEdit }: StudentProfileProps) {
  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={student.photo} />
              <AvatarFallback>{student.firstName[0]}{student.lastName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
                  <p className="text-muted-foreground">Admission No: {student.admissionNo}</p>
                </div>
                <Button onClick={onEdit}>Edit Profile</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Batch</p>
                  <p>{student.batch}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{student.category}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p>{new Date(student.dateOfBirth).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p>{student.bloodGroup}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="flex-1">
        <TabsList className="grid grid-cols-8 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="disciplinary">Disciplinary</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="library">Library</TabsTrigger>
          <TabsTrigger value="guardians">Guardians</TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <StatsCard
                  icon={<GraduationCap className="w-4 h-4" />}
                  title="Academic Performance"
                  value="85%"
                  label="Average Score"
                />
                <StatsCard
                  icon={<CalendarDays className="w-4 h-4" />}
                  title="Attendance"
                  value="92%"
                  label="This Term"
                />
                <StatsCard
                  icon={<Receipt className="w-4 h-4" />}
                  title="Fees Status"
                  value="Paid"
                  label="Current Term"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Nationality</dt>
                        <dd>{student.nationality}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Religion</dt>
                        <dd>{student.religion}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Caste</dt>
                        <dd>{student.caste}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Mother Tongue</dt>
                        <dd>{student.motherTongue}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Email</dt>
                        <dd>{student.email}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>{student.phone}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="text-right">{student.address}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              {student.academicRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <CardTitle>{record.year} - {record.term}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-4 gap-4">
                        {record.subjects.map((subject, index) => (
                          <div key={index} className="p-4 border rounded-lg">
                            <p className="font-medium">{subject.subject}</p>
                            <p className="text-2xl font-bold">{subject.grade}</p>
                            <p className="text-sm text-muted-foreground">Marks: {subject.marks}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center">
                        <p>Attendance: {record.attendance}%</p>
                        {record.remarks && (
                          <p className="text-muted-foreground">Remarks: {record.remarks}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              {/* Attendance tracking UI will be implemented here */}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-end">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {student.documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{doc.name}</CardTitle>
                        <Badge variant={
                          doc.verificationStatus === 'verified' ? 'success' :
                          doc.verificationStatus === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {doc.verificationStatus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type</dt>
                          <dd>{doc.type}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Uploaded</dt>
                          <dd>{new Date(doc.uploadDate).toLocaleDateString()}</dd>
                        </div>
                        {doc.verificationStatus === 'verified' && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Verified By</dt>
                              <dd>{doc.verifiedBy}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Verified On</dt>
                              <dd>{new Date(doc.verificationDate!).toLocaleDateString()}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                      <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">View</Button>
                        <Button variant="outline" size="sm">Download</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="disciplinary" className="space-y-4">
              <div className="flex justify-end">
                <Button>
                  <Shield className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
              </div>

              {student.disciplinaryRecords.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{record.incidentType}</CardTitle>
                      <Badge variant={
                        record.status === 'resolved' ? 'success' : 'secondary'
                      }>
                        {record.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Date</dt>
                        <dd>{new Date(record.date).toLocaleDateString()}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Severity</dt>
                        <dd>{record.severity}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Description</dt>
                        <dd className="mt-1">{record.description}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Action Taken</dt>
                        <dd className="mt-1">{record.action}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              {/* Fees records UI will be implemented here */}
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              {/* Library records UI will be implemented here */}
            </TabsContent>

            <TabsContent value="guardians" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {student.guardians.map((guardian) => (
                  <Card key={guardian.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>{guardian.firstName} {guardian.lastName}</CardTitle>
                        <Badge>{guardian.relation}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Occupation</dt>
                          <dd>{guardian.occupation}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Phone</dt>
                          <dd>{guardian.phone}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Email</dt>
                          <dd>{guardian.email}</dd>
                        </div>
                        <div>
                          <dt className="text-muted-foreground">Address</dt>
                          <dd className="mt-1">{guardian.address}</dd>
                        </div>
                      </dl>
                      <div className="mt-4 flex gap-4">
                        {guardian.isEmergencyContact && (
                          <Badge variant="secondary">Emergency Contact</Badge>
                        )}
                        {guardian.canPickup && (
                          <Badge variant="secondary">Can Pickup Student</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  label: string;
}

function StatsCard({ icon, title, value, label }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2">
          {icon}
          <p className="text-sm font-medium">{title}</p>
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
} 