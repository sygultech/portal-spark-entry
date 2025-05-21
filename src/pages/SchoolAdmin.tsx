
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Settings, Building, MessageSquare, Landmark } from "lucide-react";
import { Link } from "react-router-dom";
import { useSchoolSettings } from "@/hooks/useSchoolSettings";

const SchoolAdmin = () => {
  const { profile, isLoading } = useAuth();
  const { school } = useSchoolSettings();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not school_admin
  if (profile?.role !== "school_admin") {
    return <Navigate to="/" />;
  }

  const modules = [
    {
      title: "Student Management",
      description: "Manage students, admissions, and student records",
      icon: Users,
      href: "/students", // To be implemented
    },
    {
      title: "Teacher Management",
      description: "Manage teaching staff, assignments, and schedules",
      icon: Users,
      href: "/teachers", // To be implemented
    },
    {
      title: "School Settings",
      description: "Configure school profile, preferences, and system settings",
      icon: Settings,
      href: "/school-settings", // To be implemented
    },
    {
      title: "Facilities",
      description: "Manage school buildings, rooms and resources",
      icon: Building,
      href: "/facilities", // To be implemented
    },
    {
      title: "Communication",
      description: "Messages, announcements and notifications",
      icon: MessageSquare,
      href: "/communications", // To be implemented
    },
    {
      title: "Finance",
      description: "Manage school finances, fees and accounting",
      icon: Landmark,
      href: "/finance", // To be implemented
    }
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">School Administration</h1>
      <p className="mb-6">Welcome to the School Administration Dashboard. Please select a module to manage.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <Card key={module.title} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <module.icon className="h-5 w-5" />
                {module.title}
              </CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to={module.href}>Access Module</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SchoolAdmin;

// force update

// force update
