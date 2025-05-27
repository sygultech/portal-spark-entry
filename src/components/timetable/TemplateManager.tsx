
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Download, Upload, Trash2, Copy, FileText } from "lucide-react";

// Mock template data
const mockTemplates = [
  {
    id: "template-1",
    name: "Standard Weekly Template",
    description: "5-day week with 8 periods per day",
    createdDate: "2024-05-15",
    lastUsed: "2024-05-26",
    classes: ["Class 6A", "Class 6B", "Class 7A"],
    isActive: true
  },
  {
    id: "template-2",
    name: "Exam Week Template",
    description: "Special schedule for examination periods",
    createdDate: "2024-05-10",
    lastUsed: "2024-05-20",
    classes: ["All Classes"],
    isActive: false
  },
  {
    id: "template-3",
    name: "Activity Day Template",
    description: "Schedule for sports and activity days",
    createdDate: "2024-05-05",
    lastUsed: "2024-05-18",
    classes: ["Class 6A", "Class 7A", "Class 7B"],
    isActive: false
  },
];

export const TemplateManager = () => {
  const [templates, setTemplates] = useState(mockTemplates);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");

  const handleCreateTemplate = () => {
    if (newTemplateName.trim()) {
      const newTemplate = {
        id: `template-${Date.now()}`,
        name: newTemplateName,
        description: newTemplateDescription,
        createdDate: new Date().toISOString().split('T')[0],
        lastUsed: "Never",
        classes: ["Current Selection"],
        isActive: false
      };
      setTemplates(prev => [...prev, newTemplate]);
      setNewTemplateName("");
      setNewTemplateDescription("");
      setShowCreateForm(false);
      console.log("Creating new template:", newTemplate);
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
      isActive: false
    };
    setTemplates(prev => [...prev, duplicatedTemplate]);
    console.log("Duplicating template:", duplicatedTemplate);
  };

  const handleExportTemplate = (templateId: string) => {
    console.log("Exporting template:", templateId);
  };

  const handleImportTemplate = () => {
    console.log("Importing template from file");
  };

  return (
    <div className="space-y-6">
      {/* Template Actions */}
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
          <CardDescription>Save, load, and manage timetable templates for reuse</CardDescription>
        </CardHeader>
        {showCreateForm && (
          <CardContent className="border-t">
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.target.value)}
                    placeholder="Enter template name..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input
                    type="text"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.target.value)}
                    placeholder="Enter description..."
                    className="w-full p-2 border rounded-md"
                  />
                </div>
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

      {/* Template List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className={`relative ${template.isActive ? "ring-2 ring-primary" : ""}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{template.name}</span>
                {template.isActive && (
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                )}
              </CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Created: {template.createdDate}</p>
                  <p>Last used: {template.lastUsed}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium mb-1">Applicable to:</p>
                  <div className="flex flex-wrap gap-1">
                    {template.classes.map((className, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {className}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  <Button
                    onClick={() => handleLoadTemplate(template.id)}
                    size="sm"
                    variant={template.isActive ? "secondary" : "default"}
                    className="flex-1"
                  >
                    {template.isActive ? "Active" : "Load"}
                  </Button>
                  
                  <Button
                    onClick={() => handleDuplicateTemplate(template)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    onClick={() => handleExportTemplate(template.id)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0"
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    onClick={() => handleDeleteTemplate(template.id)}
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
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
          <CardDescription>Common template operations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Save className="h-5 w-5 mb-2" />
              <span className="text-sm">Save Current</span>
            </Button>
            
            <Button variant="outline" className="h-16 flex flex-col items-center justify-center">
              <Upload className="h-5 w-5 mb-2" />
              <span className="text-sm">Import from File</span>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
};
