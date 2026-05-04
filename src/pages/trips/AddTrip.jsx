import React, { useState, useEffect } from 'react';
import {
  Save,
  MapPin,
  User,
  Car,
  Calendar,
  Clock,
  Navigation,
  Leaf,
  FileText,
  TrendingUp,
  Briefcase,
  Users,
  Hash,
  Milestone,
  Plus,
  Trash2,
  X,
  AlertCircle,
} from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaRoad } from 'react-icons/fa';
import { tripsData, driversData, vehiclesData, bookingsData } from '../../data/mockData';
import { useLocation } from 'react-router-dom';

export const AddTrip = () => {
  const location = useLocation();
  const requestData = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const formatDate = (isoStr) => {
    if (!isoStr) return '';
    try {
      return new Date(isoStr).toISOString().split('T')[0];
    } catch (e) {
      return '';
    }
  };

  const formatTime = (isoStr) => {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    trip_id: '',
    driver: '',
    driver_lic: '',
    vehicle_reg: '',
    trip_date: formatDate(requestData.routeDates?.[0]) || '',
    status: 'PENDING',
    total_bookings: 0,
    booking_ids: [],
    stops: [],
    notes: '',
    start_loc: requestData.origin || '',
    end_loc: requestData.destination || '',
    route: requestData.customerName ? `Route for ${requestData.customerName}` : '',
    actual_dest: requestData.destination || '',
    start_time: formatTime(requestData.routeDates?.[0]) || '',
    end_time: '',
    total_pcount: requestData.passengerCount || 0,
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
    } else {
      // Load draft from localStorage if not in edit mode
      const savedDraft = localStorage.getItem('tripFormDraft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          // Only load if it has relevant data
          if (parsed.trip_date || parsed.driver || parsed.booking_ids?.length > 0) {
            setFormData(prev => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          console.error("Failed to parse saved trip draft", e);
        }
      }
    }
  }, [id, isEdit]);

  // Persist form data to localStorage
  useEffect(() => {
    if (!isEdit) {
      localStorage.setItem('tripFormDraft', JSON.stringify(formData));
    }
  }, [formData, isEdit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'number' ? parseFloat(value) : value
      };

      if (name === 'driver' && value) {
        const vehicle = vehiclesData.find(v => v.driver === value);
        if (vehicle) {
          updated.vehicle_reg = vehicle.registration_no;
        }
        
        const driver = driversData.find(d => d.name === value);
        if (driver) {
          updated.driver_lic = driver.dvla_lic || '';
        }
      }

      return updated;
    });
  };

  const [newBookingId, setNewBookingId] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [newStop, setNewStop] = useState({ location: '', type: 'PICKUP', notes: '' });

  useEffect(() => {
    if (newBookingId.trim()) {
      const filtered = bookingsData.filter(b => 
        b.booking_id.toLowerCase().includes(newBookingId.toLowerCase()) && 
        !(formData.booking_ids || []).includes(b.booking_id)
      ).slice(0, 5);
      setFilteredBookings(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [newBookingId, formData.booking_ids]);

  const addBookingId = (id) => {
    const idToAdd = id || newBookingId.trim();
    if (idToAdd && !(formData.booking_ids || []).includes(idToAdd)) {
      setFormData(prev => ({
        ...prev,
        booking_ids: [...(Array.isArray(prev.booking_ids) ? prev.booking_ids : []), idToAdd],
        total_bookings: (Array.isArray(prev.booking_ids) ? prev.booking_ids.length : 0) + 1
      }));
      setNewBookingId('');
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    }
  };

  const handleBookingKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSuggestionIndex(prev => Math.min(prev + 1, filteredBookings.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSuggestionIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestionIndex >= 0) {
        addBookingId(filteredBookings[suggestionIndex].booking_id);
      } else {
        addBookingId();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const removeBookingId = (index) => {
    setFormData(prev => {
      const ids = Array.isArray(prev.booking_ids) ? prev.booking_ids : [];
      const updatedIds = ids.filter((_, i) => i !== index);
      return {
        ...prev,
        booking_ids: updatedIds,
        total_bookings: updatedIds.length
      };
    });
  };

  const addStop = () => {
    if (newStop.location.trim()) {
      setFormData(prev => ({
        ...prev,
        stops: [...(prev.stops || []), { ...newStop }]
      }));
      setNewStop({ location: '', type: 'PICKUP', notes: '' });
    }
  };

  const removeStop = (index) => {
    setFormData(prev => ({
      ...prev,
      stops: prev.stops.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    console.log('Saving trip data:', formData);
    localStorage.removeItem('tripFormDraft');
    navigate(-1);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              {isEdit ? `Edit Trip: ${id}` : requestData.requestId ? 'Assign Trip Request' : 'Schedule New Trip'}
            </h2>
            <p className="text-slate-500 font-medium mt-1">
              {isEdit ? 'Update operational parameters and asset allocation for this trip.' : 'Initialize a new trip, assign assets, and define operational parameters.'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm">
        {/* Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
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
                    {driversData.map(driver => (
                      <option key={driver.driver_id} value={driver.name}>
                        {driver.name}
                      </option>
                    ))}
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
                  <select
                    name="vehicle_reg"
                    value={formData.vehicle_reg}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Select vehicle</option>
                    {vehiclesData.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.registration_no}>
                        {vehicle.registration_no} ({vehicle.make} {vehicle.model})
                      </option>
                    ))}
                  </select>
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

              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Booking IDs</label>
               
                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={newBookingId}
                      onChange={(e) => setNewBookingId(e.target.value)}
                      onKeyDown={handleBookingKeyDown}
                      onFocus={() => newBookingId.trim() && setShowSuggestions(true)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      placeholder="Enter Booking ID (e.g. MRP-00001)"
                    />
                  </div>
                  <button
                    onClick={() => addBookingId()}
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>

                  {/* Dropdown */}
                  {showSuggestions && (
                    <div className="absolute z-50 w-full mt-12 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden">
                      {filteredBookings.map((booking, index) => (
                        <div
                          key={booking.booking_id}
                          onClick={() => addBookingId(booking.booking_id)}
                          className={`px-4 py-2 cursor-pointer flex items-center justify-between transition-colors ${index === suggestionIndex ? 'bg-primary-50 text-primary-700' : 'hover:bg-slate-50'}`}
                        >
                          <div>
                            <p className="font-bold text-xs">{booking.booking_id}</p>
                            <p className="text-[10px] text-slate-500">{booking.name} • {booking.pickup}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {(Array.isArray(formData.booking_ids) ? formData.booking_ids : []).map((id, index) => (
                    <div key={index} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg border border-primary-100 font-mono text-xs font-bold group transition-all">
                      <Link to={`/bookings/view/${id}`} className="hover:underline">{id}</Link>
                      <button 
                        onClick={() => removeBookingId(index)}
                        className="p-0.5 hover:bg-primary-100 rounded text-primary-400 hover:text-primary-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {(!formData.booking_ids || formData.booking_ids.length === 0) && (
                    <span className="text-xs text-slate-400 italic">No bookings assigned yet.</span>
                  )}
                </div>
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
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
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

            {/* Intermediate Stops */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-emerald-500" />
                  Intermediate Stops & Customer Points
                </h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {formData.stops?.length || 0} Stops Added
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-3">
                  {formData.stops?.map((stop, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 group animate-in slide-in-from-left-2 duration-300">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${stop.type === 'PICKUP' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stop.type === 'PICKUP' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {stop.type}
                          </span>
                          <span className="text-sm font-bold text-slate-800 truncate">{stop.location}</span>
                        </div>
                        {stop.notes && <p className="text-xs text-slate-500 mt-0.5 truncate">{stop.notes}</p>}
                      </div>
                      <button
                        onClick={() => removeStop(index)}
                        className="p-2 text-red-700 hover:text-red-900 hover:bg-red-100 rounded-lg transition-all opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {(!formData.stops || formData.stops.length === 0) && (
                    <div className="py-8 text-center rounded-xl border-2 border-dashed border-slate-100">
                      <p className="text-sm text-slate-400 italic">No intermediate stops defined.</p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-12 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 h-fit">
                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Stop Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        value={newStop.location}
                        onChange={(e) => setNewStop(prev => ({ ...prev, location: e.target.value }))}
                        className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                        placeholder="Enter address..."
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                    <select
                      value={newStop.type}
                      onChange={(e) => setNewStop(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-bold focus:border-primary-500 outline-none transition-all cursor-pointer"
                    >
                      <option value="PICKUP">PICKUP</option>
                      <option value="DROP-OFF">DROP-OFF</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Notes</label>
                    <input
                      type="text"
                      value={newStop.notes}
                      onChange={(e) => setNewStop(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm focus:border-primary-500 outline-none transition-all"
                      placeholder="Notes..."
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end">
                    <button
                      onClick={addStop}
                      className="w-full h-[42px] bg-primary-600 text-white rounded-lg flex items-center justify-center hover:bg-primary-700 transition-all shadow-md shadow-primary-600/20"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
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

      <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 px-4 sm:me-2">
        <button
          onClick={() => {
            localStorage.removeItem('tripFormDraft');
            navigate('/trips');
          }}
          className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm"
        >
          Discard Changes
        </button>
        <button
          onClick={handleSave}
          className="w-full sm:w-auto justify-center bg-primary-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5"
        >
          <Save className="w-4.5 h-4.5" /> {isEdit ? 'Save Changes' : 'Confirm & Schedule Trip'}
        </button>
      </div>
    </div>
  );
};
