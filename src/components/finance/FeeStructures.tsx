
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { FeeStructure } from "@/types/finance";
import FeeStructureForm from "./FeeStructureForm";

const FeeStructures = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);

  // Mock data
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([
    {
      id: "1",
      name: "Grade 1-5 Fee Structure",
      academicYear: "2024-25",
      components: [
        { id: "1", name: "Tuition Fee", amount: 15000, dueDate: "2024-04-15", recurring: "quarterly" },
        { id: "2", name: "Library Fee", amount: 2000, dueDate: "2024-04-01", recurring: "one-time" },
        { id: "3", name: "Exam Fee", amount: 1500, dueDate: "2024-10-01", recurring: "one-time" }
      ],
      totalAmount: 18500,
      assignedBatches: ["Grade 1A", "Grade 2B", "Grade 3A"],
      createdAt: "2024-03-01",
      updatedAt: "2024-03-15"
    },
    {
      id: "2",
      name: "Grade 6-10 Fee Structure",
      academicYear: "2024-25",
      components: [
        { id: "4", name: "Tuition Fee", amount: 20000, dueDate: "2024-04-15", recurring: "quarterly" },
        { id: "5", name: "Lab Fee", amount: 3000, dueDate: "2024-04-01", recurring: "one-time" },
        { id: "6", name: "Sports Fee", amount: 2500, dueDate: "2024-04-01", recurring: "one-time" }
      ],
      totalAmount: 25500,
      assignedBatches: ["Grade 6A", "Grade 7B", "Grade 8A", "Grade 9A", "Grade 10B"],
      createdAt: "2024-03-01",
      updatedAt: "2024-03-10"
    }
  ]);

  const filteredStructures = feeStructures.filter(structure =>
    structure.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    structure.academicYear.includes(searchTerm)
  );

  const handleCreateStructure = (newStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
    const structure: FeeStructure = {
      ...newStructure,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setFeeStructures([...feeStructures, structure]);
    setIsCreateModalOpen(false);
  };

  const handleEditStructure = (updatedStructure: FeeStructure) => {
    setFeeStructures(feeStructures.map(structure =>
      structure.id === updatedStructure.id
        ? { ...updatedStructure, updatedAt: new Date().toISOString() }
        : structure
    ));
    setEditingStructure(null);
  };

  const handleDeleteStructure = (id: string) => {
    setFeeStructures(feeStructures.filter(structure => structure.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Fee Structures</CardTitle>
            <p className="text-sm text-muted-foreground">
              Create and manage fee structure templates
            </p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Structure
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Fee Structure</DialogTitle>
              </DialogHeader>
              <FeeStructureForm
                onSubmit={handleCreateStructure}
                onCancel={() => setIsCreateModalOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center space-x-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search fee structures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Structure Name</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Components</TableHead>
              <TableHead>Assigned Batches</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStructures.map((structure) => (
              <TableRow key={structure.id}>
                <TableCell className="font-medium">{structure.name}</TableCell>
                <TableCell>{structure.academicYear}</TableCell>
                <TableCell>₹{structure.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {structure.components.length} components
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {structure.assignedBatches.slice(0, 2).map((batch, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {batch}
                      </Badge>
                    ))}
                    {structure.assignedBatches.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{structure.assignedBatches.length - 2} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingStructure(structure)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteStructure(structure.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Modal */}
        {editingStructure && (
          <Dialog open={true} onOpenChange={() => setEditingStructure(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Fee Structure</DialogTitle>
              </DialogHeader>
              <FeeStructureForm
                initialData={editingStructure}
                onSubmit={handleEditStructure}
                onCancel={() => setEditingStructure(null)}
              />
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};

export default FeeStructures;
