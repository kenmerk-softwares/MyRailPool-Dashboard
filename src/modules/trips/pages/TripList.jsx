import React, { useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useTrips } from '../hooks/trip.useTrips';

export const TripList = () => {
  const { trips, hasMore, fetchTrips, loading } = useTrips();
  const navigate = useNavigate();
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleClear = () => {
    setFromDate('');
    setToDate('');
    setActiveFilter('');
    setSearchQuery('');
  };

  const handleView = (trip) => {
    navigate(`/trips/view/${trip.trip_id}`);
  };


  useEffect(() => {
    fetchTrips({ searchQuery, activeFilter });
  }, [searchQuery, activeFilter]);
  return (
    <>
      <SectionHeader
        title="Trip Management"
        subtitle="Create trips, assign drivers, and monitor trip status."
        actionLabel="Create Trip"
        actionIcon={Plus}
        actionTo="/trips/add"
      />
      <div className="pb-10">
        <Table
          headers={['Sl No', 'Trip ID', 'Driver & Vehicle', 'Route', 'Date/Time', 'Status']}
          data={trips}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          searchPlaceholder="Search trips, driver, route..."
          filterOptions={[
            // { label: 'All', value: '' },
            { label: 'In Transit', value: 'IN TRANSIT' },
            { label: 'Assigned', value: 'ASSIGNED' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ]}
          renderRow={(trip, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{trip.tripId}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{trip.driver || 'N/A'}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{trip.vehicle_reg || 'N/A'}</span>
                </div>
              </td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-600 truncate max-w-[200px]">{trip.route_name}</td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-600 whitespace-nowrap">
                <div className="flex flex-col">
                  {trip.selectedDates?.slice(0, 2).map((date, i) => (
                    <span key={i}>{date}</span>
                  ))}
                  {trip.selectedDates?.length > 2 && <span className="text-[10px] text-slate-400">+{trip.selectedDates.length - 2} more</span>}
                </div>
              </td>
              <td className="px-8 py-4">
                <StatusBadge
                  status={trip.status}
                  statusColor={trip.status === 'Active' || trip.status === 'COMPLETED' ? 'success' : trip.status === 'PENDING' ? 'warning' : 'slate'}
                />
              </td>
            </>
          )}
          actions={(trip) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleView(trip)}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Quick View"
              >
                <Eye className="w-4 h-4" />
              </button>
              <Link
                to={`/trips/add/${trip.trip_id}`}
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Edit Trip"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Delete Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchTrips({ searchQuery, activeFilter, isLoadMore: true })}
              disabled={loading}
              className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Synchronizing...' : 'Load More Trips Data'}
            </button>
          </div>
        )}
      </div>

    </>
  )
};
