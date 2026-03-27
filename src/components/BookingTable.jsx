import React from 'react';
import { MoreVertical, Edit, Trash2, Search, Eye, X, User, Phone, MapPin, Calendar, CreditCard, Car } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './Shared';
import { FaCalendarAlt } from 'react-icons/fa';

export const BookingTable = ({ data }) => {
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState(null);
  const [viewbooking, setViewBooking] = React.useState(false);
  const [bookingId, setBookingId] = React.useState('');

  const handleViewBooking = (id) => {
    setViewBooking(true);
    setBookingId(id);
  }

  const selectedBooking = data.find(b => b.id === bookingId);

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
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">ID</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Customer</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Route</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Date/Time</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
            <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((booking, idx) => (
            <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{booking.id}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600">
                <div className="flex items-center">
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold mr-2 md:mr-3 border border-white shadow-sm shrink-0">
                    {booking.name.charAt(0)}
                  </div>
                  <span className="truncate max-w-[120px] md:max-w-none">{booking.name}</span>
                </div>
              </td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell truncate max-w-[150px] md:max-w-none">{booking.route}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{booking.date}</td>
              <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                <StatusBadge status={booking.status} statusColor={booking.statusColor} />
              </td>
              <td className="px-4 md:px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-green-500 hover:text-green-700 p-1.5 rounded-lg hover:bg-green-50 transition-colors"
                  onClick={() =>handleViewBooking(booking.id)}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <Link to={`/bookings/edit/${booking.id.replace('#', '')}`} className="text-yellow-500 hover:text-yellow-800 p-1.5 rounded-lg hover:bg-yellow-50 transition-colors">
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

      {viewbooking && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewBooking(false)} />
          
          <div className="relative w-full max-w-2xl bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
            <div className="relative h-32 bg-primary-900 opacity-95 p-8 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                  <Eye className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">Booking Details</h3>
                  <p className="text-blue-100 text-sm opacity-90">{selectedBooking.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewBooking(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <User className="w-4 h-4" />
                    Customer Information
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-300 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                        {selectedBooking.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-slate-900 font-bold text-lg">{selectedBooking.name}</div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <Phone className="w-3.5 h-3.5" />
                          {selectedBooking.phone || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <MapPin className="w-4 h-4" />
                    Trip Details
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-300 space-y-4">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 p-1.5 bg-green-50 rounded-lg text-green-600">
                          <div className="w-2 h-2 rounded-full bg-current" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-600 uppercase font-medium">Route</div>
                          <div className="text-slate-900 font-semibold">{selectedBooking.route}</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-indigo-500 mt-1" />
                        <div>
                          <div className="text-xs text-slate-600 uppercase font-medium">Date & Time</div>
                          <div className="text-slate-900 font-semibold">{selectedBooking.date}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Pricing Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <CreditCard className="w-4 h-4" />
                    Status & Pricing
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-300 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-600 uppercase font-medium mb-1">Status</div>
                        <StatusBadge status={selectedBooking.status} statusColor={selectedBooking.statusColor} />
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-600 uppercase font-medium mb-1">Price</div>
                        <div className="text-2xl font-black text-indigo-600">{selectedBooking.price}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs uppercase tracking-wider">
                    <Car className="w-4 h-4" />
                    Driver & Vehicle
                  </div>
                  <div className="bg-slate-50/50 rounded-3xl p-5 border border-slate-300 space-y-4">
                    {selectedBooking.driver ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                            <User className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-slate-900 font-bold">{selectedBooking.driver}</div>
                            <div className="text-slate-500 text-sm">{selectedBooking.driverContact || 'N/A'}</div>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-200/60">
                          <div className="text-xs text-slate-600 uppercase font-medium">Vehicle No.</div>
                          <div className="text-slate-900 font-bold tracking-wider">{selectedBooking.vehicleNo || 'N/A'}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mb-2">
                          <User className="w-6 h-6 opacity-40" />
                        </div>
                        <p className="text-slate-600 text-sm font-medium italic">Driver not yet assigned</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
              <button 
                onClick={() => setViewBooking(false)}
                className="px-6 py-2.5 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Done
              </button>
              <button 
                className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-95"
              >
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>)
};
