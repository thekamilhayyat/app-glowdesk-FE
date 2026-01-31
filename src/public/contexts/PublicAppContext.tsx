/**
 * Public App Context
 * Manages booking flow state
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingState {
  salonId: string | null;
  salonSlug: string | null;
  serviceId: string | null;
  selectedDate: string | null;
  selectedTimeSlot: {
    startTime: string;
    endTime: string;
  } | null;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
    notes: string;
  };
}

interface PublicAppContextType {
  bookingState: BookingState;
  updateBookingState: (updates: Partial<BookingState>) => void;
  resetBookingState: () => void;
}

const initialState: BookingState = {
  salonId: null,
  salonSlug: null,
  serviceId: null,
  selectedDate: null,
  selectedTimeSlot: null,
  customerDetails: {
    name: '',
    email: '',
    phone: '',
    notes: '',
  },
};

const PublicAppContext = createContext<PublicAppContextType | undefined>(undefined);

export const usePublicApp = () => {
  const context = useContext(PublicAppContext);
  if (!context) {
    throw new Error('usePublicApp must be used within PublicAppProvider');
  }
  return context;
};

interface PublicAppProviderProps {
  children: ReactNode;
}

export const PublicAppProvider: React.FC<PublicAppProviderProps> = ({ children }) => {
  const [bookingState, setBookingState] = useState<BookingState>(initialState);

  const updateBookingState = (updates: Partial<BookingState>) => {
    setBookingState((prev) => ({
      ...prev,
      ...updates,
      customerDetails: {
        ...prev.customerDetails,
        ...(updates.customerDetails || {}),
      },
    }));
  };

  const resetBookingState = () => {
    setBookingState(initialState);
  };

  return (
    <PublicAppContext.Provider value={{ bookingState, updateBookingState, resetBookingState }}>
      {children}
    </PublicAppContext.Provider>
  );
};
