
export interface School {
  id: string;
  name: string;
  admin_email?: string;
  contact_number?: string;
  domain?: string;
  status?: 'active' | 'suspended' | 'expired' | 'pending';
  created_at: string;
  updated_at: string;
  region?: string;
}

export interface SchoolFormData {
  name: string;
  domain?: string;
  admin_email: string;
  admin_first_name: string;
  admin_last_name: string;
  admin_password?: string;
  contact_number?: string;
  region?: string;
  status?: 'active' | 'suspended' | 'expired' | 'pending';
}
