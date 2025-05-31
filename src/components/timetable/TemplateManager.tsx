import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Trash2, Copy, FileText, Calendar, Users } from "lucide-react";
import CreateTimetableTemplate from "./CreateTimetableTemplate";
import DragDropTimetableTemplate from "./DragDropTimetableTemplate";

// Mock template data
const mockTemplates = [
  {
    id: "template-1",
    name: "Standard 6-Day Template",
    description: "Standard template for 6-day school week",
    createdDate: "2024-03-15",
    lastUsed: "2024-03-20",
    classes: ["Grade 6", "Grade 7", "Grade 8"],
    isActive: true,
    createdBy: "School Admin",
    totalPeriods: 40,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    periodDuration: 45,
    breakDuration: 15,
    lunchDuration: 45
  },
  {
    id: "template-2",
    name: "5-Day Template",
    description: "Template optimized for 5-day school week",
    createdDate: "2024-03-10",
    lastUsed: "Never",
    classes: ["Current Selection"],
    isActive: false,
    createdBy: "School Admin",
    totalPeriods: 40,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    periodDuration: 45,
    breakDuration: 15,
    lunchDuration: 45
  }
];

export const TemplateManager = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const handleCreateTemplate = (template: any) => {
    setTemplates(prev => [...prev, {
      ...template,
      id: `template-${Date.now()}`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      classes: ["Current Selection"],
      isActive: false,
      createdBy: "School Admin",
      totalPeriods: 40
    }]);
    setShowCreateForm(false);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== templateId));
  };

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    // Implementation for applying template
    console.log("Applying template:", templateId);
  };

  const handleExportTemplate = (templateId: string) => {
    // Implementation for exporting template
    console.log("Exporting template:", templateId);
  };

  return (
    <div className="space-y-6">
      {/* Template Actions Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Timetable Templates
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateForm(true)} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Current as Template
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Template
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Create, manage, and apply timetable templates for different classes and terms
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Template Creation Form */}
      {showCreateForm && (
        <CardContent className="border-t">
          <DragDropTimetableTemplate
            onSave={handleCreateTemplate}
            onCancel={() => setShowCreateForm(false)}
          />
        </CardContent>
      )}

      {/* Templates List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </div>
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {template.createdDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Classes: {template.classes.join(", ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Last Used: {template.lastUsed}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApplyTemplate(template.id)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Apply
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportTemplate(template.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
