import { Category } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users } from "lucide-react";
import { useState } from "react";

interface CategoryManagerProps {
  categories: Category[];
  onCreateCategory: (category: Category) => void;
  onUpdateCategory: (categoryId: string, category: Partial<Category>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAssignStudents: (categoryId: string, studentIds: string[]) => void;
  onRemoveStudent: (categoryId: string, studentId: string) => void;
  students: { id: string; name: string }[];
}

export function CategoryManager({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onAssignStudents,
  onRemoveStudent,
  students,
}: CategoryManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    color: "#000000",
    students: [],
  });
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreate = () => {
    if (!newCategory.name) return;

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.name,
      description: newCategory.description || "",
      color: newCategory.color || "#000000",
      students: [],
    };

    onCreateCategory(category);
    setDialogOpen(false);
    setNewCategory({
      name: "",
      description: "",
      color: "#000000",
      students: [],
    });
  };

  const handleAssign = () => {
    if (!selectedCategory || !selectedStudents.length) return;

    onAssignStudents(selectedCategory.id, selectedStudents);
    setAssignDialogOpen(false);
    setSelectedStudents([]);
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedCategory?.students.includes(student.id)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Categories</h2>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Category
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setAssignDialogOpen(true);
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Assign Students
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {category.description}
                </p>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Students ({category.students.length})
                  </p>
                </div>
                <div className="space-y-1">
                  {category.students.map((studentId) => {
                    const student = students.find((s) => s.id === studentId);
                    return (
                      student && (
                        <div
                          key={studentId}
                          className="flex items-center justify-between py-1"
                        >
                          <span className="text-sm">{student.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveStudent(category.id, studentId)}
                          >
                            Remove
                          </Button>
                        </div>
                      )
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category);
                    setNewCategory(category);
                    setDialogOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteCategory(category.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Category Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategory ? "Edit Category" : "New Category"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div>
              <Label>Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className="w-12 h-12 p-1"
                />
                <Input
                  type="text"
                  value={newCategory.color}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, color: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              {selectedCategory ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Students Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Students to {selectedCategory?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Search Students</Label>
              <Input
                type="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="border rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
              {filteredStudents.map((student) => (
                <label
                  key={student.id}
                  className="flex items-center gap-2 hover:bg-accent p-2 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents((prev) => [...prev, student.id]);
                      } else {
                        setSelectedStudents((prev) =>
                          prev.filter((id) => id !== student.id)
                        );
                      }
                    }}
                  />
                  {student.name}
                </label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>Assign Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 