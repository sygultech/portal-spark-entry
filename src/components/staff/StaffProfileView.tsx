
import React from "react";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Calendar, Mail, Phone, MapPin, Briefcase, GraduationCap, Clock } from "lucide-react";

interface StaffProfileViewProps {
  staff: {
    id: number;
    name: string;
    avatar: string;
    employeeId: string;
    department: string;
    designation: string;
    email: string;
    phone: string;
    status: string;
    joinDate: string;
  };
}

const StaffProfileView: React.FC<StaffProfileViewProps> = ({ staff }) => {
  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={staff.avatar} alt={staff.name} />
          <AvatarFallback className="text-lg">{staff.name.charAt(0)}{staff.name.split(' ')[1]?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{staff.name}</h3>
          <p className="text-sm text-muted-foreground">{staff.designation}</p>
          <Badge variant={
            staff.status === "Active" ? "default" : 
            staff.status === "On Leave" ? "outline" : "secondary"
          } className="mt-2">
            {staff.status}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{staff.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{staff.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">123 School St, Education City</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Employee ID</span>
            </div>
            <span className="text-sm font-medium">{staff.employeeId}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Department</span>
            </div>
            <span className="text-sm font-medium">{staff.department}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Designation</span>
            </div>
            <span className="text-sm font-medium">{staff.designation}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Join Date</span>
            </div>
            <span className="text-sm font-medium">{new Date(staff.joinDate).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Qualifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Masters in Education</span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">2015 - 2017</span>
            </div>
            <div className="pl-6 text-xs text-muted-foreground">University of Education</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bachelor of Science</span>
            </div>
            <div className="flex items-center gap-2 pl-6">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">2011 - 2014</span>
            </div>
            <div className="pl-6 text-xs text-muted-foreground">State University</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffProfileView;
