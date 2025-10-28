import { Appointment, AppointmentStatus } from '@/types/appointment';
import { StaffMember } from '@/types/staff';
import { Service, ServiceCategory } from '@/types/service';
import { Client } from '@/types/client';
import { addDays, addHours, setHours, setMinutes } from 'date-fns';

export function generateMockData() {
  const services: Service[] = [
    {
      id: 'srv-1',
      name: 'Haircut',
      category: 'hair',
      duration: 45,
      price: 50,
      description: 'Standard haircut and styling',
    },
    {
      id: 'srv-2',
      name: 'Hair Color',
      category: 'hair',
      duration: 90,
      price: 120,
      description: 'Full hair coloring service',
    },
    {
      id: 'srv-3',
      name: 'Manicure',
      category: 'nails',
      duration: 30,
      price: 30,
      description: 'Classic manicure',
    },
    {
      id: 'srv-4',
      name: 'Facial',
      category: 'facial',
      duration: 60,
      price: 80,
      description: 'Relaxing facial treatment',
    },
    {
      id: 'srv-5',
      name: 'Massage',
      category: 'massage',
      duration: 60,
      price: 90,
      description: 'Swedish massage',
    },
  ];

  const staff: StaffMember[] = [
    {
      id: 'staff-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah@glowflowapp.com',
      services: ['srv-1', 'srv-2'],
      isActive: true,
      color: '#3B82F6',
    },
    {
      id: 'staff-2',
      firstName: 'Mike',
      lastName: 'Chen',
      email: 'mike@glowflowapp.com',
      services: ['srv-1'],
      isActive: true,
      color: '#10B981',
    },
    {
      id: 'staff-3',
      firstName: 'Emma',
      lastName: 'Davis',
      email: 'emma@glowflowapp.com',
      services: ['srv-3', 'srv-4'],
      isActive: true,
      color: '#F59E0B',
    },
    {
      id: 'staff-4',
      firstName: 'Alex',
      lastName: 'Rodriguez',
      email: 'alex@glowflowapp.com',
      services: ['srv-5'],
      isActive: true,
      color: '#8B5CF6',
    },
  ];

  const clients: Client[] = [
    {
      id: 'client-1',
      name: 'Jessica Williams',
      firstName: 'Jessica',
      lastName: 'Williams',
      email: 'jessica@example.com',
      phone: '(555) 123-4567',
      isNew: false,
      isMember: true,
      preferredStaff: 'staff-1',
    },
    {
      id: 'client-2',
      name: 'David Brown',
      firstName: 'David',
      lastName: 'Brown',
      email: 'david@example.com',
      phone: '(555) 234-5678',
      isNew: true,
      isMember: false,
    },
    {
      id: 'client-3',
      name: 'Maria Garcia',
      firstName: 'Maria',
      lastName: 'Garcia',
      email: 'maria@example.com',
      phone: '(555) 345-6789',
      isNew: false,
      isMember: false,
      notes: 'Sensitive skin - use gentle products',
    },
    {
      id: 'client-4',
      name: 'John Smith',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john@example.com',
      phone: '(555) 456-7890',
      isNew: false,
      isMember: true,
      preferredStaff: 'staff-2',
    },
    {
      id: 'client-5',
      name: 'Lisa Anderson',
      firstName: 'Lisa',
      lastName: 'Anderson',
      email: 'lisa@example.com',
      phone: '(555) 567-8901',
      isNew: true,
      isMember: false,
    },
  ];

  const appointments: Appointment[] = [];
  const today = new Date();
  const statuses: AppointmentStatus[] = ['pending', 'confirmed', 'checked-in', 'in-progress', 'completed'];

  // Generate appointments for the next 7 days
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const appointmentDate = addDays(today, dayOffset);
    
    // Generate 2-4 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < appointmentsPerDay; i++) {
      const client = clients[Math.floor(Math.random() * clients.length)];
      const staffMember = staff[Math.floor(Math.random() * staff.length)];
      const service = services.find(s => staffMember.services.includes(s.id)) || services[0];
      
      const startHour = 9 + Math.floor(Math.random() * 8); // 9 AM to 5 PM
      const startMinute = [0, 15, 30, 45][Math.floor(Math.random() * 4)];
      
      const startTime = setMinutes(setHours(appointmentDate, startHour), startMinute);
      const endTime = addMinutes(startTime, service.duration);
      
      // Determine status based on day
      let status: AppointmentStatus;
      if (dayOffset < 0) {
        status = 'completed';
      } else if (dayOffset === 0) {
        status = Math.random() > 0.5 ? 'confirmed' : 'in-progress';
      } else {
        status = Math.random() > 0.3 ? 'confirmed' : 'pending';
      }

      const appointment: Appointment = {
        id: `apt-${dayOffset}-${i}`,
        clientId: client.id,
        staffId: staffMember.id,
        serviceIds: [service.id],
        startTime,
        endTime,
        status,
        hasUnreadMessages: Math.random() > 0.8,
        isRecurring: Math.random() > 0.9,
        depositPaid: Math.random() > 0.7,
        totalPrice: service.price,
        createdAt: new Date(),
        updatedAt: new Date(),
        notes: Math.random() > 0.7 ? 'Regular appointment - knows the routine' : undefined,
      };

      appointments.push(appointment);
    }
  }

  return {
    services,
    staff,
    clients,
    appointments,
  };
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}