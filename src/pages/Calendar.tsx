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
    if (appointments.length === 0 && staff.length === 0) {
      const mockData = generateMockData();
      initializeData(mockData);
    }
  }, [appointments.length, staff.length, initializeData]);

  return (
    <AppLayout>
      <div className="h-screen flex flex-col bg-background" data-testid="calendar-page">
        <Calendar className="flex-1 flex flex-col" />
        
        {/* Checkout Dialog */}
        {isCheckoutOpen && <CheckoutDialog />}
      </div>
    </AppLayout>
  );
}