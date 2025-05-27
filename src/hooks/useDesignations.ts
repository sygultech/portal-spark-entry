import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { designationService, Designation, CreateDesignationData, UpdateDesignationData } from '@/services/designationService';

export const useDesignations = () => {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.school_id) {
      loadDesignations();
    }
  }, [profile?.school_id]);

  const loadDesignations = async () => {
    try {
      setIsLoading(true);
      const data = await designationService.getDesignations(profile!.school_id);
      setDesignations(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load designations'));
    } finally {
      setIsLoading(false);
    }
  };

  const createDesignation = async (data: CreateDesignationData) => {
    try {
      const newDesignation = await designationService.createDesignation(data);
      setDesignations(prev => [...prev, newDesignation]);
      return newDesignation;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create designation'));
      throw err;
    }
  };

  const updateDesignation = async (id: string, data: UpdateDesignationData) => {
    try {
      const updatedDesignation = await designationService.updateDesignation(id, data);
      setDesignations(prev => prev.map(d => d.id === id ? updatedDesignation : d));
      return updatedDesignation;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update designation'));
      throw err;
    }
  };

  const deleteDesignation = async (id: string) => {
    try {
      await designationService.deleteDesignation(id);
      setDesignations(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete designation'));
      throw err;
    }
  };

  return {
    designations,
    isLoading,
    error,
    createDesignation,
    updateDesignation,
    deleteDesignation,
    refreshDesignations: loadDesignations
  };
}; 