
import { supabase } from '@/integrations/supabase/client';
import { AcademicYear, CloneStructureOptions, CloneStructureResult } from '@/types/academic';

// Mock data to use instead of actual backend calls
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

// Mocked functions that no longer interact with the backend
export async function fetchAcademicYears(schoolId?: string) {
  console.log('Mocked fetchAcademicYears called with schoolId:', schoolId);
  // Return mock data instead of querying the database
  return mockAcademicYears;
}

export async function fetchAcademicYear(id: string) {
  console.log('Mocked fetchAcademicYear called with id:', id);
  const academicYear = mockAcademicYears.find(year => year.id === id);
  if (!academicYear) {
    throw new Error('Academic year not found');
  }
  return academicYear;
}

export async function createAcademicYear(academicYear: Omit<AcademicYear, 'id' | 'created_at' | 'updated_at'>) {
  console.log('Mocked createAcademicYear called with:', academicYear);
  // Create a new mock academic year
  const newAcademicYear: AcademicYear = {
    id: Date.now().toString(),
    ...academicYear,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  // For demonstration purposes only (this won't persist between page reloads)
  mockAcademicYears.push(newAcademicYear);
  return newAcademicYear;
}

export async function updateAcademicYear(id: string, academicYear: Partial<AcademicYear>) {
  console.log('Mocked updateAcademicYear called with id:', id, 'and data:', academicYear);
  const index = mockAcademicYears.findIndex(year => year.id === id);
  if (index === -1) {
    throw new Error('Academic year not found');
  }
  
  // Update the mock academic year
  mockAcademicYears[index] = {
    ...mockAcademicYears[index],
    ...academicYear,
    updated_at: new Date().toISOString()
  };
  
  return mockAcademicYears[index];
}

export async function deleteAcademicYear(id: string) {
  console.log('Mocked deleteAcademicYear called with id:', id);
  const index = mockAcademicYears.findIndex(year => year.id === id);
  if (index === -1) {
    throw new Error('Academic year not found');
  }
  
  // Remove the academic year from our mock data
  mockAcademicYears.splice(index, 1);
  return true;
}

export async function setActiveAcademicYear(id: string, schoolId: string) {
  console.log('Mocked setActiveAcademicYear called with id:', id, 'and schoolId:', schoolId);
  
  // Update all academic years to be inactive
  mockAcademicYears.forEach(year => {
    year.is_active = false;
  });
  
  // Set the specified one as active
  const academicYear = mockAcademicYears.find(year => year.id === id);
  if (!academicYear) {
    throw new Error('Academic year not found');
  }
  
  academicYear.is_active = true;
  academicYear.updated_at = new Date().toISOString();
  
  return academicYear;
}

export async function archiveAcademicYear(id: string) {
  console.log('Mocked archiveAcademicYear called with id:', id);
  const academicYear = mockAcademicYears.find(year => year.id === id);
  if (!academicYear) {
    throw new Error('Academic year not found');
  }
  
  academicYear.is_archived = true;
  academicYear.updated_at = new Date().toISOString();
  
  return academicYear;
}

export async function cloneAcademicStructure(options: CloneStructureOptions) {
  console.log('Mocked cloneAcademicStructure called with options:', options);
  
  // Return mock result
  return {
    courses_cloned: 5,
    subjects_cloned: 15,
    batches_cloned: 8,
    grading_systems_cloned: 2,
    elective_groups_cloned: 3
  } as CloneStructureResult;
}
