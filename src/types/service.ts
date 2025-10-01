// Service type definitions
export type ServiceCategory = 'hair' | 'nails' | 'facial' | 'massage' | 'waxing' | 'other';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number; // in minutes
  price: number;
  description?: string;
}
