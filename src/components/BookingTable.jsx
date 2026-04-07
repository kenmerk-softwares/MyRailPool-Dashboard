import React from 'react';
import { Edit, Trash2, Search, Eye, Phone, MapPin, Calendar, CreditCard, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from './Shared';
import { FaCalendarAlt } from 'react-icons/fa';

export const BookingTable = ({ data }) => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(null);

  const handleViewBooking = (id) => {
    const cleanId = id.replace('#', '');
    navigate(`/bookings/view/${cleanId}`);
  };

  return (
    <div className="overflow-x-auto w-full">
      <div className="flex items-center justify-between m-4">
        {/* Search Bar */}
        <div className="hidden sm:flex flex-1 max-w-xl ml-4 lg:ml-0">
          <div className="relative group w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 md:pl-11 pr-4 py-2 md:py-2.5 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
              placeholder="Search bookings, trips, drivers..."
            />
          </div>
        </div>
        {/* date filter */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
          <FaCalendarAlt className="text-gray-400 text-xs" />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setActiveFilter(null); }}
            className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
          />
          <span className="text-gray-300">|</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setActiveFilter(null); }}
            className="bg-transparent border-none outline-none text-sm text-gray-600 w-32"
          />
        </div>
        <div className="flex items-center gap-3">
          <select name="" id="" className="border border-slate-200 rounded-xl px-4 py-2 text-xs md:text-sm">
            <option value="">All</option>
            <option value="">Approved</option>
            <option value="">Pending</option>
            <option value="">Completed</option>
            <option value="">Declined</option>
          </select>
          <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>
        </div>

      </div>
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="bg-slate-50/50">
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Request ID</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Booking ID</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Customer</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Route</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Request Date</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Driver</th>

            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((booking, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{booking.req_id}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{booking.id}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600">
                <div className="flex items-center">
                  <span className="truncate max-w-[120px] md:max-w-none">{booking.name}</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell truncate max-w-[150px] md:max-w-none">{booking.route}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{booking.req_date}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{booking.driver || 'Unassigned'}</td>

              <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                <StatusBadge status={booking.status} statusColor={booking.statusColor} />
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                    onClick={() => handleViewBooking(booking.id)}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link to={`/bookings/edit/${booking.id.replace('#', '')}`} className="text-yellow-600 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
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
