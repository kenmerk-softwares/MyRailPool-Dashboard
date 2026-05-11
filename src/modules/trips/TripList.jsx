import React from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { tripsData } from '../../data/mockData';
import { Filter } from '../../Filter/Filter';

export const TripList = () => {
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

  const filteredData = tripsData.filter(item => {
    const matchesSearch = !searchQuery || 
      item.trip_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.route.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !activeFilter || item.status === activeFilter;
    const matchesDate = (!fromDate || item.trip_date >= fromDate) && (!toDate || item.trip_date <= toDate);

    return matchesSearch && matchesStatus && matchesDate;
  });
  return (
    <>
      <SectionHeader
        title="Trip Management"
        subtitle="Create trips, assign drivers, and monitor trip status."
        actionLabel="Create Trip"
        actionIcon={Plus}
        actionTo="/trips/add"
      />
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden pb-10">
        <div className="overflow-x-auto w-full">
          <Filter 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            onClear={handleClear}
            searchPlaceholder="Search trips, driver, route..."
            options={[
              { label: 'In Transit', value: 'IN TRANSIT' },
              { label: 'Assigned', value: 'ASSIGNED' },
              { label: 'Pending', value: 'PENDING' },
              { label: 'Cancelled', value: 'CANCELLED' },
            ]}
          />
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50">
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Sl No</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Trip ID</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Driver & Vehicle</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Route</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Date/Time</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
                <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredData.map((trip, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{idx + 1}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{trip.trip_id}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-xs md:text-sm font-medium text-slate-800">{trip.driver}</div>
                    <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 max-w-[140px] md:max-w-none truncate">{trip.vehicle_reg}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell max-w-[150px] md:max-w-none truncate">{trip.route}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{trip.trip_date}</td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                    <StatusBadge status={trip.status} statusColor={trip.status === 'COMPLETED' ? 'success' : trip.status === 'Pending' ? 'warning' : 'danger'} />
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link to={`/trips/view/${trip.trip_id}`} className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/trips/add/${trip.trip_id}`} className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
};
