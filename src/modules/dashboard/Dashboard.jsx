import React, { useEffect, useState } from 'react';
import { CalendarCheck, MapIcon, Users, Edit, Eye, Route, Car, UserCheck, DollarSign } from 'lucide-react';
import { SectionHeader, StatCard, Activity, StatusBadge } from '../../components/Shared';
import { Link, useNavigate } from 'react-router-dom';
import { Table } from '../../shared/Table/Table';
import { useBookings } from '../bookings/hooks/booking.useBookings';
import { collection, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';

export const Dashboard = () => {
    const { bookings, loading, hasMore, fetchBookings } = useBookings();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    const [stats, setStats] = useState({
        bookings: 0,
        trips: 0,
        drivers: 0,
        routes: 0,
        vehicles: 0,
        admins: 0,
        revenue: 0
    });

    useEffect(() => {
        fetchBookings({ searchQuery, activeFilter, fromDate, toDate });
    }, [searchQuery, activeFilter, fromDate, toDate, fetchBookings]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Bookings Count
                const bookingsSnap = await getCountFromServer(collection(db, 'bookings'));
                const bookingsCount = bookingsSnap.data().count;

                // Trips Count
                const tripsSnap = await getCountFromServer(collection(db, 'trips'));
                const tripsCount = tripsSnap.data().count;

                // Drivers Count
                const driversSnap = await getCountFromServer(collection(db, 'drivers'));
                const driversCount = driversSnap.data().count;

                // Routes Count
                const routesSnap = await getCountFromServer(collection(db, 'routes'));
                const routesCount = routesSnap.data().count;

                // Vehicles Count
                const vehiclesSnap = await getCountFromServer(collection(db, 'vehicles'));
                const vehiclesCount = vehiclesSnap.data().count;

                // Admin Users Count
                const adminsSnap = await getCountFromServer(collection(db, 'admin-users'));
                const adminsCount = adminsSnap.data().count;

                // Total Revenue
                let totalRevenue = 0;
                try {
                    const revSnap = await getAggregateFromServer(collection(db, 'finance'), {
                        total: sum('amount')
                    });
                    totalRevenue = revSnap.data().total;
                } catch (e) {
                    console.error("Revenue aggregate failed:", e);
                }

                setStats({
                    bookings: bookingsCount,
                    trips: tripsCount,
                    drivers: driversCount,
                    routes: routesCount,
                    vehicles: vehiclesCount,
                    admins: adminsCount,
                    revenue: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            }
        };

        fetchStats();
    }, []);

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

    // check if any passenger is still pending — if yes the whole booking is pending
    const getDocStatus = (booking) => {
        const users = booking.users || [];
        if (users.length === 0) return 'No Bookings';
        return users.some((u) => u.status === 'Pending') ? 'Pending' : 'Confirmed';
    };

    // just maps status to a colour name for the badge
    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':   return 'success';
            case 'Pending':     return 'warning';
            case 'No Bookings': return 'slate';
            default:            return 'slate';
        }
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
      <StatCard title="Total Revenue" value={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Active Trips" value={stats.trips} icon={MapIcon} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Available Drivers" value={stats.drivers} icon={Users} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Total Routes" value={stats.routes} icon={Route} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Total Vehicles" value={stats.vehicles} icon={Car} trend="Live" trendUp={true} trendLabel="" />
      <StatCard title="Admin Users" value={stats.admins} icon={UserCheck} trend="Live" trendUp={true} trendLabel="" />
    </div>
    <div className="pb-10">
        <Table
            headers={[
                'Sl No', 'Trip No', 'Route', 'From', 'To',
                'Travel Date', 'Driver', 'Booked / Total', 'Status'
            ]}
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
            searchPlaceholder="Search by trip no, route name, driver..."
            filterOptions={[
                { label: 'Pending',   value: 'Pending'   },
                { label: 'Confirmed', value: 'Confirmed' },
            ]}
            renderRow={(booking, idx) => {
                const status = getDocStatus(booking);
                return (
                    <>
                        {/* Sl No */}
                        <td className="px-6 py-4 text-[13px] font-black text-slate-800">
                            {idx + 1}
                        </td>

                        {/* Trip No */}
                        <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-[12px] border border-primary-100">
                                #{booking.tripNo ?? '—'}
                            </span>
                        </td>

                        {/* Route name */}
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[140px]">
                            {booking.route_name || '—'}
                        </td>

                        {/* From */}
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                            {booking.route_start || '—'}
                        </td>

                        {/* To */}
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                            {booking.route_end || '—'}
                        </td>

                        {/* Travel Date */}
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-600 whitespace-nowrap">
                            {booking.selectedDate || '—'}
                        </td>

                        {/* Driver */}
                        <td className="px-6 py-4 text-[13px] font-bold text-slate-700">
                            {booking.driver_name || '—'}
                        </td>

                        {/* Booked / Total seats */}
                        <td className="px-6 py-4 text-center">
                            <span className="inline-flex items-center gap-1 text-[13px]">
                                <span className="font-black text-indigo-600">
                                    {booking.bookedCount ?? (booking.users?.length ?? 0)}
                                </span>
                                <span className="text-slate-400 font-semibold">/</span>
                                <span className="font-bold text-slate-600">
                                    {booking.totalSeats ?? '—'}
                                </span>
                            </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                            <StatusBadge
                                status={status}
                                statusColor={getStatusColor(status)}
                            />
                        </td>
                    </>
                );
            }}
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
