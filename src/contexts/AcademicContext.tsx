
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { fetchAcademicYears } from '@/services/academicYearService';
import { fetchAcademicSettings } from '@/services/academicSettingsService';
import type { AcademicYear } from '@/types/academic';

interface AcademicContextType {
  currentAcademicYear: AcademicYear | null;
  setCurrentAcademicYear: (year: AcademicYear | null) => void;
  academicYears: AcademicYear[];
  isLoading: boolean;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const schoolId = profile?.school_id;
  
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);
  
  // Fetch all academic years
  const { data: academicYears = [], isLoading: yearsLoading } = useQuery({
    queryKey: ['academicYears', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error("School ID is required");
      return fetchAcademicYears(schoolId);
    },
    enabled: !!schoolId
  });
  
  // Fetch academic settings to get the default academic year
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['academicSettings', schoolId],
    queryFn: () => {
      if (!schoolId) throw new Error("School ID is required");
      return fetchAcademicSettings(schoolId);
    },
    enabled: !!schoolId
  });
  
  // Set the current academic year based on default or active year
  useEffect(() => {
    if (!yearsLoading && academicYears.length > 0) {
      // If we have settings with a default year, use that
      if (settings?.default_academic_year_id) {
        const defaultYear = academicYears.find(y => y.id === settings.default_academic_year_id);
        if (defaultYear) {
          setCurrentAcademicYear(defaultYear);
          return;
        }
      }
      
      // Otherwise, find an active year
      const activeYear = academicYears.find(y => y.is_active);
      if (activeYear) {
        setCurrentAcademicYear(activeYear);
        return;
      }
      
      // If no active year, use the most recent one
      const sortedYears = [...academicYears].sort(
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      );
      if (sortedYears.length > 0) {
        setCurrentAcademicYear(sortedYears[0]);
      }
    }
  }, [academicYears, settings, yearsLoading]);
  
  const isLoading = yearsLoading || settingsLoading;
  
  return (
    <AcademicContext.Provider 
      value={{ 
        currentAcademicYear, 
        setCurrentAcademicYear,
        academicYears,
        isLoading 
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = () => {
  const context = useContext(AcademicContext);
  if (context === undefined) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
