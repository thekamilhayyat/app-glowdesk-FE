// Staff member type definitions
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  services: string[]; // service IDs they can perform
  isActive: boolean;
  color: string; // for calendar display
}
