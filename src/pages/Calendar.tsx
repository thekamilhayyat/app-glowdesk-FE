import { useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Calendar } from '@/components/calendar/Calendar';
import { useCalendarStore } from '@/stores/calendarStore';
import { CheckoutDialog } from '@/components/checkout/CheckoutDialog';
import { useCheckoutStore } from '@/stores/checkoutStore';
import { generateMockData } from '@/lib/mockCalendarData';

export default function CalendarPage() {
  const { appointments, staff, services, clients, initializeData } = useCalendarStore();
  const { isOpen: isCheckoutOpen } = useCheckoutStore();

  // Initialize with mock data on first load
  useEffect(() => {
    console.log('Calendar useEffect triggered:', {
      appointmentsLength: appointments.length,
      staffLength: staff.length
    });
    
    if (appointments.length === 0 && staff.length === 0) {
      console.log('Initializing mock data...');
      const mockData = generateMockData();
      console.log('Generated mock data:', {
        appointmentCount: mockData.appointments.length,
        appointmentIds: mockData.appointments.map(a => a.id)
      });
      initializeData(mockData);
    }
  }, [appointments.length, staff.length, initializeData]);

  return (
    <AppLayout>
      <div className="h-screen flex flex-col" data-testid="calendar-page">
        <Calendar className="flex-1 flex flex-col" />
        
        {/* Checkout Dialog */}
        {isCheckoutOpen && <CheckoutDialog />}
      </div>
    </AppLayout>
  );
}