import { Student, StudentDocument, DisciplinaryRecord, TransferRecord, Certificate, Guardian } from "@/types/student";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CalendarDays, FileText, GraduationCap, Library, Receipt, Shield, UserRound, Users, Briefcase, Phone, Mail, MapPin, AlertTriangle } from "lucide-react";

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
              <AvatarImage src={student.avatar_url} />
              <AvatarFallback>{(student.first_name?.[0] || '')}{student.last_name?.[0] || ''}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{student.first_name || ''} {student.last_name || ''}</h2>
                  <p className="text-muted-foreground">Admission No: {student.admission_number || ''}</p>
                </div>
                <Button onClick={onEdit}>Edit Profile</Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Academic Details</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{student.course_name || ''}</Badge>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline">{student.batch_name || ''}</Badge>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="outline">{student.academic_year || ''}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="secondary">{student.category || ''}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : ''}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Blood Group</p>
                  <p>{student.blood_group || ''}</p>
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
                        <dd>{student.nationality || ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Religion</dt>
                        <dd>{student.religion || ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Caste</dt>
                        <dd>{student.caste || ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Mother Tongue</dt>
                        <dd>{student.mother_tongue || ''}</dd>
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
                        <dd>{student.email || ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Phone</dt>
                        <dd>{student.phone || ''}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd className="text-right">{student.address || ''}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-4">
              {/* Academic Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Current Academic Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Academic Year:</span>
                        <span className="font-medium">2024-25</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Batch:</span>
                        <span className="font-medium">{student.batch_name || 'Not Assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Overall Grade:</span>
                        <Badge variant="secondary">A</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">CGPA:</span>
                        <span className="font-medium">8.5/10</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Exam Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Exam:</span>
                        <span className="font-medium">Mid-Term 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span className="font-medium">425/500 (85%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rank:</span>
                        <span className="font-medium">3rd in batch</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Grade:</span>
                        <Badge variant="default">A</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Academic Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Promotion Status:</span>
                        <Badge variant="success">Promoted</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subjects Passed:</span>
                        <span className="font-medium">6/6</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distinction:</span>
                        <Badge variant="secondary">Yes</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subjects and Grades */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "Mathematics", teacher: "Dr. Smith", grade: "A+", score: "95/100", remarks: "Excellent performance" },
                      { name: "Science", teacher: "Ms. Johnson", grade: "A", score: "88/100", remarks: "Good understanding" },
                      { name: "English", teacher: "Mr. Wilson", grade: "A", score: "82/100", remarks: "Strong writing skills" },
                      { name: "Social Studies", teacher: "Ms. Brown", grade: "B+", score: "78/100", remarks: "Needs improvement in geography" },
                      { name: "Physical Education", teacher: "Coach Davis", grade: "A+", score: "98/100", remarks: "Outstanding sports participation" },
                      { name: "Art", teacher: "Ms. Garcia", grade: "A", score: "85/100", remarks: "Creative and artistic" }
                    ].map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{subject.name}</h4>
                          <p className="text-sm text-muted-foreground">Teacher: {subject.teacher}</p>
                          <p className="text-sm text-muted-foreground">{subject.remarks}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant="outline">{subject.grade}</Badge>
                          <p className="text-sm font-medium">{subject.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Exam History */}
              <Card>
                <CardHeader>
                  <CardTitle>Exam History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { exam: "Mid-Term Exam 2024", date: "2024-03-15", score: "425/500", grade: "A", percentage: "85%" },
                      { exam: "Unit Test 3", date: "2024-02-20", score: "192/200", grade: "A+", percentage: "96%" },
                      { exam: "Unit Test 2", date: "2024-01-25", score: "178/200", grade: "A", percentage: "89%" },
                      { exam: "Unit Test 1", date: "2024-01-10", score: "165/200", grade: "A", percentage: "82.5%" },
                      { exam: "Final Exam 2023", date: "2023-12-15", score: "445/500", grade: "A+", percentage: "89%" }
                    ].map((exam, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium">{exam.exam}</h5>
                          <p className="text-sm text-muted-foreground">{new Date(exam.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{exam.grade}</Badge>
                            <span className="font-medium">{exam.percentage}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{exam.score}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attendance" className="space-y-4">
              {/* Attendance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overall Attendance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">92%</div>
                      <p className="text-sm text-muted-foreground">This Academic Year</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Present:</span>
                        <span className="font-medium text-green-600">18 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Absent:</span>
                        <span className="font-medium text-red-600">2 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Percentage:</span>
                        <span className="font-medium">90%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Last 30 Days</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Present:</span>
                        <span className="font-medium text-green-600">26 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Absent:</span>
                        <span className="font-medium text-red-600">2 days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Late:</span>
                        <span className="font-medium text-yellow-600">1 day</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Streak</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">7 days</div>
                      <p className="text-sm text-muted-foreground">Current Present Streak</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Attendance */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Attendance Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { date: "2024-03-25", status: "present", periods: "6/6", remarks: "" },
                      { date: "2024-03-24", status: "present", periods: "6/6", remarks: "" },
                      { date: "2024-03-23", status: "present", periods: "5/6", remarks: "Left early for medical appointment" },
                      { date: "2024-03-22", status: "absent", periods: "0/6", remarks: "Sick leave" },
                      { date: "2024-03-21", status: "present", periods: "6/6", remarks: "" },
                      { date: "2024-03-20", status: "present", periods: "6/6", remarks: "" },
                      { date: "2024-03-19", status: "late", periods: "6/6", remarks: "Arrived 30 minutes late" },
                      { date: "2024-03-18", status: "present", periods: "6/6", remarks: "" }
                    ].map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-medium">{new Date(record.date).toLocaleDateString()}</div>
                          <Badge 
                            variant={
                              record.status === 'present' ? 'success' : 
                              record.status === 'absent' ? 'destructive' :
                              record.status === 'late' ? 'secondary' : 'outline'
                            }
                          >
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Periods: {record.periods}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {record.remarks && (
                            <span className="italic">{record.remarks}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Attendance Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { month: "March 2024", present: 18, absent: 2, late: 1, percentage: 90 },
                      { month: "February 2024", present: 19, absent: 1, late: 0, percentage: 95 },
                      { month: "January 2024", present: 20, absent: 2, late: 1, percentage: 87 }
                    ].map((month, index) => (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle className="text-base">{month.month}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Present:</span>
                              <span className="font-medium text-green-600">{month.present}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Absent:</span>
                              <span className="font-medium text-red-600">{month.absent}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Late:</span>
                              <span className="font-medium text-yellow-600">{month.late}</span>
                            </div>
                            <div className="flex justify-between font-semibold">
                              <span>Percentage:</span>
                              <span className={month.percentage >= 90 ? "text-green-600" : month.percentage >= 75 ? "text-yellow-600" : "text-red-600"}>
                                {month.percentage}%
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Document Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage student documents, verification status, and upload new files
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Document Types
                  </Button>
                  <Button>
                    <FileText className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </div>

              {/* Document Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Documents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{student.documents?.length || 6}</div>
                      <p className="text-sm text-muted-foreground">Documents uploaded</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Verified</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">4</div>
                      <p className="text-sm text-muted-foreground">Documents verified</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-600">1</div>
                      <p className="text-sm text-muted-foreground">Awaiting verification</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Missing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">1</div>
                      <p className="text-sm text-muted-foreground">Required documents</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Documents Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: "1",
                    name: "Birth Certificate",
                    type: "Birth Certificate",
                    upload_date: "2024-03-01",
                    verification_status: "verified",
                    verified_by: "Admin Officer",
                    verification_date: "2024-03-02",
                    size: "2.3 MB",
                    format: "PDF"
                  },
                  {
                    id: "2", 
                    name: "Previous School Records",
                    type: "Previous School Records",
                    upload_date: "2024-03-01",
                    verification_status: "verified",
                    verified_by: "Academic Coordinator",
                    verification_date: "2024-03-03",
                    size: "1.8 MB",
                    format: "PDF"
                  },
                  {
                    id: "3",
                    name: "Medical Records",
                    type: "Medical Records",
                    upload_date: "2024-03-05",
                    verification_status: "pending",
                    size: "1.2 MB",
                    format: "PDF"
                  },
                  {
                    id: "4",
                    name: "Parent ID Proof",
                    type: "Parent ID",
                    upload_date: "2024-03-01",
                    verification_status: "verified",
                    verified_by: "Registration Officer",
                    verification_date: "2024-03-02",
                    size: "0.8 MB",
                    format: "PDF"
                  },
                  {
                    id: "5",
                    name: "Address Proof",
                    type: "Address Proof",
                    upload_date: "2024-03-01",
                    verification_status: "verified",
                    verified_by: "Registration Officer", 
                    verification_date: "2024-03-02",
                    size: "1.1 MB",
                    format: "PDF"
                  }
                ].map((doc) => (
                  <Card key={doc.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{doc.name}</CardTitle>
                        <Badge variant={
                          doc.verification_status === 'verified' ? 'success' :
                          doc.verification_status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {doc.verification_status === 'verified' ? 'Verified' : 
                           doc.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Type</dt>
                          <dd className="text-sm">{doc.type}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Uploaded</dt>
                          <dd className="text-sm">{new Date(doc.upload_date).toLocaleDateString()}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-muted-foreground">Size</dt>
                          <dd className="text-sm">{doc.size} • {doc.format}</dd>
                        </div>
                        {doc.verification_status === 'verified' && doc.verified_by && (
                          <>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Verified By</dt>
                              <dd className="text-sm">{doc.verified_by}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Verified On</dt>
                              <dd className="text-sm">{doc.verification_date ? new Date(doc.verification_date).toLocaleDateString() : ''}</dd>
                            </div>
                          </>
                        )}
                      </dl>
                      <div className="mt-4 flex justify-between gap-2">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">Download</Button>
                        </div>
                        <div className="flex gap-2">
                          {doc.verification_status === 'pending' && (
                            <>
                              <Button size="sm" variant="outline" className="text-green-600 border-green-200">
                                Verify
                              </Button>
                              <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                                Reject
                              </Button>
                            </>
                          )}
                          <Button variant="outline" size="sm" className="text-red-600">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Missing Documents Card */}
                <Card className="border-dashed border-red-200 bg-red-50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base text-red-700">Transfer Certificate</CardTitle>
                      <Badge variant="outline" className="text-red-700 border-red-300">Missing</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-red-600 mb-4">
                      This document is required for student admission completion.
                    </p>
                    <div className="space-y-2">
                      <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                        <FileText className="w-3 h-3 mr-1" />
                        Upload Now
                      </Button>
                      <Button size="sm" variant="outline" className="w-full">
                        Request from Parent
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Document Requirements */}
              <Card>
                <CardHeader>
                  <CardTitle>Document Requirements Checklist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Birth Certificate", status: "verified", required: true },
                      { name: "Previous School Records", status: "verified", required: true },
                      { name: "Medical Records", status: "pending", required: true },
                      { name: "Parent ID Proof", status: "verified", required: true },
                      { name: "Address Proof", status: "verified", required: true },
                      { name: "Transfer Certificate", status: "missing", required: true },
                      { name: "Immunization Records", status: "not_uploaded", required: false },
                      { name: "Previous Academic Certificates", status: "not_uploaded", required: false }
                    ].map((req, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${
                            req.status === 'verified' ? 'bg-green-500' :
                            req.status === 'pending' ? 'bg-yellow-500' :
                            req.status === 'missing' ? 'bg-red-500' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <h5 className="font-medium">{req.name}</h5>
                            <p className="text-sm text-muted-foreground">
                              {req.required ? 'Required' : 'Optional'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            req.status === 'verified' ? 'success' :
                            req.status === 'pending' ? 'secondary' :
                            req.status === 'missing' ? 'destructive' : 'outline'
                          }>
                            {req.status === 'verified' ? 'Verified' :
                             req.status === 'pending' ? 'Pending' :
                             req.status === 'missing' ? 'Missing' : 'Not Uploaded'}
                          </Badge>
                          {req.status === 'not_uploaded' && (
                            <Button size="sm" variant="outline">Upload</Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="disciplinary" className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Disciplinary Records</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage student disciplinary incidents and actions taken
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Shield className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                  <Button>
                    <Shield className="w-4 h-4 mr-2" />
                    Add Record
                  </Button>
                </div>
              </div>

              {/* Disciplinary Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Incidents</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold">{student.disciplinary_records?.length || 2}</div>
                      <p className="text-sm text-muted-foreground">All time</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">This Year</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">2</div>
                      <p className="text-sm text-muted-foreground">Academic year 2024-25</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resolved</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">1</div>
                      <p className="text-sm text-muted-foreground">Cases closed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">1</div>
                      <p className="text-sm text-muted-foreground">Active cases</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Disciplinary Records */}
              <div className="space-y-4">
                {[
                  {
                    id: "1",
                    incident_type: "Disruptive Behavior",
                    description: "Talking during class and not following teacher instructions repeatedly.",
                    date: "2024-03-20",
                    severity: "minor",
                    status: "pending",
                    action_taken: "Parent meeting scheduled",
                    reported_by: "Ms. Johnson (Math Teacher)",
                    evidence: ["Witness statement from class monitor"],
                    parent_meetings: []
                  },
                  {
                    id: "2", 
                    incident_type: "Late Submission",
                    description: "Failed to submit homework assignment on time despite multiple reminders.",
                    date: "2024-03-15",
                    severity: "minor",
                    status: "resolved",
                    action_taken: "Additional time given and counseling provided",
                    reported_by: "Mr. Wilson (English Teacher)",
                    evidence: [],
                    parent_meetings: [{
                      date: "2024-03-18",
                      attendees: "Parent, Teacher, Academic Coordinator",
                      outcome: "Student agreed to maintain homework schedule"
                    }]
                  }
                ].map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{record.incident_type}</CardTitle>
                        <div className="flex gap-2">
                          <Badge variant={
                            record.severity === 'severe' ? 'destructive' : 
                            record.severity === 'moderate' ? 'secondary' : 'outline'
                          }>
                            {record.severity.charAt(0).toUpperCase() + record.severity.slice(1)}
                          </Badge>
                          <Badge variant={
                            record.status === 'resolved' ? 'success' : 
                            record.status === 'escalated' ? 'destructive' : 'secondary'
                          }>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Incident Details</h5>
                          <dl className="space-y-2">
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Date:</dt>
                              <dd>{new Date(record.date).toLocaleDateString()}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-muted-foreground">Reported By:</dt>
                              <dd>{record.reported_by}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground mb-1">Description:</dt>
                              <dd className="text-sm">{record.description}</dd>
                            </div>
                            <div>
                              <dt className="text-muted-foreground mb-1">Action Taken:</dt>
                              <dd className="text-sm">{record.action_taken}</dd>
                            </div>
                          </dl>
                        </div>

                        {record.evidence && record.evidence.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Evidence</h5>
                            <div className="space-y-1">
                              {record.evidence.map((evidence, index) => (
                                <div key={index} className="text-sm text-muted-foreground">
                                  • {evidence}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {record.parent_meetings && record.parent_meetings.length > 0 && (
                          <div>
                            <h5 className="font-medium mb-2">Parent Meetings</h5>
                            <div className="space-y-2">
                              {record.parent_meetings.map((meeting, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded border">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium">{new Date(meeting.date).toLocaleDateString()}</span>
                                    <Badge variant="outline" className="text-xs">Meeting</Badge>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div><strong>Attendees:</strong> {meeting.attendees}</div>
                                    <div><strong>Outcome:</strong> {meeting.outcome}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between pt-3 border-t">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm" variant="outline">
                              Add Evidence
                            </Button>
                            {record.status === 'pending' && (
                              <Button size="sm" variant="outline">
                                Schedule Meeting
                              </Button>
                            )}
                          </div>
                          <div className="flex gap-2">
                            {record.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                  Mark Resolved
                                </Button>
                                <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                                  Escalate
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <Shield className="h-6 w-6" />
                      <span>Add New Record</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <UserRound className="h-6 w-6" />
                      <span>Schedule Parent Meeting</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <FileText className="h-6 w-6" />
                      <span>Generate Report</span>
                    </Button>
                    <Button variant="outline" className="h-auto p-4 flex flex-col gap-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span>Send Alert</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Behavioral Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>Behavioral Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Incident Types</h4>
                      <div className="space-y-2">
                        {[
                          { type: "Academic Issues", count: 1, color: "bg-blue-500" },
                          { type: "Behavioral Issues", count: 1, color: "bg-red-500" },
                          { type: "Attendance Issues", count: 0, color: "bg-yellow-500" },
                          { type: "Other", count: 0, color: "bg-gray-500" }
                        ].map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                              <span className="text-sm">{item.type}</span>
                            </div>
                            <span className="text-sm font-medium">{item.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        <div className="p-2 bg-green-50 border border-green-200 rounded">
                          ✓ Student shows improvement in academic discipline
                        </div>
                        <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                          ℹ Monitor classroom behavior patterns
                        </div>
                        <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
                          ⚠ Consider positive reinforcement strategies
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fees" className="space-y-4">
              {/* Fee Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold">₹18,500</div>
                      <p className="text-sm text-muted-foreground">Academic Year 2024-25</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Amount Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">₹15,000</div>
                      <p className="text-sm text-muted-foreground">Last payment: Mar 20, 2024</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Outstanding</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">₹3,500</div>
                      <p className="text-sm text-muted-foreground">Due amount</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <Badge variant="secondary" className="text-lg px-4 py-2">Partial</Badge>
                      <p className="text-sm text-muted-foreground mt-2">81% paid</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Fee Structure */}
              <Card>
                <CardHeader>
                  <CardTitle>Applied Fee Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Grade 1-5 Fee Structure</h4>
                      <Badge variant="outline">Academic Year 2024-25</Badge>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { component: "Tuition Fee", amount: 12000, paid: 10000, dueDate: "Monthly" },
                        { component: "Development Fee", amount: 3000, paid: 3000, dueDate: "Annual" },
                        { component: "Library Fee", amount: 1500, paid: 1500, dueDate: "Annual" },
                        { component: "Sports Fee", amount: 1000, paid: 500, dueDate: "Annual" },
                        { component: "Examination Fee", amount: 1000, paid: 0, dueDate: "Per Exam" }
                      ].map((fee, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h5 className="font-medium">{fee.component}</h5>
                            <p className="text-sm text-muted-foreground">Due: {fee.dueDate}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">₹{fee.amount.toLocaleString()}</div>
                            <div className="text-sm">
                              <span className="text-green-600">Paid: ₹{fee.paid.toLocaleString()}</span>
                              {fee.amount > fee.paid && (
                                <span className="text-red-600 ml-2">Due: ₹{(fee.amount - fee.paid).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        date: "2024-03-20",
                        description: "Library Fee Payment",
                        amount: 5000,
                        mode: "Bank Transfer",
                        receipt: "RCP002",
                        status: "completed"
                      },
                      {
                        date: "2024-03-15", 
                        description: "Tuition Fee (Partial Payment)",
                        amount: 10000,
                        mode: "UPI",
                        receipt: "RCP001",
                        status: "completed"
                      },
                      {
                        date: "2024-03-01",
                        description: "Development Fee",
                        amount: 3000,
                        mode: "Cash",
                        receipt: "RCP000",
                        status: "completed"
                      }
                    ].map((payment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex-1">
                          <h5 className="font-medium">{payment.description}</h5>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString()} • {payment.mode} • Receipt: {payment.receipt}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">₹{payment.amount.toLocaleString()}</div>
                          <Badge variant="success" className="text-xs">Completed</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Due Alerts */}
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="text-red-700">Outstanding Dues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">Sports Fee (Balance)</span>
                      <span className="font-semibold text-red-700">₹500</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">Examination Fee</span>
                      <span className="font-semibold text-red-700">₹1,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-700">Tuition Fee (Balance)</span>
                      <span className="font-semibold text-red-700">₹2,000</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-red-700">Total Outstanding</span>
                        <span className="font-bold text-red-700">₹3,500</span>
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700">Record Payment</Button>
                      <Button size="sm" variant="outline">Send Reminder</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library" className="space-y-4">
              {/* Library Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Books Issued</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">3</div>
                      <p className="text-sm text-muted-foreground">Currently borrowed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Books Read</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">25</div>
                      <p className="text-sm text-muted-foreground">This academic year</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Overdue Books</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">1</div>
                      <p className="text-sm text-muted-foreground">Books overdue</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Fines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">₹15</div>
                      <p className="text-sm text-muted-foreground">Outstanding</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Currently Issued Books */}
              <Card>
                <CardHeader>
                  <CardTitle>Currently Issued Books</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        title: "Harry Potter and the Philosopher's Stone",
                        author: "J.K. Rowling",
                        isbn: "978-0-7475-3269-9",
                        issueDate: "2024-03-10",
                        dueDate: "2024-03-24",
                        status: "overdue",
                        fine: 15
                      },
                      {
                        title: "The Chronicles of Narnia",
                        author: "C.S. Lewis",
                        isbn: "978-0-06-623850-3",
                        issueDate: "2024-03-18",
                        dueDate: "2024-04-01",
                        status: "active",
                        fine: 0
                      },
                      {
                        title: "Wonder",
                        author: "R.J. Palacio",
                        isbn: "978-0-375-86902-0",
                        issueDate: "2024-03-20",
                        dueDate: "2024-04-03",
                        status: "active",
                        fine: 0
                      }
                    ].map((book, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <p className="text-xs text-muted-foreground">ISBN: {book.isbn}</p>
                          <div className="flex gap-4 mt-2 text-sm">
                            <span>Issued: {new Date(book.issueDate).toLocaleDateString()}</span>
                            <span>Due: {new Date(book.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <Badge 
                            variant={book.status === 'overdue' ? 'destructive' : 'secondary'}
                          >
                            {book.status === 'overdue' ? 'Overdue' : 'Active'}
                          </Badge>
                          {book.fine > 0 && (
                            <div className="text-red-600 font-medium">Fine: ₹{book.fine}</div>
                          )}
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">Renew</Button>
                            <Button size="sm">Return</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Reading History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Reading History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        title: "Matilda",
                        author: "Roald Dahl",
                        borrowDate: "2024-02-15",
                        returnDate: "2024-02-28",
                        rating: 5
                      },
                      {
                        title: "Charlie and the Chocolate Factory",
                        author: "Roald Dahl", 
                        borrowDate: "2024-02-01",
                        returnDate: "2024-02-14",
                        rating: 4
                      },
                      {
                        title: "The Secret Garden",
                        author: "Frances Hodgson Burnett",
                        borrowDate: "2024-01-20",
                        returnDate: "2024-02-02",
                        rating: 4
                      },
                      {
                        title: "Charlotte's Web",
                        author: "E.B. White",
                        borrowDate: "2024-01-05",
                        returnDate: "2024-01-19",
                        rating: 5
                      }
                    ].map((book, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <h5 className="font-medium">{book.title}</h5>
                          <p className="text-sm text-muted-foreground">by {book.author}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(book.borrowDate).toLocaleDateString()} - {new Date(book.returnDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < book.rating ? "text-yellow-400" : "text-gray-300"}>★</span>
                            ))}
                          </div>
                          <Badge variant="success" className="text-xs mt-1">Returned</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Library Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Reading Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Favorite Genres</h4>
                      <div className="space-y-2">
                        {[
                          { genre: "Fiction", count: 12, percentage: 48 },
                          { genre: "Adventure", count: 6, percentage: 24 },
                          { genre: "Fantasy", count: 4, percentage: 16 },
                          { genre: "Science", count: 3, percentage: 12 }
                        ].map((genre, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{genre.genre}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full" 
                                  style={{ width: `${genre.percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-sm text-muted-foreground">{genre.count}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Reading Progress</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Books this month:</span>
                          <span className="font-medium">4</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Average rating:</span>
                          <span className="font-medium">4.4/5</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reading streak:</span>
                          <span className="font-medium">15 days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Favorite author:</span>
                          <span className="font-medium">Roald Dahl</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outstanding Fines */}
              {true && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-700">Outstanding Library Fines</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-red-700">Late return fine (Harry Potter)</span>
                        <span className="font-semibold text-red-700">₹15</span>
                      </div>
                      <div className="border-t pt-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-red-700">Total Outstanding</span>
                          <span className="font-bold text-red-700">₹15</span>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700">Pay Fine</Button>
                        <Button size="sm" variant="outline">Contact Librarian</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="guardians" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Guardian Information</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage guardian details for the student
                  </p>
                </div>
                <Button onClick={onEdit} size="sm">
                  <UserRound className="w-4 h-4 mr-2" />
                  Edit Guardians
                </Button>
              </div>

              {student.guardians && student.guardians.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {student.guardians.map((guardian) => (
                    <Card key={guardian.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {guardian.first_name || ''} {guardian.last_name || ''}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {guardian.relation}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {guardian.is_primary && (
                              <Badge variant="default">Primary</Badge>
                            )}
                            {guardian.is_emergency_contact && (
                              <Badge variant="secondary">Emergency Contact</Badge>
                            )}
                            {guardian.can_pickup && (
                              <Badge variant="outline">Can Pickup</Badge>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <dl className="space-y-3">
                          <div className="flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <dt className="text-sm text-muted-foreground">Occupation</dt>
                              <dd className="text-sm">{guardian.occupation || 'Not specified'}</dd>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <dt className="text-sm text-muted-foreground">Phone</dt>
                              <dd className="text-sm">{guardian.phone || 'Not specified'}</dd>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <dt className="text-sm text-muted-foreground">Email</dt>
                              <dd className="text-sm">{guardian.email || 'Not specified'}</dd>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <div>
                              <dt className="text-sm text-muted-foreground">Address</dt>
                              <dd className="text-sm">{guardian.address || 'Not specified'}</dd>
                            </div>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No guardians have been added for this student.
                    </p>
                    <Button onClick={onEdit} variant="outline" className="mt-4">
                      Add Guardians
                    </Button>
                  </CardContent>
                </Card>
              )}
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
