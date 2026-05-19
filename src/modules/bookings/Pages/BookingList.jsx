import React, { useEffect } from 'react';
import { Eye, Plus } from 'lucide-react';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/booking.useBookings';

export const BookingList = () => {
    const navigate = useNavigate();
    const { bookings, loading, hasMore, fetchBookings } = useBookings();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    const handleClear = () => {
        setFromDate('');
        setToDate('');
        setActiveFilter('');
        setSearchQuery('');
    };

    useEffect(() => {
        fetchBookings({ searchQuery, activeFilter, fromDate, toDate });
    }, [searchQuery, activeFilter, fromDate, toDate, fetchBookings]);

    const handleView = (booking) => {
        navigate(`/bookings/view/${encodeURIComponent(booking.id)}`);
    };

    return (
        <>
            <SectionHeader
                title="Booking Management"
                subtitle="View and manage all trip booking records."
                actionLabel="Create Booking"
                actionIcon={Plus}
                actionTo="/bookings/add"
            />
            <div className="pb-10">
                <Table
                    headers={[
                        'Sl No', 'Trip No', 'Route', 'From', 'To',
                        'Travel Date', 'Driver', 'Booked / Total'
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
                    renderRow={(booking, idx) => {
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

                            </>
                        );
                    }}
                    actions={(booking) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleView(booking)}
                                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                                title="View Booking"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
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
                            {loading ? 'Synchronizing...' : 'Load More Bookings'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
