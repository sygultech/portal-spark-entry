
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { AcademicYear } from '@/types/academic';

// Mock academic year data
const mockAcademicYears: AcademicYear[] = [
  {
    id: '1',
    name: 'Academic Year 2024-2025',
    start_date: '2024-08-01',
    end_date: '2025-05-31',
    is_active: true,
    is_archived: false,
    school_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Academic Year 2023-2024',
    start_date: '2023-08-01',
    end_date: '2024-05-31',
    is_active: false,
    is_archived: true,
    school_id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

interface AcademicContextType {
  currentAcademicYear: AcademicYear | null;
  setCurrentAcademicYear: (year: AcademicYear | null) => void;
  academicYears: AcademicYear[];
  isLoading: boolean;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Set up mock data
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const activeYear = mockAcademicYears.find(y => y.is_active);
      if (activeYear) {
        setCurrentAcademicYear(activeYear);
      } else if (mockAcademicYears.length > 0) {
        setCurrentAcademicYear(mockAcademicYears[0]);
      }
      setIsLoading(false);
    }, 500);
  }, []);
  
  return (
    <AcademicContext.Provider 
      value={{ 
        currentAcademicYear, 
        setCurrentAcademicYear,
        academicYears: mockAcademicYears,
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
