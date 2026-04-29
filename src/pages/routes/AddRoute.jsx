import React, { useState } from 'react';
import {
  Save,
  MapPin,
  Navigation,
  Clock,
  ArrowRightLeft,
  User,
  Car,
  Route as RouteIcon,
  TrendingUp,
  Map,
  Calendar,
  Clock1,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { driversData, vehiclesData } from '../../data/mockData';

export const AddRoute = () => {
  const [droppingPoints, setDroppingPoints] = useState([]);
  const [currentPoint, setCurrentPoint] = useState('');

  const handleAddPoint = () => {
    if (currentPoint.trim()) {
      setDroppingPoints([...droppingPoints, currentPoint.trim()]);
      setCurrentPoint('');
    }
  };

  const handleRemovePoint = (index) => {
    setDroppingPoints(droppingPoints.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPoint();
    }
  };

  const movePoint = (index, direction) => {
    const newPoints = [...droppingPoints];
    const targetIndex = index + direction;
    if (targetIndex >= 0 && targetIndex < newPoints.length) {
      [newPoints[index], newPoints[targetIndex]] = [newPoints[targetIndex], newPoints[index]];
      setDroppingPoints(newPoints);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create New Route</h2>
            <p className="text-slate-500 font-medium mt-1">Define a new standard travel corridor and assign initial assets.</p>
          </div>
        </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className=" col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="e.g. Airport Express Corridor"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Type</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer">
                  <option value="one_way">Core route</option>
                  <option value="circuit">Flexi route</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Primary Origin (Start)</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Terminal 1 Arrival Gate..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Primary Objective (End)</label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Downtown Central Plaza..."
                  />
                </div>
              </div>

              {/* <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Intermediate stops</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-emerald-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Add stops"
                  />
                </div>
              </div> */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Distance (km)</label>
                <div className="relative">
                  <Map className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Base Est. Price (₹)</label>
                <div className="relative">
                  <TrendingUp className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input
                    type="number"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-emerald-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>


              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Start Date & Time</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">End Date & Time</label>
                <div className="relative">
                  <ArrowRightLeft className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="datetime-local"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Days Operating</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Time Slots</label>
                <div className="relative">
                  <Clock1 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* section-3: Dropping Points */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <MapPin className="w-4 h-4 text-indigo-600" />
              </div>
              <h3 className="font-bold text-slate-800 tracking-tight">Dropping Points</h3>
            </div>
            {droppingPoints.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
                {droppingPoints.length} Locations
              </span>
            )}
          </div>

          <div className="p-6 space-y-6">
            <div className="max-w-md">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">Add New Location</label>
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={currentPoint}
                    onChange={(e) => setCurrentPoint(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    placeholder="Enter location name..."
                  />
                </div>
                <button
                  onClick={handleAddPoint}
                  type="button"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-indigo-200"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Current Locations</label>
              {droppingPoints.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-4 px-4 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/20">
                  <div className="p-1 bg-white rounded-full shadow-sm mb-2">
                    <MapPin className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-slate-400 font-medium text-xs">No locations added yet</p>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-y-16 gap-x-12 pt-3">
                  {droppingPoints.map((point, index) => (
                    <div key={index} className="relative flex flex-col items-center group">
                     
                      {index !== droppingPoints.length - 1 && (
                        <div className="absolute left-[50%] top-[6px] w-[calc(100%+48px)] h-0.5 bg-emerald-500/30 z-0" />
                      )}

                      <div className="relative z-10 flex flex-col items-center gap-4">
                        
                        <div className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:scale-125 transition-transform duration-300" />

                        <div className="flex flex-col items-center gap-2">
                          <div className="px-3 py-1.5 bg-emerald-50/50 border border-emerald-100 rounded-lg max-w-[140px] shadow-sm">
                            <span className="text-[10px] font-bold text-emerald-800 block truncate text-center uppercase tracking-tight">
                              {point}
                            </span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1 bg-white border border-slate-100 shadow-lg rounded-lg p-1 transition-all duration-200">
                            <button
                              onClick={() => movePoint(index, -1)}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 disabled:opacity-20 rounded-md transition-all active:scale-90"
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </button>
                            <button
                               onClick={() => handleRemovePoint(index)}
                               className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-md transition-all active:scale-90"
                            >
                              <X className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => movePoint(index, 1)}
                              disabled={index === droppingPoints.length - 1}
                              className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 disabled:opacity-20 rounded-md transition-all active:scale-90"
                            >
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Section 2: Asset Allocation */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Primary Asset Allocation</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Default Corridor Driver</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none">
                    <option value="">Select Operator</option>
                    {driversData.map(d => (
                      <option key={d.id} value={d.name}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Default Service Vehicle</label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none">
                    <option value="">Select Asset</option>
                    {vehiclesData.map(v => (
                      <option key={v.id} value={`${v.make} ${v.model} (${v.registration_no})`}>
                        {v.make} {v.model} - {v.registration_no}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 px-4">
        <Link
          to="/routes"
          className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
        >
          Cancel
        </Link>
        <button className="w-full sm:w-auto justify-center bg-primary-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5">
          <Save className="w-4.5 h-4.5" /> Add Route
        </button>
      </div>
    </div>
  );
};
