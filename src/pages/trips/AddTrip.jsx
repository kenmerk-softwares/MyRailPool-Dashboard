import React, { useState, useEffect } from 'react';
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
  Hash,
  Globe,
  Milestone
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaRoad } from 'react-icons/fa';
import { tripsData } from '../../data/mockData';

export const AddTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    trip_id: '',
    driver: '',
    driver_lic: '',
    vehicle_reg: '',
    trip_date: '',
    status: 'PENDING',
    total_bookings: 0,
    booking_ids: '',
    notes: '',
    start_loc: '',
    end_loc: '',
    route: '',
    actual_dest: '',
    start_time: '',
    end_time: '',
    total_pcount: 0,
    miles: 0,
    price: '',
    driver_cost: '',
    saved_money: '',
    profit: '',
    co2_saved: ''
  });

  useEffect(() => {
    if (isEdit) {
      const trip = tripsData.find(t => t.trip_id === id);
      if (trip) {
        setFormData({
          ...trip,
          total_bookings: trip.total_bookings || 0,
          total_pcount: trip.total_pcount || 0,
          miles: trip.miles || 0
        });
      }
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleSave = () => {
    console.log('Saving trip data:', formData);
    navigate('/trips');
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/trips" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdit ? `Edit Trip: ${id}` : 'Schedule New Trip'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {isEdit ? 'Update operational parameters and asset allocation for this trip.' : 'Initialize a new trip, assign assets, and define operational parameters.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Hash className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Basic Information</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip ID</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="trip_id"
                    value={formData.trip_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold transition-all cursor-not-allowed"
                    placeholder="TR-XXX (Auto)"
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assign Driver</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 px-0.5" />
                  <select
                    name="driver"
                    value={formData.driver}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select a driver</option>
                    <option value="Abhilash P">Abhilash Pullelil Augustine</option>
                    <option value="James Miller">James Miller</option>
                    <option value="Robert Taylor">Robert Taylor</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">License Reference</label>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="driver_lic"
                    value={formData.driver_lic}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="DL-3994..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Registration</label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="vehicle_reg"
                    value={formData.vehicle_reg}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="OY71KYS"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="trip_date"
                    value={formData.trip_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="2026-02-12"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="ASSIGNED">ASSIGNED</option>
                  <option value="IN TRANSIT">IN TRANSIT</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bookings</label>
                <input
                  type="number"
                  name="total_bookings"
                  value={formData.total_bookings}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Booking ID</label>
                <input
                  type="text"
                  name="booking_ids"
                  value={formData.booking_ids}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="MRP-00001..."
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Remarks</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all h-[46px] resize-none"
                    placeholder="Optional trip notes..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execution & Route Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Milestone className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Execution & Route Details</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Start Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="start_loc"
                    value={formData.start_loc}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Search start address..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Arrival Point</label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="end_loc"
                    value={formData.end_loc}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Destination address..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route</label>
                <div className="relative">
                  <Milestone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="route"
                    value={formData.route}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="Route identifier..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Actual Destination</label>
                <input
                  type="text"
                  name="actual_dest"
                  value={formData.actual_dest}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="Final arrival point..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4 pt-4 border-t border-slate-50">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Scheduled Start</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="07:35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Estimated End</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="10:00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Passenger Count</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="total_pcount"
                    value={formData.total_pcount}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Miles</label>
                <div className="relative">
                  <FaRoad className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="miles"
                    value={formData.miles}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Financial Summary</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Gross Revenue</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">₹</span>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-900 focus:ring-0 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Driver Cost</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-700">₹</span>
                  <input
                    type="text"
                    name="driver_cost"
                    value={formData.driver_cost}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-700 focus:ring-0 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Fuel Economy</label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-700">₹</span>
                  <input
                    type="text"
                    name="saved_money"
                    value={formData.saved_money}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-slate-700 focus:ring-0 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2 px-4 py-3 rounded-xl bg-primary-50 border border-primary-100">
                <label className="text-[11px] font-semibold text-primary-700 uppercase tracking-wider block mb-1">Net Profit</label>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold text-primary-700">₹</span>
                  <input
                    type="text"
                    name="profit"
                    value={formData.profit}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-xl font-extrabold text-primary-700 focus:ring-0 outline-none placeholder:text-primary-300"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <label className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-1">CO2 Savings</label>
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <input
                    type="text"
                    name="co2_saved"
                    value={formData.co2_saved}
                    onChange={handleChange}
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-emerald-700 focus:ring-0 outline-none placeholder:text-emerald-300"
                    placeholder="0.00 kg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-end gap-4 px-4">
        <button
          onClick={() => navigate('/trips')}
          className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
        >
          Discard Changes
        </button>
        <button
          onClick={handleSave}
          className="bg-primary-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5"
        >
          <Save className="w-4.5 h-4.5" /> {isEdit ? 'Save Changes' : 'Confirm & Schedule Trip'}
        </button>
      </div>
    </div>
  );
};
