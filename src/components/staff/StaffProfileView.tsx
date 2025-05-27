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
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string | null;
    employee_id: string;
    department_id: string;
    designation_id: string;
    email: string;
    phone: string;
    employment_status: string;
    join_date: string;
    department?: { name: string };
    designation?: { name: string };
  };
}

const StaffProfileView: React.FC<StaffProfileViewProps> = ({ staff }) => {
  const fullName = `${staff.first_name} ${staff.last_name}`;
  
  return (
    <div className="space-y-6 py-4">
      <div className="flex flex-col items-center space-y-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={staff.avatar_url || undefined} alt={fullName} />
          <AvatarFallback className="text-lg">
            {staff.first_name?.[0]}{staff.last_name?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <h3 className="text-xl font-semibold">{fullName}</h3>
          <p className="text-sm text-muted-foreground">{staff.designation?.name}</p>
          <Badge variant={
            staff.employment_status === "Active" ? "default" : 
            staff.employment_status === "On Leave" ? "outline" : "secondary"
          } className="mt-2">
            {staff.employment_status}
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
            <span className="text-sm font-medium">{staff.employee_id}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Department</span>
            </div>
            <span className="text-sm font-medium">{staff.department?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Designation</span>
            </div>
            <span className="text-sm font-medium">{staff.designation?.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Join Date</span>
            </div>
            <span className="text-sm font-medium">{new Date(staff.join_date).toLocaleDateString()}</span>
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
