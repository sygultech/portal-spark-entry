
import { useState, useEffect } from 'react';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { AcademicYear } from '@/types/academic';

export function useAcademicYearSelector() {
  const { academicYears, isLoading } = useAcademicYears();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('');

  // Set the current academic year as default when data loads
  useEffect(() => {
    if (academicYears.length > 0 && !selectedAcademicYear) {
      const currentYear = academicYears.find(year => year.is_current);
      if (currentYear) {
        setSelectedAcademicYear(currentYear.id);
      } else {
        // If no current year is set, default to the first one
        setSelectedAcademicYear(academicYears[0].id);
      }
    }
  }, [academicYears, selectedAcademicYear]);

  const selectedYear = academicYears.find(year => year.id === selectedAcademicYear);

  return {
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
    selectedYear,
    isLoading
  };
}
