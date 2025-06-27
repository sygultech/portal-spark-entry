import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  feeStructureService, 
  FeeStructure, 
  CreateFeeStructureData, 
  UpdateFeeStructureData 
} from '../services/feeStructureService';

export interface UseFeeStructuresReturn {
  feeStructures: FeeStructure[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createFeeStructure: (data: CreateFeeStructureData) => Promise<void>;
  updateFeeStructure: (id: string, data: UpdateFeeStructureData) => Promise<void>;
  deleteFeeStructure: (id: string) => Promise<void>;
  refreshFeeStructures: () => Promise<void>;
  
  // Search functionality
  searchFeeStructures: (query: string) => Promise<void>;
  clearSearch: () => void;
  searchQuery: string;
}

export function useFeeStructures(): UseFeeStructuresReturn {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load fee structures on mount
  useEffect(() => {
    loadFeeStructures();
  }, []);

  const loadFeeStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      const structures = await feeStructureService.getFeeStructures();
      setFeeStructures(structures);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load fee structures';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };



  const createFeeStructure = async (data: CreateFeeStructureData) => {
    try {
      setError(null);
      const newFeeStructure = await feeStructureService.createFeeStructure(data);
      setFeeStructures(prev => [newFeeStructure, ...prev]);
      toast.success('Fee structure created successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create fee structure';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow the component to handle it
    }
  };

  const updateFeeStructure = async (id: string, data: UpdateFeeStructureData) => {
    try {
      setError(null);
      const updatedFeeStructure = await feeStructureService.updateFeeStructure(id, data);
      setFeeStructures(prev => 
        prev.map(structure => 
          structure.id === id ? updatedFeeStructure : structure
        )
      );
      toast.success('Fee structure updated successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update fee structure';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow the component to handle it
    }
  };

  const deleteFeeStructure = async (id: string) => {
    try {
      setError(null);
      await feeStructureService.deleteFeeStructure(id);
      setFeeStructures(prev => prev.filter(structure => structure.id !== id));
      toast.success('Fee structure deleted successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete fee structure';
      setError(errorMessage);
      toast.error(errorMessage);
      throw err; // Re-throw to allow the component to handle it
    }
  };

  const refreshFeeStructures = async () => {
    await loadFeeStructures();
  };

  const searchFeeStructures = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      if (query.trim() === '') {
        // If empty query, load all fee structures
        await loadFeeStructures();
      } else {
        const results = await feeStructureService.searchFeeStructures(query);
        setFeeStructures(results);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search fee structures';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    loadFeeStructures();
  };

  return {
    feeStructures,
    loading,
    error,
    createFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    refreshFeeStructures,
    searchFeeStructures,
    clearSearch,
    searchQuery
  };
} 