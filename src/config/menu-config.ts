
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  Building, 
  BarChart, 
  CreditCard, 
  Puzzle, 
  LifeBuoy,
  GraduationCap,
  UserRound,
  CalendarDays,
  ClipboardCheck,
  Landmark,
  BookOpen,
  Bus,
  Home,
  MessageSquare,
  FileText,
  School,
  Clock,
  BookCheck,
  FileSpreadsheet,
  FileEdit,
  Award,
  Baby,
  Receipt,
  // Certificate is not available in lucide-react, replacing with Award
} from "lucide-react";

type MenuItem = {
  label: string;
  path: string;
  icon: any;
  badge?: number;
};

type MenuConfig = {
  [key: string]: MenuItem[];
};

// Centralized menu configuration for all user roles
export const menuConfig: MenuConfig = {
  super_admin: [
    { label: "Dashboard", path: "/super-admin-dashboard", icon: LayoutDashboard },
    { label: "Tenants", path: "/school-management", icon: Building },
    { label: "Users", path: "/users", icon: Users },
    { label: "Analytics", path: "/analytics", icon: BarChart },
    { label: "Billing", path: "/billing", icon: CreditCard },
    { label: "Modules", path: "/modules", icon: Puzzle },
    { label: "Support", path: "/support", icon: LifeBuoy },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  
  school_admin: [
    { label: "Dashboard", path: "/school-admin", icon: LayoutDashboard },
    { label: "Academic", path: "/academic", icon: School },
    { label: "Students", path: "/students", icon: GraduationCap, badge: 3 },
    { label: "Staff & HR", path: "/staff", icon: UserRound },
    { label: "Timetable", path: "/timetable", icon: CalendarDays },
    { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { label: "Fees", path: "/fees", icon: Landmark },
    { label: "Library", path: "/library", icon: BookOpen },
    { label: "Transport", path: "/transport", icon: Bus },
    { label: "Hostel", path: "/hostel", icon: Home },
    { label: "Communication", path: "/communication", icon: MessageSquare, badge: 5 },
    { label: "Reports", path: "/reports", icon: FileText },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  
  teacher: [
    { label: "Dashboard", path: "/teacher", icon: LayoutDashboard },
    { label: "Classes", path: "/classes", icon: GraduationCap },
    { label: "Timetable", path: "/timetable", icon: CalendarDays },
    { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { label: "Subjects", path: "/subjects", icon: BookOpen },
    { label: "Assignments", path: "/assignments", icon: FileEdit, badge: 2 },
    { label: "Examinations", path: "/examinations", icon: FileSpreadsheet },
    { label: "Library", path: "/library", icon: BookOpen },
    { label: "Messaging", path: "/messaging", icon: MessageSquare, badge: 3 },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  
  student: [
    { label: "Dashboard", path: "/student", icon: LayoutDashboard },
    { label: "Timetable", path: "/timetable", icon: CalendarDays },
    { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { label: "Subjects", path: "/subjects", icon: BookOpen },
    { label: "Assignments", path: "/assignments", icon: FileEdit, badge: 4 },
    { label: "Examinations", path: "/examinations", icon: FileSpreadsheet },
    { label: "Fees", path: "/fees", icon: Receipt },
    { label: "Messaging", path: "/messaging", icon: MessageSquare },
    { label: "Certificates", path: "/certificates", icon: Award },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  
  parent: [
    { label: "Dashboard", path: "/parent", icon: LayoutDashboard },
    { label: "Children", path: "/children", icon: Baby, badge: 2 },
    { label: "Timetable", path: "/timetable", icon: CalendarDays },
    { label: "Attendance", path: "/attendance", icon: ClipboardCheck },
    { label: "Academics", path: "/academics", icon: School },
    { label: "Assignments", path: "/assignments", icon: FileEdit },
    { label: "Examinations", path: "/examinations", icon: FileSpreadsheet },
    { label: "Fees", path: "/fees", icon: Receipt },
    { label: "Messaging", path: "/messaging", icon: MessageSquare, badge: 1 },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
};

// Debug logging
console.log("Menu config loaded:", menuConfig);
