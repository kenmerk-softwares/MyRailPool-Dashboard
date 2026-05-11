import React from 'react';
import { Edit, Trash2, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from './Shared';
import { Filter } from '../Filter/Filter';

export const BookingTable = ({ data }) => {
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

  const handleViewBooking = (id) => {
    const cleanId = id.replace('#', '');
    navigate(`/bookings/view/${cleanId}`);
  };

  const filteredData = data.filter(item => {
    const matchesSearch = !searchQuery || 
      item.booking_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.driver?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !activeFilter || item.status === activeFilter;
    const matchesDate = (!fromDate || item.req_date >= fromDate) && (!toDate || item.req_date <= toDate);

    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
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
        searchPlaceholder="Search bookings, customer, driver..."
        options={[
          { label: 'Approved', value: 'APPROVED' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Completed', value: 'COMPLETED' },
          { label: 'Declined', value: 'DECLINED' },
        ]}
      />

      <table className="w-full text-left border-collapse min-w-[1000px]">
        <thead>
          <tr className="bg-slate-50/50">
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Sl No</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Req Ref</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Booking ID</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Customer</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Pickup</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Destination</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Req Date</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Driver</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-center">Status</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs md:text-sm">
          {filteredData.map((booking, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 md:px-6 py-4 font-medium text-slate-900">{idx + 1}</td>
              <td className="px-4 md:px-6 py-4 font-medium text-slate-900">{booking.req_ref}</td>
              <td className="px-4 md:px-6 py-4 font-medium text-slate-900">{booking.booking_id}</td>
              <td className="px-4 md:px-6 py-4 text-slate-600 font-medium">{booking.name}</td>
              <td className="px-4 md:px-6 py-4 text-slate-600 truncate max-w-[150px]">{booking.pickup}</td>
              <td className="px-4 md:px-6 py-4 text-slate-600 truncate max-w-[150px]">{booking.destination}</td>
              <td className="px-4 md:px-6 py-4 text-slate-600 whitespace-nowrap">{booking.req_date}</td>
              <td className="px-4 md:px-6 py-4 text-slate-600 font-medium">{booking.driver || 'Unassigned'}</td>
              <td className="px-4 md:px-6 py-4 text-center">
                <StatusBadge status={booking.status} />
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={() => handleViewBooking(booking.booking_id)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link to={`/bookings/edit/${booking.booking_id}`} className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
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
  );
};
