
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Trash2, Copy, FileText, Calendar, Users } from "lucide-react";

// Mock template data
const mockTemplates = [
  {
    id: "template-1",
    name: "Standard Weekly Template",
    description: "5-day week with 8 periods per day",
    createdDate: "2024-05-15",
    lastUsed: "2024-05-26",
    classes: ["Grade 6A", "Grade 6B", "Grade 7A"],
    isActive: true,
    createdBy: "School Admin",
    totalPeriods: 40,
    subjects: ["Math", "English", "Science", "History", "PE"]
  },
  {
    id: "template-2",
    name: "Exam Week Template",
    description: "Special schedule for examination periods",
    createdDate: "2024-05-10",
    lastUsed: "2024-05-20",
    classes: ["All Classes"],
    isActive: false,
    createdBy: "Academic Coordinator",
    totalPeriods: 30,
    subjects: ["All Subjects"]
  },
  {
    id: "template-3",
    name: "Activity Day Template",
    description: "Schedule for sports and activity days",
    createdDate: "2024-05-05",
    lastUsed: "2024-05-18",
    classes: ["Grade 6A", "Grade 7A", "Grade 7B"],
    isActive: false,
    createdBy: "Sports Coordinator",
    totalPeriods: 25,
    subjects: ["PE", "Music", "Art", "Drama"]
  },
];

export const TemplateManager = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    basedOn: ""
  });

  const handleCreateTemplate = () => {
    if (newTemplate.name.trim()) {
      const template = {
        id: `template-${Date.now()}`,
        name: newTemplate.name,
        description: newTemplate.description,
        createdDate: new Date().toISOString().split('T')[0],
        lastUsed: "Never",
        classes: ["Current Selection"],
        isActive: false,
        createdBy: "School Admin",
        totalPeriods: 40,
        subjects: ["Current Subjects"]
      };
      setTemplates(prev => [...prev, template]);
      setNewTemplate({ name: "", description: "", basedOn: "" });
      setShowCreateForm(false);
      console.log("Creating new template:", template);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    console.log("Loading template:", templateId);
    setTemplates(prev => prev.map(template => ({
      ...template,
      isActive: template.id === templateId,
      lastUsed: template.id === templateId ? new Date().toISOString().split('T')[0] : template.lastUsed
    })));
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplates(prev => prev.filter(template => template.id !== templateId));
    console.log("Deleting template:", templateId);
  };

  const handleDuplicateTemplate = (template: any) => {
    const duplicatedTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: "Never",
      isActive: false,
      createdBy: "School Admin"
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
    console.log("Duplicating template:", duplicatedTemplate);
  };

  const handleExportTemplate = (templateId: string, format: string) => {
    console.log(`Exporting template ${templateId} as ${format}`);
  };

  const handleImportTemplate = () => {
    console.log("Importing template from file");
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
              <Button onClick={handleImportTemplate} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import Template
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Save, load, and manage timetable templates for reuse across classes and terms
          </CardDescription>
        </CardHeader>

        {/* Create Template Form */}
        {showCreateForm && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter description..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Base Template (Optional)</label>
                <select
                  value={newTemplate.basedOn}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, basedOn: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Create from current timetable</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTemplate}>Create Template</Button>
                <Button onClick={() => setShowCreateForm(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card 
            key={template.id} 
            className={`relative transition-shadow hover:shadow-md ${
              template.isActive ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{template.name}</span>
                <div className="flex items-center gap-1">
                  {template.isActive && (
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Template Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{template.totalPeriods} periods</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{template.classes.length} classes</span>
                  </div>
                </div>

                {/* Meta Information */}
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {template.createdDate}</p>
                  <p>Last used: {template.lastUsed}</p>
                  <p>By: {template.createdBy}</p>
                </div>
                
                {/* Applicable Classes */}
                <div>
                  <p className="text-xs font-medium mb-1">Applicable to:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.classes.slice(0, 2).map((className, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                    {template.classes.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.classes.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Subject Types */}
                <div>
                  <p className="text-xs font-medium mb-1">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.subjects.slice(0, 3).map((subject, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {subject}
                      </Badge>
                    ))}
                    {template.subjects.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.subjects.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-1">
                  <Button
                    onClick={() => handleLoadTemplate(template.id)}
                    size="sm"
                    variant={template.isActive ? "secondary" : "default"}
                    className="h-8"
                  >
                    {template.isActive ? "Active" : "Load"}
                  </Button>
                  
                  <div className="flex gap-1">
                    <Button
                      onClick={() => handleDuplicateTemplate(template)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="Duplicate"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      onClick={() => handleExportTemplate(template.id, "json")}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      title="Export"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      onClick={() => handleDeleteTemplate(template.id)}
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Template Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common template operations and bulk actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Save className="h-5 w-5 mb-2" />
              <span className="text-sm">Save Current</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Upload className="h-5 w-5 mb-2" />
              <span className="text-sm">Import Bulk</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Download className="h-5 w-5 mb-2" />
              <span className="text-sm">Export All</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Copy className="h-5 w-5 mb-2" />
              <span className="text-sm">Duplicate Active</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{templates.length}</div>
            <p className="text-xs text-muted-foreground">saved templates</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Active Template</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-green-600">
              {templates.find(t => t.isActive)?.name || "None"}
            </div>
            <p className="text-xs text-muted-foreground">currently in use</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Most Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-orange-600">Standard Weekly</div>
            <p className="text-xs text-muted-foreground">most frequently used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <p className="text-xs text-muted-foreground">conflict-free usage</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
