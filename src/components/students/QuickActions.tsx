import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  FileText,
  GraduationCap,
  Users,
  Download,
  Upload,
  Filter,
} from "lucide-react";

interface QuickActionsProps {
  onBulkImport: () => void;
  onExportData: () => void;
  totalStudents: number;
  activeStudents: number;
  pendingAdmissions: number;
}

export function QuickActions({
  onBulkImport,
  onExportData,
  totalStudents,
  activeStudents,
  pendingAdmissions,
}: QuickActionsProps) {
  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50">
          <div className="flex items-center gap-4">
            <GraduationCap className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Active Students</p>
              <p className="text-2xl font-bold">{activeStudents}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-orange-50">
          <div className="flex items-center gap-4">
            <FileText className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Pending Admissions</p>
              <p className="text-2xl font-bold">{pendingAdmissions}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onBulkImport} className="flex-1">
          <Upload className="w-4 h-4 mr-2" />
          Bulk Import
        </Button>
        <Button variant="outline" onClick={onExportData} className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Export Data
        </Button>
        <Button variant="outline" className="flex-1">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
        </Button>
      </div>
    </div>
  );
}

// force update

// force update
