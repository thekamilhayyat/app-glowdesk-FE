// Client type definitions
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  isNew?: boolean;
  isMember?: boolean;
  preferredStaff?: string;
  genderPreference?: 'male' | 'female' | 'no-preference';
  notes?: string;
  lastVisit?: string;
  lifetimeSpend?: number;
  tags?: string[];
  createdAt?: string;
}
