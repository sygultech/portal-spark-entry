import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Users,
  Calendar,
  MoreVertical,
  Edit,
  Trash,
  UserPlus,
  ClipboardList,
  BookOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ElectiveGroupFormDialog } from "./ElectiveGroupFormDialog";
import { Progress } from "@/components/ui/progress";
import { ElectiveSubjectsDialog } from "./ElectiveSubjectsDialog";
import { ElectiveStudentsDialog } from "./ElectiveStudentsDialog";

// Mock data for development
const mockElectiveGroups = [
  {
    id: "1",
    name: "Science Electives 2024",
    description: "Optional science subjects for Grade 11",
    batch: "Grade 11 Science",
    capacity: 30,
    enrolled: 25,
    waitlist: 3,
    waitlist_capacity: 10,
    subjects: ["Advanced Physics", "Biochemistry", "Computer Science"],
    allow_self_enrollment: true,
    enrollment_deadline: "2024-06-30",
    min_subjects: 1,
    max_subjects: 2,
    status: "active"
  },
  {
    id: "2",
    name: "Language Electives",
    description: "Additional language options",
    batch: "Grade 11 Commerce",
    capacity: 40,
    enrolled: 40,
    waitlist: 5,
    waitlist_capacity: 5,
    subjects: ["French", "German", "Japanese"],
    allow_self_enrollment: true,
    enrollment_deadline: "2024-06-15",
    min_subjects: 1,
    max_subjects: 1,
    status: "full"
  }
];

const ElectiveGroupsSection = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubjectsDialogOpen, setIsSubjectsDialogOpen] = useState(false);
  const [isStudentsDialogOpen, setIsStudentsDialogOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  const handleCreateGroup = (data: any) => {
    console.log("Create group:", data);
    setIsFormOpen(false);
  };

  const handleEditGroup = (group: any) => {
    setSelectedGroup(group);
    setIsFormOpen(true);
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log("Delete group:", groupId);
  };

  const handleManageStudents = (group: any) => {
    setSelectedGroup(group);
    setIsStudentsDialogOpen(true);
  };

  const handleManageSubjects = (group: any) => {
    setSelectedGroup(group);
    setIsSubjectsDialogOpen(true);
  };

  const getStatusBadge = (status: string, enrolled: number, capacity: number) => {
    if (status === "full") {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (enrolled >= capacity) {
      return <Badge variant="destructive">Full</Badge>;
    }
    if (enrolled >= capacity * 0.8) {
      return <Badge variant="secondary">Almost Full</Badge>;
    }
    return <Badge variant="success">Open</Badge>;
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Elective Groups</CardTitle>
            <CardDescription>Manage elective subject groups and student choices</CardDescription>
          </div>
          <Button onClick={() => {
            setSelectedGroup(null);
            setIsFormOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Elective Group
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4" value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Groups</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="archived">Archived</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {mockElectiveGroups.map((group) => (
                    <Card key={group.id} className="relative">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="flex items-center gap-2">
                              {group.name}
                              {getStatusBadge(group.status, group.enrolled, group.capacity)}
                            </CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditGroup(group)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Group
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageStudents(group)}>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Manage Students
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleManageSubjects(group)}>
                                <BookOpen className="h-4 w-4 mr-2" />
                                Manage Subjects
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteGroup(group.id)}
                                className="text-destructive"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete Group
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-6">
                        <div className="grid gap-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium">Batch</div>
                              <div className="text-sm text-muted-foreground">{group.batch}</div>
                            </div>
                            <div>
                              <div className="text-sm font-medium">Enrollment Deadline</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {group.enrollment_deadline}
                              </div>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-1.5">Enrollment Progress</div>
                            <Progress value={(group.enrolled / group.capacity) * 100} className="h-2" />
                            <div className="flex items-center justify-between mt-1.5 text-sm text-muted-foreground">
                              <span>{group.enrolled} / {group.capacity} enrolled</span>
                              <span>{group.waitlist} / {group.waitlist_capacity} waitlisted</span>
                            </div>
                          </div>

                          <div>
                            <div className="text-sm font-medium mb-1.5">Subjects ({group.subjects.length})</div>
                            <div className="flex flex-wrap gap-2">
                              {group.subjects.map((subject, index) => (
                                <Badge key={index} variant="secondary">{subject}</Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Choose {group.min_subjects} to {group.max_subjects} subjects
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <ClipboardList className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {group.allow_self_enrollment ? "Self-enrollment enabled" : "Manual enrollment only"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="active">
              {/* Filter and show only active groups */}
            </TabsContent>

            <TabsContent value="upcoming">
              {/* Filter and show only upcoming groups */}
            </TabsContent>

            <TabsContent value="archived">
              {/* Filter and show only archived groups */}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ElectiveGroupFormDialog
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedGroup(null);
        }}
        onSubmit={handleCreateGroup}
        group={selectedGroup}
      />

      <ElectiveSubjectsDialog
        isOpen={isSubjectsDialogOpen}
        onClose={() => {
          setIsSubjectsDialogOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
      />

      <ElectiveStudentsDialog
        isOpen={isStudentsDialogOpen}
        onClose={() => {
          setIsStudentsDialogOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
      />
    </>
  );
};

export default ElectiveGroupsSection; 
// force update
