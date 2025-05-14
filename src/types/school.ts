
export interface School {
  id: string;
  name: string;
  admin_email?: string;
  contact_number?: string;
  domain?: string;
  status?: 'active' | 'suspended' | 'expired' | 'pending';
  plan?: 'free' | 'basic' | 'premium';
  created_at: string;
  updated_at: string;
  region?: string;
  timezone?: string;
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
  profiles?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    role: string;
  }[];
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
  timezone?: string;
  plan?: 'free' | 'basic' | 'premium';
  status?: 'active' | 'suspended' | 'expired' | 'pending';
  modules?: {
    library?: boolean;
    transport?: boolean;
    finance?: boolean;
    inventory?: boolean;
    alumni?: boolean;
    online_classes?: boolean;
  };
  storage_limit?: number;
  user_limit?: number;
}
