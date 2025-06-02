
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { AcademicYear } from "@/types/academic";

interface AcademicYearSelectorProps {
  academicYears: AcademicYear[];
  selectedAcademicYear: string;
  onAcademicYearChange: (yearId: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const AcademicYearSelector = ({
  academicYears,
  selectedAcademicYear,
  onAcademicYearChange,
  isLoading = false,
  className = ""
}: AcademicYearSelectorProps) => {
  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Calendar className="h-4 w-4" />
        <div className="w-48 h-10 bg-gray-100 animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedAcademicYear} onValueChange={onAcademicYearChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Select Academic Year" />
        </SelectTrigger>
        <SelectContent className="bg-white border shadow-lg z-50">
          {academicYears.map((year) => (
            <SelectItem key={year.id} value={year.id} className="hover:bg-gray-100">
              <div className="flex items-center justify-between w-full">
                <span>{year.name}</span>
                {year.is_current && (
                  <Badge variant="default" className="ml-2 text-xs">
                    Current
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
