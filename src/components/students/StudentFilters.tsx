
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentFiltersProps {
  activeFilters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  className?: string;
}

export default function StudentFilters({ 
  activeFilters, 
  onFilterChange, 
  className = "" 
}: StudentFiltersProps) {
  const [filters, setFilters] = useState<Record<string, any>>(activeFilters);

  // Sample data - to be replaced with real data when backend is implemented
  const batches = [
    { id: "1", name: "Grade 10A" },
    { id: "2", name: "Grade 10B" },
    { id: "3", name: "Grade 9A" },
  ];
  
  const categories = [
    { id: "1", name: "Regular" },
    { id: "2", name: "Scholarship" },
    { id: "3", name: "Special Needs" },
    { id: "4", name: "Transfer" },
  ];

  const handleFilterChange = (key: string, value: any) => {
    const updatedFilters = { ...filters, [key]: value };
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
  };

  const resetFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  // Apply filters when component mounts with initial activeFilters
  useEffect(() => {
    setFilters(activeFilters);
  }, [activeFilters]);

  return (
    <div className={`border rounded-lg p-4 bg-muted/30 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="space-y-2">
          <Label htmlFor="batch">Batch/Class</Label>
          <Select
            value={filters.batchId || ""}
            onValueChange={(value) => handleFilterChange("batchId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select batch" />
            </SelectTrigger>
            <SelectContent>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <Select
            value={filters.gender || ""}
            onValueChange={(value) => handleFilterChange("gender", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.categoryId || ""}
            onValueChange={(value) => handleFilterChange("categoryId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="admissionDate">Admission Date</Label>
          <Input
            id="admissionDate"
            type="date"
            value={filters.admissionDate || ""}
            onChange={(e) => handleFilterChange("admissionDate", e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={resetFilters}>Reset</Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  );
}

// force update

// force update
