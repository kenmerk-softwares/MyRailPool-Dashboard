import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Navigation,
  TrendingUp,
  User,
  Car,
  ArrowRightLeft,
  Edit,
  Clock3,
  Route as RouteIcon,
  Globe,
  ArrowRight,
  AlertCircle,
  Hash,
  Calendar,
  MapPin
} from 'lucide-react';
import { StatusBadge } from '../../components/Shared';
import { routesData } from '../../data/mockData';

export default function ViewRoute() {
  const { id } = useParams();
  const route = routesData.find(r => r.id.replace('#', '') === id);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const getSelectedDays = (daysOp) => {
    if (!daysOp) return [];
    if (daysOp === 'Daily') return [...daysOfWeek];
    const selected = daysOp.split(',').map(d => d.trim());
    return selected.map(s => {
      const full = daysOfWeek.find(d => d.startsWith(s));
      return full || s;
    });
  };

  const selectedDays = getSelectedDays(route?.days_op);
  const timeSlots = route?.time_slots?.split(',').map(t => t.trim()) || [];
  const droppingPoints = route?.droppingPoints || []; // In case it's added later

  if (!route) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Route Not Identified</h3>
        <p className="text-slate-500 mt-1 mb-6">The specified Route ID does not exist in the navigation database.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{route.name}</h2>
              <StatusBadge status={route.status} statusColor={route.status === 'Active' ? 'success' : 'slate'} />
            </div>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> Route ID: {route.id}
            </p>
          </div>
        </div>
        <Link
          to="/routes/add"
          state={{ route }}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4.5 h-4.5" /> Edit Route
        </Link>
      </div>

      <div className="space-y-8 text-sm">
        {/* Section 1: Route Specifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <RouteIcon className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Route Specifications</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route ID</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-100">{route.id}</p>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Name</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm">{route.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Corridor Type</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 uppercase">
                  {route.route_type.replace('_', ' ')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 pt-6 border-t border-slate-50">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Distance</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{route.distance}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Est. Fare</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">{route.estPrice}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Start Date & Time</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{route.timings}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">End Date & Time</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <ArrowRightLeft className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{route.return_timing || 'Continuous'}</span>
                </div>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Days Operating</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {daysOfWeek.map(day => {
                    const isSelected = selectedDays.includes(day);
                    return (
                      <span
                        key={day}
                        className={`px-2 py-1 rounded-lg text-[12px] font-bold border transition-colors ${
                          isSelected
                            ? 'bg-primary-100 border-primary-900 text-primary-900'
                            : 'bg-slate-50 border-slate-100 text-slate-300'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5 col-span-1 md:col-span-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Time Slots</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {timeSlots.length > 0 ? (
                    timeSlots.map(time => (
                      <span key={time} className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-2">
                        <Clock3 className="w-3 h-3 text-primary-500" />
                        {time}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-xs">No time slots defined</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Route Pathway */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Route Pathway</h3>
          </div>

          <div className="p-6">
            {/* Visual Route Indicator */}
            <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="flex items-center justify-between gap-8">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Primary Origin</p>
                  <p className="text-lg font-bold text-slate-900">{route.start}</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="h-px w-24 sm:w-48 bg-gradient-to-r from-primary-200 via-primary-500 to-emerald-200 relative mb-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{route.distance}</span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Termination Point</p>
                  <p className="text-lg font-bold text-slate-900">{route.end || 'TBD'}</p>
                </div>
              </div>
            </div>

            {/* Dropping Points List */}
            <div className="space-y-4">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Dropping Points / Intermediate Stops</label>
              {droppingPoints.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {droppingPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 shadow-sm group hover:border-primary-200 transition-all">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-[10px] font-bold text-emerald-600 border border-emerald-100">
                        {idx + 1}
                      </div>
                      <span className="font-medium text-slate-700">{point}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <MapPin className="w-6 h-6 text-slate-300 mb-2" />
                  <p className="text-slate-400 text-xs font-medium">No intermediate dropping points defined for this route.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Primary Asset Allocation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Primary Asset Allocation</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Driver</label>
                <div className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px]">
                    {route.driver.charAt(0)}
                  </div>
                  <span>{route.driver}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle No.</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Car className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{route.vehicle}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
