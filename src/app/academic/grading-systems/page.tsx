'use client';

import { useState } from "react";
import { GradingSystem } from "@/types/academic";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, StarOff, Pencil, Trash2 } from "lucide-react";
import { GradingSystemDialog } from "@/components/academic/GradingSystemDialog";

export default function GradingSystemsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<GradingSystem | null>(null);

  // Mock data - replace with actual API calls
  const mockGradingSystems: GradingSystem[] = [
    {
      id: "1",
      name: "Standard Marks System",
      type: "marks",
      description: "Default marks-based grading system",
      passing_score: 33,
      school_id: "1",
      thresholds: [
        { grade: "A+", min_score: 90, max_score: 100 },
        { grade: "A", min_score: 80, max_score: 89 },
      ],
    },
    {
      id: "2",
      name: "CGPA System",
      type: "grades",
      description: "Grade point average system",
      passing_score: 40,
      school_id: "1",
      thresholds: [
        { grade: "O", min_score: 90, max_score: 100 },
        { grade: "A+", min_score: 80, max_score: 89 },
      ],
    },
  ];

  const defaultGradingSystemId = "1"; // Mock default system ID

  const handleCreateSystem = () => {
    setSelectedSystem(null);
    setIsDialogOpen(true);
  };

  const handleEditSystem = (system: GradingSystem) => {
    setSelectedSystem(system);
    setIsDialogOpen(true);
  };

  const handleDeleteSystem = (systemId: string) => {
    // Implement delete functionality
    console.log("Delete system:", systemId);
  };

  const handleSetDefault = (systemId: string) => {
    // Implement set default functionality
    console.log("Set default system:", systemId);
  };

  const getTypeLabel = (type: 'marks' | 'grades' | 'hybrid') => {
    switch (type) {
      case 'marks':
        return 'Marks Based';
      case 'grades':
        return 'Grade Based';
      case 'hybrid':
        return 'Hybrid';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Grading Systems</CardTitle>
            <CardDescription>
              Manage your institution's grading systems and set defaults
            </CardDescription>
          </div>
          <Button onClick={handleCreateSystem}>
            <Plus className="h-4 w-4 mr-2" />
            Add Grading System
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Passing Score</TableHead>
                <TableHead>Grade Thresholds</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockGradingSystems.map((system) => (
                <TableRow key={system.id}>
                  <TableCell className="font-medium">
                    {system.name}
                    {system.id === defaultGradingSystemId && (
                      <Badge variant="secondary" className="ml-2">
                        Default
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTypeLabel(system.type)}
                    </Badge>
                  </TableCell>
                  <TableCell>{system.passing_score}%</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {system.thresholds.map((threshold, index) => (
                        <Badge key={index} variant="outline">
                          {threshold.grade}: {threshold.min_score}-{threshold.max_score}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {/* Mock usage data */}
                    <div className="text-sm text-muted-foreground">
                      Used in 2 batches, 5 subjects
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {system.id !== defaultGradingSystemId ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSetDefault(system.id)}
                          title="Set as Default"
                        >
                          <StarOff className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-yellow-500"
                          title="Default System"
                        >
                          <Star className="h-4 w-4 fill-current" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditSystem(system)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteSystem(system.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <GradingSystemDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        system={selectedSystem}
      />
    </div>
  );
} 