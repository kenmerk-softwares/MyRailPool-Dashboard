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
  ArrowRight
} from 'lucide-react';
import { db } from '../../shared/services/firebase';
import { collection, getDocs, query, limit } from 'firebase/firestore';

import { Autocomplete } from '../../components/Shared';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { FaRoad } from 'react-icons/fa';
import { tripsData, driversData, vehiclesData, bookingsData } from '../../data/mockData';
import { useDrivers } from '../drivers/hooks/driver.useDrivers';
import { useVehicles } from '../vehicles/hooks/vehicle.useVehicles';

export const AddTrip = () => {
  const location = useLocation();
  const requestData = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { drivers, fetchDrivers, loading: driversLoading } = useDrivers();
  const { vehicles, fetchVehicles, loading: vehiclesLoading } = useVehicles();

  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [routes, setRoutes] = useState([]);
  const [routesLoading, setRoutesLoading] = useState(false);

  const fetchRoutes = async (queryStr) => {
    setRoutesLoading(true);
    try {
      const routesRef = collection(db, 'routes');
      const q = query(routesRef, limit(20));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));

      const filtered = list.filter(r =>
        (r.startingPoint || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        (r.endPoint || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        (r.name || '').toLowerCase().includes(queryStr.toLowerCase())
      );
      setRoutes(filtered);
    } catch (error) {
      console.error("Error fetching routes:", error);
    } finally {
      setRoutesLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRoutes(routeSearch);
    }, 400);
    return () => clearTimeout(timer);
  }, [routeSearch]);


  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDrivers({ searchQuery: driverSearch });
    }, 400);
    return () => clearTimeout(timer);
  }, [driverSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles({ searchQuery: vehicleSearch });
    }, 400);
    return () => clearTimeout(timer);
  }, [vehicleSearch]);

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
    driver: '',
    driverId: '',
    driver_lic: '',
    vehicle_reg: '',
    vehicleId: '',
    trip_date: formatDate(requestData.routeDates?.[0]) || '',
    status: 'PENDING',
    total_bookings: '',
    route_type: '',
    booking_ids: [],
    stops: [],
    notes: '',
    start_loc: requestData.origin || '',
    end_loc: requestData.destination || '',
    route: requestData.customerName ? `Route for ${requestData.customerName}` : '',
    actual_dest: requestData.destination || '',
    start_time: formatTime(requestData.routeDates?.[0]) || '',
    end_time: '',
    total_pcount: requestData.passengerCount || '',
    miles: '',
    price: '',
    driver_cost: '',
    saved_money: '',
    profit: '',
    co2_saved: '',
    timeSlots: [],
    date: formatDate(requestData.routeDates?.[0]) || ''
  });

  const [schedules, setSchedules] = useState([]);

  const handleAddSchedule = () => {
    // If user has a time in the input but hasn't clicked the small plus button, use it
    let currentTimes = [...formData.timeSlots];
    if (currentTimes.length === 0 && currentTime) {
      currentTimes = [currentTime];
    }

    if (!formData.date) {
      alert("Please select a date first.");
      return;
    }

    if (currentTimes.length === 0) {
      alert("Please specify at least one trip starting time.");
      return;
    }

    setSchedules(prev => [
      ...prev,
      {
        id: Date.now(),
        date: formData.date,
        times: currentTimes,
        passengerCount: formData.total_pcount || 0
      }
    ]);

    // Clear operational inputs for next entry
    setFormData(prev => ({
      ...prev,
      date: '',
      timeSlots: [],
      total_pcount: ''
    }));
    setCurrentTime('');
  };


  const handleRemoveSchedule = (id) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };


  const [currentTime, setCurrentTime] = useState('');

  const handleAddTime = () => {
    if (currentTime && !formData.timeSlots.includes(currentTime)) {
      setFormData(prev => ({
        ...prev,
        timeSlots: [...prev.timeSlots, currentTime].sort()
      }));
      setCurrentTime('');
    }
  };

  const handleRemoveTime = (time) => {
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter(t => t !== time)
    }));
  };

  useEffect(() => {
    if (isEdit) {
      const trip = tripsData.find(t => t.trip_id === id);
      if (trip) {
        setFormData({
          ...trip,
          total_bookings: trip.total_bookings ?? '',
          total_pcount: trip.total_pcount ?? '',
          miles: trip.miles ?? ''
        });
      }
    } else {
      const savedDraft = localStorage.getItem('tripFormDraft');
      if (savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed.trip_date || parsed.driver || parsed.booking_ids?.length > 0) {
            setFormData(prev => ({ ...prev, ...parsed }));
          }
        } catch (e) {
          console.error("Failed to parse saved trip draft", e);
        }
      }
    }
  }, [id, isEdit]);

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
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60">
        <div className="space-y-8 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Hash className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Basic Information</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip ID</label>
                <div className="relative">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="trip_id"
                    value={formData.trip_id}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-semibold transition-all cursor-not-allowed"
                    placeholder="Auto Generated"
                    disabled
                  />
                </div>
              </div> */}

              <Autocomplete
                label="Assign Driver"
                placeholder="Search driver name..."
                icon={User}
                value={driverSearch}
                onChange={setDriverSearch}
                loading={driversLoading}
                results={drivers}
                onSelect={(driver) => {
                  setFormData(prev => ({
                    ...prev,
                    driver: driver.name,
                    driverId: driver.docId,
                    driver_lic: driver.licenseNo || driver.license_no || ''
                  }));
                  setDriverSearch(driver.name);
                }}
                renderItem={(driver) => (
                  <>
                    <span className="font-bold text-slate-800">{driver.name}</span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{driver.mobile || 'No Mobile'}</span>
                  </>
                )}
              />

              <Autocomplete
                label="Select Route Corridor"
                placeholder="Search route name or location..."
                icon={Milestone}
                value={routeSearch}
                onChange={setRouteSearch}
                loading={routesLoading}
                results={routes}
                onSelect={(route) => {
                  setFormData(prev => ({
                    ...prev,
                    route: route.name,
                    routeId: route.docId,
                    start_loc: route.startingPoint || '',
                    end_loc: route.endPoint || ''
                  }));
                  setRouteSearch(`${route.startingPoint} -> ${route.endPoint}`);
                }}
                renderItem={(route) => (
                  <div className="flex flex-col gap-1">
                    <span className="font-bold text-slate-800">{route.name}</span>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                      <span>{route.startingPoint}</span>
                      <ArrowRight className="w-3 h-3 text-slate-600" />
                      <span>{route.endPoint}</span>
                    </div>
                  </div>
                )}
              />


              <Autocomplete
                label="Vehicle Registration"
                placeholder="Search registration no..."
                icon={Car}
                value={vehicleSearch}
                onChange={setVehicleSearch}
                loading={vehiclesLoading}
                results={vehicles}
                onSelect={(vehicle) => {
                  setFormData(prev => ({
                    ...prev,
                    vehicle_reg: vehicle.registrationNo,
                    vehicleId: vehicle.docId
                  }));
                  setVehicleSearch(vehicle.registrationNo);
                }}
                renderItem={(vehicle) => (
                  <>
                    <span className="font-bold text-slate-800">{vehicle.registrationNo}</span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{vehicle.make} {vehicle.model}</span>
                  </>
                )}
              />
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Type</label>
                <select
                  name="routeType"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer"
                  defaultValue={formData.route_type || "one_way"}
                >
                  <option value="one_way">Core route</option>
                  <option value="circuit">Flexi route</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-50">
              {/* <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip Date & Time</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    name="trip_date"
                    value={formData.trip_date}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                    placeholder="DD/MM/YYYY"
                  />
                </div>
              </div> */}

              {/* <div className="space-y-2">
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
              </div> */}

              {/* <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bookings</label>
                <input
                  type="number"
                  name="total_bookings"
                  value={formData.total_bookings}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                  placeholder="0"
                />
              </div> */}

              {/* <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Booking IDs</label>

                <div className="relative flex gap-2">
                  <div className="relative flex-1">
                    <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={newBookingId}
                      onChange={(e) => setNewBookingId(e.target.value)}
                      onKeyDown={handleBookingKeyDown}
                      onFocus={() => newBookingId.trim() && setShowSuggestions(true)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-mono text-xs focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all"
                      placeholder="Enter Booking ID"
                    />
                  </div>
                  <button
                    onClick={() => addBookingId()}
                    type="button"
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all flex items-center gap-2 font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>

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
                    <span className="text-xs text-slate-500 italic">No bookings assigned yet.</span>
                  )}
                </div>
              </div> */}

              <div className="space-y-2 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Remarks</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
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


        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-200/60 overflow-hidden mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="px-8 py-5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-200">
                <Milestone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 tracking-tight">Trip Execution & Multi-Date Scheduling</h3>
              </div>
            </div>
          </div>


          <div className="p-8">
            <div className="bg-slate-50/30 rounded-[2rem] p-6 border border-slate-100/50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                
                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Operational Date</label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Departure Window</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1 group">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                      <input
                        type="time"
                        value={currentTime}
                        onChange={(e) => setCurrentTime(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddTime}
                      className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl hover:bg-emerald-100 transition-all active:scale-90 border border-emerald-100 shadow-sm"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Planned Pax Count</label>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="number"
                      name="total_pcount"
                      value={formData.total_pcount}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-sm text-sm"
                      placeholder="0"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSchedule}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-primary-200"
                >
                  <Plus className="w-4 h-4" />
                  Append Trip
                </button>
              </div>

              {/* Time Slots Chips Container */}
              {formData.timeSlots?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 ml-1">
                  {formData.timeSlots.map(time => (
                    <div key={time} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm hover:border-emerald-200 transition-all group animate-in zoom-in duration-300">
                      <span className="text-[11px] font-black text-slate-700">{time}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTime(time)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Schedules Table */}
            {schedules.length > 0 ? (
              <div className="mt-8 overflow-hidden border border-slate-100 shadow-2xl shadow-slate-200/40 bg-white animate-in fade-in slide-in-from-top-4 duration-500">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Execution Date</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deployment Slots</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Capacity</th>
                      <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="group hover:bg-emerald-50/30 transition-all duration-300">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 group-hover:bg-white rounded-xl flex flex-col items-center justify-center border border-slate-100 transition-colors">
                              <span className="text-xs font-black text-slate-800 leading-none">{new Date(schedule.date).getDate()}</span>
                              <span className="text-[8px] font-bold text-slate-500 uppercase">{new Date(schedule.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-slate-800">{new Date(schedule.date).toLocaleDateString('en-GB', { weekday: 'long' })}</span>
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{new Date(schedule.date).getFullYear()}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex flex-wrap gap-2">
                            {schedule.times.map(time => (
                              <div key={time} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50/50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100 group-hover:bg-white transition-colors">
                                <Clock className="w-3 h-3" />
                                {time}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
                              <Users className="w-4 h-4 text-slate-500 group-hover:text-emerald-500" />
                            </div>
                            <span className="text-sm font-black text-slate-800">{schedule.passengerCount} <span className="text-slate-500 font-bold ml-1">Seats</span></span>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSchedule(schedule.id)}
                            className="p-3 text-red-600 hover:text-red7600 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                            title="Remove Schedule"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-8 py-16 flex flex-col items-center justify-center bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100 animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center mb-6">
                  <Calendar className="w-10 h-10 text-slate-200" />
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-1 uppercase tracking-widest">No Scheduled Trips</h4>
                <p className="text-slate-500 text-sm font-bold">Configure your first execution window using the form above.</p>
              </div>
            )}
          </div>

      </div>

      {/* <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30 rounded-t-2xl">
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
        </div> */}


      <div className="m-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 px-4 sm:me-2">
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
    </div>
  );
};
