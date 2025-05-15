
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Award } from "lucide-react";

interface GradingSystem {
  id: string;
  name: string;
  description: string;
  type: "Marks" | "Grade" | "Hybrid";
  school_id: string;
}

interface GradeScale {
  id: string;
  grading_system_id: string;
  grade: string;
  min_score: number;
  max_score: number;
  description?: string;
}

const GradingSystem = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [gradingSystems, setGradingSystems] = useState<GradingSystem[]>([]);
  const [gradeScales, setGradeScales] = useState<GradeScale[]>([]);
  const [loading, setLoading] = useState(true);
  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [scaleDialogOpen, setScaleDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);
  
  const [systemForm, setSystemForm] = useState({
    name: "",
    description: "",
    type: "Marks" as "Marks" | "Grade" | "Hybrid",
  });
  
  const [scaleForm, setScaleForm] = useState({
    grade: "",
    min_score: 0,
    max_score: 0,
    description: "",
    grading_system_id: "",
  });

  const fetchGradingSystems = async () => {
    try {
      setLoading(true);
      
      // Mock data - in a real implementation this would fetch from Supabase
      const mockSystems: GradingSystem[] = [
        {
          id: "1",
          name: "Standard Marks System",
          description: "Default marks-based grading system with A-F grades",
          type: "Marks",
          school_id: profile?.school_id || "",
        },
        {
          id: "2",
          name: "Primary School Grades",
          description: "Simplified grade system for primary classes",
          type: "Grade",
          school_id: profile?.school_id || "",
        },
      ];
      
      const mockScales: GradeScale[] = [
        {
          id: "1",
          grading_system_id: "1",
          grade: "A+",
          min_score: 90,
          max_score: 100,
          description: "Outstanding",
        },
        {
          id: "2",
          grading_system_id: "1",
          grade: "A",
          min_score: 80,
          max_score: 89,
          description: "Excellent",
        },
        {
          id: "3",
          grading_system_id: "1",
          grade: "B",
          min_score: 70,
          max_score: 79,
          description: "Very Good",
        },
        {
          id: "4",
          grading_system_id: "1",
          grade: "C",
          min_score: 60,
          max_score: 69,
          description: "Good",
        },
        {
          id: "5",
          grading_system_id: "1",
          grade: "D",
          min_score: 50,
          max_score: 59,
          description: "Satisfactory",
        },
        {
          id: "6",
          grading_system_id: "1",
          grade: "F",
          min_score: 0,
          max_score: 49,
          description: "Fail",
        },
        {
          id: "7",
          grading_system_id: "2",
          grade: "Outstanding",
          min_score: 85,
          max_score: 100,
          description: "Exceptional performance",
        },
        {
          id: "8",
          grading_system_id: "2",
          grade: "Good",
          min_score: 70,
          max_score: 84,
          description: "Above average performance",
        },
        {
          id: "9",
          grading_system_id: "2",
          grade: "Satisfactory",
          min_score: 50,
          max_score: 69,
          description: "Average performance",
        },
        {
          id: "10",
          grading_system_id: "2",
          grade: "Needs Improvement",
          min_score: 0,
          max_score: 49,
          description: "Below average performance",
        },
      ];
      
      setGradingSystems(mockSystems);
      setGradeScales(mockScales);
      setLoading(false);
      
      // Set the first system as selected by default
      if (mockSystems.length > 0 && !selectedSystem) {
        setSelectedSystem(mockSystems[0].id);
      }
      
    } catch (error) {
      console.error("Error fetching grading systems:", error);
      toast({
        title: "Error",
        description: "Failed to fetch grading systems. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  // Initial data fetch
  useState(() => {
    fetchGradingSystems();
  });

  const handleSystemInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSystemForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSystemSelectChange = (value: "Marks" | "Grade" | "Hybrid") => {
    setSystemForm((prev) => ({
      ...prev,
      type: value,
    }));
  };

  const handleScaleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setScaleForm((prev) => ({
      ...prev,
      [name]: type === "number" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real implementation, this would save to Supabase
    const newSystem: GradingSystem = {
      id: Date.now().toString(),
      ...systemForm,
      school_id: profile?.school_id || "",
    };

    setGradingSystems((prev) => [...prev, newSystem]);
    setSelectedSystem(newSystem.id);
    setSystemDialogOpen(false);
    toast({
      title: "Grading system created",
      description: `${systemForm.name} has been added successfully.`,
    });
    
    // Reset form
    setSystemForm({
      name: "",
      description: "",
      type: "Marks",
    });
  };

  const handleScaleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSystem) {
      toast({
        title: "Error",
        description: "Please select a grading system first.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would save to Supabase
    const newScale: GradeScale = {
      id: Date.now().toString(),
      ...scaleForm,
      grading_system_id: selectedSystem,
    };

    setGradeScales((prev) => [...prev, newScale]);
    setScaleDialogOpen(false);
    toast({
      title: "Grade scale added",
      description: `Grade '${scaleForm.grade}' has been added successfully.`,
    });
    
    // Reset form
    setScaleForm({
      grade: "",
      min_score: 0,
      max_score: 0,
      description: "",
      grading_system_id: selectedSystem,
    });
  };

  const filteredScales = selectedSystem 
    ? gradeScales.filter(scale => scale.grading_system_id === selectedSystem) 
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Grading Systems</h3>
        <Dialog open={systemDialogOpen} onOpenChange={setSystemDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Grading System</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Grading System</DialogTitle>
              <DialogDescription>
                Define a new grading system for your school.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSystemSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">System Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={systemForm.name}
                    onChange={handleSystemInputChange}
                    placeholder="e.g. Standard Grading"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={systemForm.description}
                    onChange={handleSystemInputChange}
                    placeholder="Brief description of this grading system"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Grading Type</Label>
                  <Select
                    value={systemForm.type}
                    onValueChange={(value: "Marks" | "Grade" | "Hybrid") => handleSystemSelectChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Marks">Marks-based</SelectItem>
                      <SelectItem value="Grade">Grade-based</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Grading System</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Available Grading Systems</CardTitle>
              <CardDescription>
                Select a grading system to view or edit its scales
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {gradingSystems.map((system) => (
                    <div
                      key={system.id}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedSystem === system.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                      onClick={() => setSelectedSystem(system.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        <h4 className="font-medium">{system.name}</h4>
                      </div>
                      <p className={`text-xs mt-1 ${
                        selectedSystem === system.id
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground"
                      }`}>
                        {system.type} • {gradeScales.filter(s => s.grading_system_id === system.id).length} scales
                      </p>
                    </div>
                  ))}
                  
                  {gradingSystems.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      No grading systems defined yet.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {selectedSystem 
                    ? gradingSystems.find(s => s.id === selectedSystem)?.name + " Scales" 
                    : "Grade Scales"
                  }
                </CardTitle>
                <CardDescription>
                  {selectedSystem
                    ? gradingSystems.find(s => s.id === selectedSystem)?.description || "Define grade ranges and criteria"
                    : "Select a grading system"
                  }
                </CardDescription>
              </div>
              
              {selectedSystem && (
                <Dialog open={scaleDialogOpen} onOpenChange={setScaleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">Add Grade Scale</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Grade Scale</DialogTitle>
                      <DialogDescription>
                        Define a new grade scale for the selected grading system.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleScaleSubmit}>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="grade">Grade</Label>
                          <Input
                            id="grade"
                            name="grade"
                            value={scaleForm.grade}
                            onChange={handleScaleInputChange}
                            placeholder="e.g. A+ or Excellent"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="min_score">Minimum Score (%)</Label>
                            <Input
                              id="min_score"
                              name="min_score"
                              type="number"
                              value={scaleForm.min_score}
                              onChange={handleScaleInputChange}
                              min="0"
                              max="100"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="max_score">Maximum Score (%)</Label>
                            <Input
                              id="max_score"
                              name="max_score"
                              type="number"
                              value={scaleForm.max_score}
                              onChange={handleScaleInputChange}
                              min="0"
                              max="100"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="description">Description (Optional)</Label>
                          <Input
                            id="description"
                            name="description"
                            value={scaleForm.description}
                            onChange={handleScaleInputChange}
                            placeholder="e.g. Outstanding performance"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Add Scale</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : selectedSystem ? (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead>Range</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredScales.length > 0 ? (
                        filteredScales
                          .sort((a, b) => b.max_score - a.max_score)
                          .map((scale) => (
                            <TableRow key={scale.id}>
                              <TableCell className="font-medium">{scale.grade}</TableCell>
                              <TableCell>{scale.min_score}% - {scale.max_score}%</TableCell>
                              <TableCell>{scale.description || "—"}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" size="sm">Edit</Button>
                                  <Button variant="outline" size="sm">Delete</Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                            No grade scales defined for this system yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
                  <Award className="h-12 w-12 mb-2 opacity-20" />
                  <p>Select a grading system from the left panel</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GradingSystem;
