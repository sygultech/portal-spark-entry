
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
  timezone?: string;
  plan?: string;
  storage_limit?: number;
  user_limit?: number;
  modules?: {
    library?: boolean;
    transport?: boolean;
    finance?: boolean;
    inventory?: boolean;
    alumni?: boolean;
    online_classes?: boolean;
  };
}

export interface SchoolFormData {
  id?: string; // Added the id property as optional
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
