import React from 'react';
import { Plus } from 'lucide-react';
import { SectionHeader } from '../../components/Shared';
import { BookingTable } from '../../components/BookingTable';
import { bookingsData } from '../../data/mockData';

export const BookingList = () => (
  <>
    <SectionHeader 
      title="Booking Management" 
      subtitle="View, edit, approve or decline customer booking requests." 
      actionLabel="Create Booking"
      actionIcon={Plus}
      actionTo="/bookings/add"
    />
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <BookingTable data={bookingsData} />
    </div>
  </>
);
