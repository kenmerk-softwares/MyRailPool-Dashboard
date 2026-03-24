import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

export const EditBooking = () => {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link to="/bookings" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Edit Booking #{id}</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Update customer information, route, or status.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Customer Name</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" defaultValue="Liam Johnson" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Phone Number</label>
              <input type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" placeholder="+91 9876543210" />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Route</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue="Airport to Downtown">
                <option>Airport to Downtown</option>
                <option>Central Station to Hotel</option>
                <option>City Tour</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Schedule Date & Time</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-slate-700" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Price Quote (₹)</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" defaultValue="1200" />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Booking Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue="Pending">
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Completed">Completed</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Assign Driver</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue="James">
                <option value="">Unassigned</option>
                <option value="James">James Miller - MH12AB3456</option>
                <option value="Robert">Robert Taylor - MH12CD7890</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 md:px-8 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/bookings" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancel</Link>
          <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
