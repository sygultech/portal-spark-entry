import { supabase } from '@/integrations/supabase/client';

export interface StaffMember {
  id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  profile_image_url: string;
  join_date: string;
  department_id: string;
  designation_id: string;
  employment_status: string;
  school_id: string;
  created_at: string;
  updated_at: string;
  profile_id: string | null;
  department?: {
    id: string;
    name: string;
  };
  designation?: {
    id: string;
    name: string;
  };
  emergency_contact?: {
    contact_name: string;
    relationship: string;
    contact_phone: string;
  };
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
    grade: string;
  }>;
  experiences?: Array<{
    position: string;
    organization: string;
    start_year: number;
    end_year?: number;
    description: string;
  }>;
  documents?: Array<{
    document_type: string;
    file_url: string;
    file_name: string;
  }>;
}

export interface CreateStaffData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  employeeId: string;
  joinDate: string;
  departmentId: string;
  designationId: string;
  employmentStatus: string;
  schoolId: string;
  login_enabled?: boolean;
  roles?: string[];
  emergencyContact?: {
    contactName: string;
    relationship: string;
    contactPhone: string;
  };
  qualifications?: Array<{
    degree: string;
    institution: string;
    year: number;
    grade: string;
  }>;
  experiences?: Array<{
    position: string;
    organization: string;
    startYear: number;
    endYear?: number;
    description: string;
  }>;
  documents?: Array<{
    documentType: string;
    fileUrl: string;
    fileName: string;
  }>;
}

export interface StaffListResponse {
  data: StaffMember[];
  count: number;
}

export interface StaffResponse {
  data: StaffMember;
  error?: string;
}

class StaffService {
  async createStaff(data: CreateStaffData): Promise<StaffResponse> {
    try {
      if (!data.schoolId) {
        throw new Error('School ID is required');
      }

      // Validate UUID fields
      if (!data.departmentId || !data.designationId) {
        throw new Error('Department ID and Designation ID are required');
      }

      // Transform camelCase to snake_case
      const transformedData = {
        employee_id: data.employeeId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth || null,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        join_date: data.joinDate || new Date().toISOString().split('T')[0],
        department_id: data.departmentId,
        designation_id: data.designationId,
        employment_status: data.employmentStatus,
        school_id: data.schoolId
      };

      console.log('Transformed data:', transformedData);

      // Create staff profile
      const { data: staffData, error: staffError } = await supabase
        .from('staff_details')
        .insert([transformedData])
        .select()
        .single();

      if (staffError) {
        console.error('Staff creation error:', staffError);
        throw staffError;
      }

      if (!staffData) {
        throw new Error('Failed to create staff profile');
      }

      // Create emergency contact if provided
      if (data.emergencyContact) {
        const { error: contactError } = await supabase
          .from('staff_emergency_contacts')
          .insert([{
            staff_id: staffData.id,
            contact_name: data.emergencyContact.contactName,
            relationship: data.emergencyContact.relationship,
            contact_phone: data.emergencyContact.contactPhone
          }]);

        if (contactError) {
          console.error('Emergency contact creation error:', contactError);
          throw contactError;
        }
      }

      // Create qualifications if provided
      if (data.qualifications?.length) {
        const { error: qualError } = await supabase
          .from('staff_qualifications')
          .insert(data.qualifications.map(q => ({
            staff_id: staffData.id,
            degree: q.degree,
            institution: q.institution,
            year: q.year,
            grade: q.grade
          })));

        if (qualError) {
          console.error('Qualifications creation error:', qualError);
          throw qualError;
        }
      }

      // Create experiences if provided
      if (data.experiences?.length) {
        const { error: expError } = await supabase
          .from('staff_experiences')
          .insert(data.experiences.map(e => ({
            staff_id: staffData.id,
            position: e.position,
            organization: e.organization,
            start_year: e.startYear,
            end_year: e.endYear,
            description: e.description
          })));

        if (expError) {
          console.error('Experiences creation error:', expError);
          throw expError;
        }
      }

      // Create documents if provided
      if (data.documents?.length) {
        const { error: docError } = await supabase
          .from('staff_documents')
          .insert(data.documents.map(d => ({
            staff_id: staffData.id,
            document_type: d.documentType,
            file_url: d.fileUrl,
            file_name: d.fileName
          })));

        if (docError) {
          console.error('Documents creation error:', docError);
          throw docError;
        }
      }

      return { data: staffData };
    } catch (error: any) {
      console.error('Error creating staff:', error);
      return { data: null, error: error.message };
    }
  }

  async getStaffList(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    department?: string;
  }): Promise<StaffListResponse> {
    try {
      let query = supabase
        .from('staff_details')
        .select(`
          *,
          department:departments(id, name),
          designation:designations(id, name),
          emergency_contact:staff_emergency_contacts(*),
          qualifications:staff_qualifications(*),
          experiences:staff_experiences(*),
          documents:staff_documents(*)
        `, { count: 'exact' });

      // Add search filter
      if (params.search) {
        query = query.or(
          `first_name.ilike.%${params.search}%,` +
          `last_name.ilike.%${params.search}%,` +
          `email.ilike.%${params.search}%,` +
          `employee_id.ilike.%${params.search}%`
        );
      }

      // Add status filter
      if (params.status) {
        query = query.eq('employment_status', params.status);
      }

      // Add department filter
      if (params.department) {
        query = query.eq('department_id', params.department);
      }

      // Add pagination
      const page = params.page || 1;
      const limit = params.limit || 10;
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await query
        .range(start, end)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching staff list:', error);
        throw error;
      }

      // Transform the data to match the StaffMember interface
      const transformedData = data?.map(staff => ({
        id: staff.id,
        employee_id: staff.employee_id,
        first_name: staff.first_name,
        last_name: staff.last_name,
        email: staff.email,
        phone: staff.phone,
        date_of_birth: staff.date_of_birth,
        gender: staff.gender,
        address: staff.address,
        city: staff.city,
        state: staff.state,
        postal_code: staff.postal_code,
        profile_image_url: staff.profile_image_url,
        join_date: staff.join_date,
        department_id: staff.department_id,
        designation_id: staff.designation_id,
        employment_status: staff.employment_status,
        school_id: staff.school_id,
        created_at: staff.created_at,
        updated_at: staff.updated_at,
        profile_id: staff.profile_id,
        department: staff.department,
        designation: staff.designation,
        emergency_contact: staff.emergency_contact?.[0],
        qualifications: staff.qualifications || [],
        experiences: staff.experiences || [],
        documents: staff.documents || []
      })) || [];

      return { 
        data: transformedData,
        count: count || 0
      };
    } catch (error: any) {
      console.error('Error fetching staff list:', error);
      return { data: [], count: 0 };
    }
  }

  async getStaffById(id: string): Promise<StaffResponse> {
    try {
      const { data, error } = await supabase
        .from('staff_details')
        .select(`
          *,
          emergency_contact:staff_emergency_contacts(*),
          qualifications:staff_qualifications(*),
          experiences:staff_experiences(*),
          documents:staff_documents(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error fetching staff:', error);
      return { data: null, error: error.message };
    }
  }

  async updateStaff(id: string, data: Partial<CreateStaffData>): Promise<StaffResponse> {
    try {
      // First, perform the update
      const transformedData = {
        employee_id: data.employeeId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        date_of_birth: data.dateOfBirth,
        gender: data.gender,
        address: data.address,
        city: data.city,
        state: data.state,
        postal_code: data.postalCode,
        join_date: data.joinDate,
        department_id: data.departmentId,
        designation_id: data.designationId,
        employment_status: data.employmentStatus
      };

      const { error: updateError } = await supabase
        .from('staff_details')
        .update(transformedData)
        .eq('id', id);

      if (updateError) throw updateError;

      // Then, fetch the updated record
      const { data: staffData, error: fetchError } = await supabase
        .from('staff_details')
        .select(`
          *,
          department:departments(id, name),
          designation:designations(id, name),
          emergency_contact:staff_emergency_contacts(*),
          qualifications:staff_qualifications(*),
          experiences:staff_experiences(*),
          documents:staff_documents(*)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      // Update emergency contact if provided
      if (data.emergencyContact) {
        const { error: contactError } = await supabase
          .from('staff_emergency_contacts')
          .upsert({
            staff_id: id,
            contact_name: data.emergencyContact.contactName,
            relationship: data.emergencyContact.relationship,
            contact_phone: data.emergencyContact.contactPhone
          });

        if (contactError) throw contactError;
      }

      // Update qualifications if provided
      if (data.qualifications?.length) {
        // Delete existing qualifications
        await supabase
          .from('staff_qualifications')
          .delete()
          .eq('staff_id', id);

        // Insert new qualifications
        const { error: qualError } = await supabase
          .from('staff_qualifications')
          .insert(data.qualifications.map(q => ({
            staff_id: id,
            degree: q.degree,
            institution: q.institution,
            year: q.year,
            grade: q.grade
          })));

        if (qualError) throw qualError;
      }

      // Update experiences if provided
      if (data.experiences?.length) {
        // Delete existing experiences
        await supabase
          .from('staff_experiences')
          .delete()
          .eq('staff_id', id);

        // Insert new experiences
        const { error: expError } = await supabase
          .from('staff_experiences')
          .insert(data.experiences.map(e => ({
            staff_id: id,
            position: e.position,
            organization: e.organization,
            start_year: e.startYear,
            end_year: e.endYear,
            description: e.description
          })));

        if (expError) throw expError;
      }

      return { data: staffData };
    } catch (error: any) {
      console.error('Error updating staff:', error);
      return { data: null, error: error.message };
    }
  }

  async deleteStaff(id: string): Promise<StaffResponse> {
    try {
      // Delete related records first
      await supabase.from('staff_emergency_contacts').delete().eq('staff_id', id);
      await supabase.from('staff_qualifications').delete().eq('staff_id', id);
      await supabase.from('staff_experiences').delete().eq('staff_id', id);
      await supabase.from('staff_documents').delete().eq('staff_id', id);

      // Delete staff record
      const { data, error } = await supabase
        .from('staff_details')
        .delete()
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      return { data: null, error: error.message };
    }
  }

  async uploadDocument(file: File): Promise<{ url: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `staff-documents/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      return { url: publicUrl };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async uploadStaffDocument(staffId: string, file: File, documentType: string): Promise<{ url: string; fileName: string }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${staffId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('staff-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get the signed URL instead of public URL
      const { data: { signedUrl } } = await supabase.storage
        .from('staff-documents')
        .createSignedUrl(fileName, 31536000); // URL valid for 1 year

      if (!signedUrl) throw new Error('Failed to get signed URL');

      // Save document metadata
      const { error: docError } = await supabase
        .from('staff_documents')
        .insert([{
          staff_id: staffId,
          document_type: documentType,
          file_url: signedUrl,
          file_name: file.name
        }]);

      if (docError) throw docError;

      return { url: signedUrl, fileName: file.name };
    } catch (error: any) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  async getStaffDocuments(staffId: string): Promise<Array<{
    id: string;
    document_type: string;
    file_url: string;
    file_name: string;
    created_at: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('staff_documents')
        .select('*')
        .eq('staff_id', staffId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get fresh signed URLs for each document
      const documentsWithUrls = await Promise.all(
        (data || []).map(async (doc) => {
          const filePath = doc.file_url.split('/staff-documents/')[1];
          const { data: { signedUrl } } = await supabase.storage
            .from('staff-documents')
            .createSignedUrl(filePath, 3600); // URL valid for 1 hour

          return {
            ...doc,
            file_url: signedUrl || doc.file_url
          };
        })
      );

      return documentsWithUrls;
    } catch (error: any) {
      console.error('Error fetching staff documents:', error);
      throw error;
    }
  }

  async deleteStaffDocument(documentId: string, fileUrl: string): Promise<void> {
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/staff-documents/')[1];
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('staff-documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('staff_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) throw dbError;
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
}

export const staffService = new StaffService();

// Create staff login using Supabase Auth API
export const createStaffLogin = async (
  email: string,
  firstName: string,
  lastName: string,
  schoolId: string,
  password: string,
  staffId: string,
  roles: string | string[]
): Promise<{ user_id: string; status: string } | null> => {
  try {
    console.log('Creating staff login:', { email, firstName, lastName, schoolId, staffId, roles });
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-staff-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          schoolId,
          password,
          staffId,
          roles: Array.isArray(roles) ? roles : [roles],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', data);
      throw new Error(data.error || 'Failed to create staff login');
    }

    return data;
  } catch (error) {
    console.error('Error in createStaffLogin:', error);
    throw error;
  }
};

// Disable staff login access
export const disableStaffLogin = async (staffId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Disabling staff login:', { staffId });
    
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/disable-staff-login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          staffId,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('Edge Function error:', data);
      throw new Error(data.error || 'Failed to disable staff login');
    }

    return { success: true };
  } catch (error) {
    console.error('Error in disableStaffLogin:', error);
    return { success: false, error: error.message };
  }
}; 