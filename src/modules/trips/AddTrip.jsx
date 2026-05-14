import React, { useState, useEffect } from 'react';
import {
  Save,
  User,
  Car,
  Calendar,
  Clock,
  FileText,
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
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { tripsData, driversData, vehiclesData } from '../../data/mockData';
import { useDrivers } from '../drivers/hooks/driver.useDrivers';
import { useVehicles } from '../vehicles/hooks/vehicle.useVehicles';
import { useToast } from '../../shared/hooks/ToastContext';
import { FunctionsAPI } from '../../shared/services/functions.api';

export const AddTrip = () => {
  const location = useLocation();
  const requestData = location.state || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const { drivers, fetchDrivers, loading: driversLoading } = useDrivers();
  const { vehicles, fetchVehicles, loading: vehiclesLoading } = useVehicles();
  const { showToast } = useToast();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverSearch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVehicles({ searchQuery: vehicleSearch });
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    date: formatDate(requestData.routeDates?.[0]) || '',
    selectedRoute: null,
    selectedVehicle: null
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

  
  const handleSave = async () => {
    if (!formData.routeId || !formData.vehicleId || !formData.driverId) {
      showToast("Please select Route, Vehicle and Driver.", "error");
      return;
    }

    if (schedules.length === 0 && !formData.date) {
      showToast("Please add at least one schedule date.", "error");
      return;
    }

    // Include the current date/times if they are not yet appended to schedules
    let allDates = schedules.map(s => s.date);
    if (formData.date && !allDates.includes(formData.date)) {
      allDates.push(formData.date);
    }

    if (allDates.length === 0) {
      showToast("Please specify trip dates.", "error");
      return;
    }

    const { selectedRoute, selectedVehicle } = formData;
    const capacity = parseInt(selectedVehicle?.seatingCapacity || 0);
    const plannedPax = parseInt(formData.total_pcount || 0);

    const payload = {
      available_seats: capacity - plannedPax,
      createdAt: new Date(),
      fareMatrix: selectedRoute?.fareMatrix || {},
      order: selectedRoute?.order || 1,
      routePairs: selectedRoute?.routePairs || [],
      routeTiming: selectedRoute?.routeTiming || {},
      route_id: formData.routeId,
      route_name: formData.route,
      route_type: formData.routeType || 'core',
      routes: selectedRoute?.routes || [],
      selectedDates: allDates,
      status: "Active",
      total_seats: capacity,
    };

    try {
      const res = await FunctionsAPI.addTrip({ fields: payload });
      if (res.success) {
        showToast("Trip scheduled successfully!", "success");
        localStorage.removeItem('tripFormDraft');
        navigate('/trips');
      } else {
        showToast(res.error || "Failed to schedule trip", "error");
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      showToast("Error occurred while saving trip", "error");
    }
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
                    end_loc: route.endPoint || '',
                    selectedRoute: route
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
                    vehicleId: vehicle.docId,
                    selectedVehicle: vehicle
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
