import React from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AddVehicle = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link to="/vehicles" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Add New Vehicle</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Register a new vehicle into the fleet.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vehicle Model</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. Toyota Innova Crysta" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">License Plate Number</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. MH-12-AB-3456" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Vehicle Type</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white">
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Hatchback">Hatchback</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Seating Capacity</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400" placeholder="e.g. 4+1" />
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Operational Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white">
                <option value="Active">Active</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 md:px-8 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to="/vehicles" className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-200 transition-colors">Cancel</Link>
          <button className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 active:bg-primary-800 transition-colors shadow-sm shadow-primary-600/20 flex items-center gap-2">
            <Save className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};
