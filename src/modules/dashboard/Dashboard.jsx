import React from 'react';
import { CalendarCheck, MapIcon, Users } from 'lucide-react';
import { SectionHeader, StatCard, Activity } from '../../components/Shared';
import { BookingTable } from '../../components/BookingTable';
import { bookingsData } from '../../data/mockData';
import { Link } from 'react-router-dom';

export const Dashboard = () => (
  <>
    <SectionHeader 
      title="Dashboard Overview" 
      subtitle="Monitor your bookings, trips, and overall platform metrics." 
      actionLabel="New Booking"
      actionIcon={CalendarCheck}
      actionTo="/bookings/add"
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      <StatCard title="Total Bookings" value="1,284" icon={CalendarCheck} trend="+12.5%" trendUp={true} />
      <StatCard title="Active Trips" value="42" icon={MapIcon} trend="+5.2%" trendUp={true} />
      <StatCard title="Available Drivers" value="18" icon={Users} trend="-2.4%" trendUp={false} />
      <StatCard title="Total Revenue" value="₹1.4M" icon={Activity} trend="+18.2%" trendUp={true} />
    </div>
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white flex-wrap gap-3">
        <h3 className="text-base md:text-lg font-bold text-slate-800">Recent Bookings</h3>
        <Link to="/bookings" className="text-xs md:text-sm font-medium text-primary-600 hover:text-primary-700 bg-primary-50 px-3 md:px-4 py-1.5 md:py-2 rounded-lg transition-colors">
          View All
        </Link>
      </div>
      <BookingTable data={bookingsData} />
    </div>
  </>
);
