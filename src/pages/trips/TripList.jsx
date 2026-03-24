import React from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../components/Shared';
import { tripsData } from '../../data/mockData';

export const TripList = () => (
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
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Trip ID</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Driver & Vehicle</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden sm:table-cell">Route</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 hidden md:table-cell">Date/Time</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100">Status</th>
              <th className="px-4 md:px-6 py-4 text-xs md:text-sm font-semibold text-slate-500 border-b border-slate-100 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tripsData.map((trip, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{trip.id}</td>
                <td className="px-4 md:px-6 py-4">
                  <div className="text-xs md:text-sm font-medium text-slate-800">{trip.driver}</div>
                  <div className="text-[10px] md:text-xs text-slate-500 mt-0.5 max-w-[140px] md:max-w-none truncate">{trip.vehicle}</div>
                </td>
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden sm:table-cell max-w-[150px] md:max-w-none truncate">{trip.route}</td>
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-slate-600 hidden md:table-cell whitespace-nowrap">{trip.date}</td>
                <td className="px-4 md:px-6 py-4 text-xs md:text-sm">
                  <StatusBadge status={trip.status} statusColor={trip.status === 'In Transit' ? 'primary' : trip.status === 'Pending' ? 'warning' : 'success'} />
                </td>
                <td className="px-4 md:px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link to={`/trips/edit/${trip.id.replace('#','')}`} className="text-primary-600 hover:text-primary-800 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
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
);
