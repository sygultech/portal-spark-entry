
import { supabase } from '../integrations/supabase/client';
import { FeeComponent, FeeStructure } from '../types/finance';

export interface CreateFeeStructureData {
  name: string;
  academicYear: string;
  components: Omit<FeeComponent, 'id' | 'fee_structure_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateFeeStructureData {
  name?: string;
  academicYear?: string;
  components?: FeeComponent[];
}

class FeeStructureService {
  /**
   * Get all fee structures for the current user's school
   */
  async getFeeStructures(): Promise<FeeStructure[]> {
    // Fetch fee structures and components first
    const { data: feeStructures, error: structuresError } = await supabase
      .from('fee_structures')
      .select(`
        *,
        fee_components (
          id,
          name,
          amount,
          due_date,
          recurring
        )
      `)
      .order('created_at', { ascending: false });

    if (structuresError) {
      throw new Error(`Failed to fetch fee structures: ${structuresError.message}`);
    }

    if (!feeStructures || feeStructures.length === 0) {
      return [];
    }

    return feeStructures.map(this.transformFeeStructure);
  }

  /**
   * Get a single fee structure by ID
   */
  async getFeeStructureById(id: string): Promise<FeeStructure | null> {
    // Fetch fee structure and components first
    const { data: feeStructure, error } = await supabase
      .from('fee_structures')
      .select(`
        *,
        fee_components (
          id,
          name,
          amount,
          due_date,
          recurring
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to fetch fee structure: ${error.message}`);
    }

    return this.transformFeeStructure(feeStructure);
  }

  /**
   * Create a new fee structure
   */
  async createFeeStructure(data: CreateFeeStructureData): Promise<FeeStructure> {
    // Get current user's school ID
    const { data: userRole, error: userError } = await supabase
      .from('user_role_cache')
      .select('school_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (userError || !userRole?.school_id) {
      throw new Error('User school not found');
    }

    // Start transaction by creating fee structure first
    const { data: feeStructure, error: structureError } = await supabase
      .from('fee_structures')
      .insert({
        name: data.name,
        academic_year: data.academicYear,
        school_id: userRole.school_id,
        total_amount: data.components.reduce((sum, comp) => sum + comp.amount, 0)
      })
      .select()
      .single();

    if (structureError) {
      throw new Error(`Failed to create fee structure: ${structureError.message}`);
    }

    // Create fee components
    if (data.components.length > 0) {
      const { error: componentsError } = await supabase
        .from('fee_components')
        .insert(
          data.components.map(comp => ({
            fee_structure_id: feeStructure.id,
            name: comp.name,
            amount: comp.amount,
            due_date: comp.dueDate || comp.due_date || null,
            recurring: comp.recurring
          }))
        );

      if (componentsError) {
        // Cleanup: delete the fee structure if components failed
        await supabase.from('fee_structures').delete().eq('id', feeStructure.id);
        throw new Error(`Failed to create fee components: ${componentsError.message}`);
      }
    }

    // Return the created fee structure with all related data
    const createdStructure = await this.getFeeStructureById(feeStructure.id);
    if (!createdStructure) {
      throw new Error('Failed to retrieve created fee structure');
    }

    return createdStructure;
  }

  /**
   * Update an existing fee structure
   */
  async updateFeeStructure(id: string, data: UpdateFeeStructureData): Promise<FeeStructure> {
    // Update the main fee structure
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.academicYear !== undefined) updateData.academic_year = data.academicYear;

    if (Object.keys(updateData).length > 0) {
      const { error: structureError } = await supabase
        .from('fee_structures')
        .update(updateData)
        .eq('id', id);

      if (structureError) {
        throw new Error(`Failed to update fee structure: ${structureError.message}`);
      }
    }

    // Update components if provided
    if (data.components !== undefined) {
      // Delete existing components
      const { error: deleteError } = await supabase
        .from('fee_components')
        .delete()
        .eq('fee_structure_id', id);

      if (deleteError) {
        throw new Error(`Failed to delete existing components: ${deleteError.message}`);
      }

      // Insert new components
      if (data.components.length > 0) {
        const { error: componentsError } = await supabase
          .from('fee_components')
          .insert(
            data.components.map(comp => ({
              id: comp.id, // Include ID if updating existing component
              fee_structure_id: id,
              name: comp.name,
              amount: comp.amount,
              due_date: comp.dueDate || comp.due_date || null,
              recurring: comp.recurring
            }))
          );

        if (componentsError) {
          throw new Error(`Failed to update fee components: ${componentsError.message}`);
        }
      }
    }

    // Return the updated fee structure
    const updatedStructure = await this.getFeeStructureById(id);
    if (!updatedStructure) {
      throw new Error('Failed to retrieve updated fee structure');
    }

    return updatedStructure;
  }

  /**
   * Delete a fee structure
   */
  async deleteFeeStructure(id: string): Promise<void> {
    const { error } = await supabase
      .from('fee_structures')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete fee structure: ${error.message}`);
    }
  }

  /**
   * Search fee structures by name
   */
  async searchFeeStructures(query: string): Promise<FeeStructure[]> {
    const { data: feeStructures, error } = await supabase
      .from('fee_structures')
      .select(`
        *,
        fee_components (
          id,
          name,
          amount,
          due_date,
          recurring
        )
      `)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to search fee structures: ${error.message}`);
    }

    return feeStructures.map(this.transformFeeStructure);
  }

  /**
   * Transform database fee structure to frontend format
   */
  private transformFeeStructure(dbStructure: any): FeeStructure {
    return {
      id: dbStructure.id,
      name: dbStructure.name,
      academicYear: dbStructure.academic_year,
      totalAmount: dbStructure.total_amount,
      components: (dbStructure.fee_components || []).map((comp: any) => ({
        id: comp.id,
        fee_structure_id: dbStructure.id,
        name: comp.name,
        amount: comp.amount,
        due_date: comp.due_date,
        dueDate: comp.due_date, // Keep both for compatibility
        recurring: comp.recurring,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })),
      createdAt: dbStructure.created_at,
      updatedAt: dbStructure.updated_at
    };
  }
}

export const feeStructureService = new FeeStructureService();
