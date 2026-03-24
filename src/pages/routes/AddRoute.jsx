import React from 'react';
import { ArrowLeft, Save, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AddRoute = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link to="/routes" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Create New Route</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Define a new standard route for the fleet.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Route Display Name</label>
            <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="e.g. Airport to Downtown" />
          </div>
          <div className="border-t border-slate-100 pt-8 space-y-2">
            <label className="text-sm font-semibold text-slate-700">Route Locations</label>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative w-full">
                <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="Start Location" />
              </div>
              <div className="w-full sm:w-8 border-t-2 border-dashed border-slate-300 hidden sm:block"></div>
              <div className="relative w-full">
                <MapPin className="w-5 h-5 absolute left-3 top-2.5 text-primary-500" />
                <input type="text" className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="End Location" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
               <div className="space-y-2 w-full">
                <label className="text-sm font-semibold text-slate-700">Distance (km)</label>
                <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="0" />
              </div>
              <div className="space-y-2 w-full">
                <label className="text-sm font-semibold text-slate-700">Estimated Price (₹)</label>
                <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" placeholder="0.00" />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8">
            <div className="space-y-2 w-full max-w-sm">
              <label className="text-sm font-semibold text-slate-700">Route Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white">
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 md:px-8 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/routes" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancel</Link>
          <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Route
          </button>
        </div>
      </div>
    </div>
  );
};
