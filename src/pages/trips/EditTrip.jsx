import React from 'react';
import { 
  ArrowLeft, 
  Save, 
  MapPin, 
  User, 
  Car, 
  Calendar, 
  Clock, 
  DollarSign, 
  Navigation, 
  Leaf, 
  FileText,
  TrendingUp,
  CreditCard,
  Briefcase,
  Users,
  Smartphone,
  Trash2,
  Hash,
  Globe,
  Milestone
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { tripsData } from '../../data/mockData';

export const EditTrip = () => {
  const { id } = useParams();
  const trip = tripsData.find(t => t.trip_id === id) || tripsData[0];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Edit Trip {trip.trip_id}</h2>
            <p className="text-sm font-medium text-slate-500 mt-0.5">Update operational parameters, asset allocation, and performance metrics.</p>
          </div>
        </div>
        
      </div>

      <div className="space-y-6 text-sm">
        {/* Mission Basis & Assignment */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Hash className="w-5 h-5 text-primary-600" />
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Mission Basis & Resource Assignment</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mission ID</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-700 bg-slate-50/50" defaultValue={trip.trip_id} readOnly />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1"> Driver</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-white font-bold text-slate-800" defaultValue={trip.driver}>
                <option value="Abhilash Pullelil Augustine">Abhilash Pullelil Augustine</option>
                <option value="James Miller">James Miller</option>
                <option value="Robert Taylor">Robert Taylor</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Driver License Ref</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={trip.driver_lic} placeholder="License code..." />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Vehicle NO.</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all font-bold text-slate-800" defaultValue={trip.vehicle_reg} placeholder="OY71KYS" />
            </div>
          </div>
        </div>

        {/* Temporal & Spatial Parameters */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Temporal & Spatial Parameters</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mission Date</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold" defaultValue={trip.trip_date} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Week</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.week} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Month</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.month} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Year</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.year} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mission Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all bg-white font-bold text-indigo-600" defaultValue={trip.status}>
                <option value="PENDING">PENDING</option>
                <option value="ASSIGNED">ASSIGNED</option>
                <option value="IN TRANSIT">IN TRANSIT</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Start Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.start_loc} />
              </div>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">End Location</label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.end_loc} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Route </label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.route} />
            </div>
          </div>
        </div>

        {/* Operational Flow & Execution */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Milestone className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Operational Flow & Execution</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Scheduled Start</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold" defaultValue={trip.start_time} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Estimated End</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold" defaultValue={trip.end_time} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Actual Destination</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.actual_dest} placeholder="Location confirmed upon arrival" />
            </div>
             <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Passenger Count</label>
              <div className="relative">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="number" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.total_pcount} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Total Bookings</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.total_bookings} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Booking ID</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-mono text-xs" defaultValue={trip.booking_ids} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1"> Notes</label>
              <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all h-[42px] resize-none" defaultValue={trip.notes} placeholder="Special mission remarks..."></textarea>
            </div>
          </div>
        </div>

        {/* Financial Audit & Impact Metrics */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <TrendingUp className="w-5 h-5 text-amber-600" />
            <h3 className="font-black text-slate-800 uppercase tracking-wider text-xs">Financial Audit & Impact Metrics</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Gross Price (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold text-slate-800" defaultValue={trip.price} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Driver Cost (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold text-red-500" defaultValue={trip.driver_cost} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Net Profit (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold text-emerald-600 bg-emerald-50/20" defaultValue={trip.profit} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Mission Miles</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.miles} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Fuel Economy (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all" defaultValue={trip.saved_money} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">CO2 Offset (kg)</label>
              <div className="relative">
                <Leaf className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 outline-none transition-all font-bold text-emerald-700" defaultValue={trip.co2_saved} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Link to="/trips" className="px-8 py-3 rounded-2xl font-black text-slate-500 hover:bg-slate-100 transition-all uppercase tracking-widest text-[11px]">Cancel</Link>
        <button className="bg-primary-800 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-wider hover:bg-primary-900 active:bg-primary-950 transition-all shadow-xl shadow-primary-900/20 flex items-center gap-2">
          <Save className="w-5 h-5" /> Update Trip
        </button>
      </div>
    </div>
  );
}