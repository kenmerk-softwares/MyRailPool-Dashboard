import React from 'react';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge } from './Shared';

export const BookingTable = ({ data }) => (
  <div className="overflow-x-auto w-full">
    <table className="w-full text-left border-collapse min-w-[800px]">
      <thead>
        <tr className="bg-slate-50/50">
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">ID</th>
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Customer</th>
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Route</th>
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Date/Time</th>
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
          <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Action</th>
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
                <Link to={`/bookings/edit/${booking.id.replace('#','')}`} className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
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
