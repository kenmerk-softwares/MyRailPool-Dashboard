import React, { useEffect } from 'react';
import { CalendarCheck, MapIcon, Users, Edit, Eye } from 'lucide-react';
import { SectionHeader, StatCard, Activity, StatusBadge } from '../../components/Shared';
import { Link, useNavigate } from 'react-router-dom';
import { Table } from '../../shared/Table/Table';
import { useBookings } from '../bookings/hooks/booking.useBookings';


export const Dashboard = () => {
    const { bookings, loading, hasMore, fetchBookings } = useBookings();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    useEffect(() => {
            fetchBookings({ searchQuery, activeFilter });
        }, [searchQuery, activeFilter, fetchBookings]);

    const handleClear = () => {
        setFromDate('');
        setToDate('');
        setActiveFilter('');
        setSearchQuery('');
    };

    const handleView = (booking) => {
        const cleanId = String(booking?.booking_id || booking?.id || '').replace('#', '');
        navigate(`/bookings/view/${cleanId}`);
    };
  
  return(
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
    <div className="pb-10">
        <Table
            headers={['Sl No', 'Req Ref', 'Booking ID', 'Customer','Pickup', 'Destination', 'Req Date', 'Driver', 'Status']}
            data={bookings}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            searchPlaceholder="Search bookings, customer, driver..."
            filterOptions={[
                // { label: 'All', value: '' },
                { label: 'Approved', value: 'APPROVED' },
                { label: 'Pending', value: 'PENDING' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Declined', value: 'DECLINED' },
            ]}
            renderRow={(booking, idx) => (
                <>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800">{booking.req_ref}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800">{booking.booking_id}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800">{booking.name}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800 truncate max-w-[150px]">{booking.pickup}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800 truncate max-w-[150px]">{booking.destination}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800 whitespace-nowrap">{booking.req_date}</td>
                    <td className="px-8 py-4 text-[13px] font-black text-slate-800">{booking.driver || 'Unassigned'}</td>
                    <td className="px-8 py-4">
                        <StatusBadge 
                            status={booking.status} 
                            statusColor={booking.status === 'COMPLETED' ? 'success' : booking.status === 'PENDING' ? 'warning' : 'slate'} 
                        />
                    </td>
                </>
            )}
            actions={(booking) => (
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleView(booking)} 
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                        title="Quick View"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                    <Link 
                        to={`/bookings/edit/${String(booking?.booking_id || booking?.id || '').replace('#', '')}`}
                        className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                        title="Edit Booking"
                    >
                        <Edit className="w-4 h-4" />
                    </Link>
                </div>
            )}
        />
         {hasMore && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => fetchBookings({ searchQuery, activeFilter, isLoadMore: true })}
                        disabled={loading}
                        className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Synchronizing...' : 'Load More Booking Data'}
                    </button>
                </div>
            )}
    </div>
  </>
  );
}
