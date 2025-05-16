
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { AcademicYear } from '@/types/academic';
import { fetchAcademicYears } from '@/services/academicYearService';
import { useToast } from '@/hooks/use-toast';

interface AcademicContextType {
  currentAcademicYear: AcademicYear | null;
  setCurrentAcademicYear: (year: AcademicYear | null) => void;
  academicYears: AcademicYear[];
  isLoading: boolean;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [currentAcademicYear, setCurrentAcademicYear] = useState<AcademicYear | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch academic years from the database
  useEffect(() => {
    async function loadAcademicYears() {
      if (profile?.school_id) {
        try {
          setIsLoading(true);
          const data = await fetchAcademicYears(profile.school_id);
          setAcademicYears(data);
          
          // Set current academic year to the active one, or the first one if none are active
          const activeYear = data.find(y => y.is_active);
          if (activeYear) {
            setCurrentAcademicYear(activeYear);
          } else if (data.length > 0) {
            setCurrentAcademicYear(data[0]);
          }
        } catch (error) {
          console.error("Error loading academic years:", error);
          toast({
            title: "Error",
            description: "Failed to load academic years. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }
    
    loadAcademicYears();
  }, [profile?.school_id, toast]);
  
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
