
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { FeeStructure, FeeComponent } from "@/types/finance";

interface FeeStructureFormProps {
  initialData?: FeeStructure;
  onSubmit: (data: FeeStructure | Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const FeeStructureForm: React.FC<FeeStructureFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: "",
    academicYear: "2024-25",
    assignedBatches: [] as string[]
  });

  const [components, setComponents] = useState<FeeComponent[]>([
    {
      id: Date.now().toString(),
      name: "",
      amount: 0,
      dueDate: "",
      recurring: "one-time" as const
    }
  ]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        academicYear: initialData.academicYear,
        assignedBatches: initialData.assignedBatches
      });
      setComponents(initialData.components);
    }
  }, [initialData]);

  const addComponent = () => {
    const newComponent: FeeComponent = {
      id: Date.now().toString(),
      name: "",
      amount: 0,
      dueDate: "",
      recurring: "one-time"
    };
    setComponents([...components, newComponent]);
  };

  const removeComponent = (id: string) => {
    if (components.length > 1) {
      setComponents(components.filter(comp => comp.id !== id));
    }
  };

  const updateComponent = (id: string, field: keyof FeeComponent, value: any) => {
    setComponents(components.map(comp =>
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const calculateTotal = () => {
    return components.reduce((total, comp) => total + (comp.amount || 0), 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const structureData = {
      ...formData,
      components,
      totalAmount: calculateTotal()
    };

    if (initialData) {
      onSubmit({
        ...initialData,
        ...structureData
      });
    } else {
      onSubmit(structureData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Structure Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grade 1-5 Fee Structure"
                required
              />
            </div>
            <div>
              <Label htmlFor="academicYear">Academic Year *</Label>
              <Select
                value={formData.academicYear}
                onValueChange={(value) => setFormData({ ...formData, academicYear: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024-25">2024-25</SelectItem>
                  <SelectItem value="2025-26">2025-26</SelectItem>
                  <SelectItem value="2026-27">2026-27</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Components */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Fee Components</CardTitle>
            <Button type="button" variant="outline" onClick={addComponent}>
              <Plus className="h-4 w-4 mr-2" />
              Add Component
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {components.map((component, index) => (
            <div key={component.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
              <div className="col-span-3">
                <Label>Component Name *</Label>
                <Input
                  value={component.name}
                  onChange={(e) => updateComponent(component.id, 'name', e.target.value)}
                  placeholder="e.g., Tuition Fee"
                  required
                />
              </div>
              <div className="col-span-2">
                <Label>Amount (₹) *</Label>
                <Input
                  type="number"
                  value={component.amount || ''}
                  onChange={(e) => updateComponent(component.id, 'amount', Number(e.target.value))}
                  placeholder="0"
                  required
                />
              </div>
              <div className="col-span-3">
                <Label>Due Date *</Label>
                <Input
                  type="date"
                  value={component.dueDate}
                  onChange={(e) => updateComponent(component.id, 'dueDate', e.target.value)}
                  required
                />
              </div>
              <div className="col-span-3">
                <Label>Recurring</Label>
                <Select
                  value={component.recurring}
                  onValueChange={(value) => updateComponent(component.id, 'recurring', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one-time">One Time</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-1">
                {components.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeComponent(component.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {/* Total Amount Display */}
          <div className="flex justify-end items-center space-x-4 pt-4 border-t">
            <span className="text-lg font-semibold">
              Total Amount: ₹{calculateTotal().toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Structure" : "Create Structure"}
        </Button>
      </div>
    </form>
  );
};

export default FeeStructureForm;
