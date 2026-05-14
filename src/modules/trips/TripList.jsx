import React from 'react';
import { Plus, Edit, Trash2, Eye, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { tripsData } from '../../data/mockData';
import { Table } from '../../shared/Table/Table';
export const TripList = () => {
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
      <div className="pb-10">
        <Table
          headers={['Sl No', 'Trip ID', 'Driver & Vehicle', 'Route','Date/Time', 'Status']}
          data={filteredData}
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
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{trip.trip_id}</td>
              <td className="px-8 py-4">
                <div className="flex flex-col">
                  <span className="text-[13px] font-black text-slate-800">{trip.driver}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{trip.vehicle_reg}</span>
                </div>
              </td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-600 truncate max-w-[200px]">{trip.route}</td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-600 whitespace-nowrap">{trip.trip_date} | {trip.start_time}</td>
              <td className="px-8 py-4">
                <StatusBadge 
                  status={trip.status} 
                  statusColor={trip.status === 'COMPLETED' ? 'success' : trip.status === 'PENDING' ? 'warning' : trip.status === 'CANCELLED' ? 'danger' : 'slate'} 
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
          {/* <table className="w-full text-left border-collapse min-w-[700px]">
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
          </table> */}
        </div>
     
    </>
  )
};
