import React, { useState, useEffect } from 'react';
import {
  Save,
  User,
  Car,
  Calendar,
  FileText,
  Users,
  Hash,
  Milestone,
  Plus,
  Trash2,
  ArrowRight,
  MapPin,
  ChevronLeft,
  Loader2,
  X,
  AlertTriangle,
} from 'lucide-react';
import { db } from '../../../shared/services/firebase';
import { collection, getDocs, query, limit, where } from 'firebase/firestore';
import { Autocomplete } from '../../../components/Shared';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useToast } from '../../../shared/hooks/ToastContext';
import { FunctionsAPI } from '../../../shared/services/functions.api';

const formatToInputDate = (d) => {
  if (!d) return '';
  if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    return d;
  }
  let dateObj = null;
  if (d instanceof Date) {
    dateObj = d;
  } else if (typeof d === 'object' && d.toDate && typeof d.toDate === 'function') {
    dateObj = d.toDate();
  } else if (typeof d === 'object' && typeof d.seconds === 'number') {
    dateObj = new Date(d.seconds * 1000);
  } else if (typeof d === 'number') {
    dateObj = new Date(d);
  } else if (typeof d === 'string') {
    const parts = d.split('/');
    if (parts.length === 3 && parts[0].length <= 2 && parts[1].length <= 2 && parts[2].length === 4) {
      const day = parts[0].padStart(2, '0');
      const month = parts[1].padStart(2, '0');
      const year = parts[2];
      return `${year}-${month}-${day}`;
    }
    const parsed = new Date(d);
    if (parsed instanceof Date && !isNaN(parsed)) {
      dateObj = parsed;
    }
  }

  if (dateObj && !isNaN(dateObj.getTime())) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  return '';
};

export const AddTrip = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const location = useLocation();
  const routeRequest = location.state?.routeRequest || null;

  const [saving, setSaving] = useState(false);
  const [showNoRouteModal, setShowNoRouteModal] = useState(false);

  // Local state for isolated autocompletes
  const [driversList, setDriversList] = useState([]);
  const [driversLoadingLocal, setDriversLoadingLocal] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [vehiclesLoadingLocal, setVehiclesLoadingLocal] = useState(false);
  const [routesList, setRoutesList] = useState([]);
  const [routesLoadingLocal, setRoutesLoadingLocal] = useState(false);

  const [driverSearch, setDriverSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [routeSearch, setRouteSearch] = useState('');
  const [schedules, setSchedules] = useState([]);

  const [formData, setFormData] = useState({
    driver: '',
    driverId: '',
    vehicle_reg: '',
    vehicleId: '',
    route: '',
    routeId: '',
    routeType: 'core',
    status: 'Active',
    notes: '',
    date: '',
    total_pcount: '',
    selectedRoute: null,
    selectedVehicle: null,
    routes: [],
    routeTiming: {},
    seatingCapacity: ''
  });

  const routeSelectedDates = (formData.selectedRoute?.selectedDates || formData.selectedRoute?.operating_dates || formData.selectedRoute?.selected_dates || [])
    .map(d => formatToInputDate(d))
    .filter(Boolean);

  // Isolated Fetchers to avoid Redux side-effects
  const fetchDriversLocal = async (queryStr) => {
    if (!queryStr || queryStr === formData.driver) return;
    setDriversLoadingLocal(true);
    try {
      const colRef = collection(db, 'drivers');
      const q = query(colRef, limit(20));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      const filtered = list.filter(d =>
        d.name?.toLowerCase().includes(queryStr.toLowerCase()) ||
        d.mobile?.toLowerCase().includes(queryStr.toLowerCase())
      );
      setDriversList(filtered);
    } finally { setDriversLoadingLocal(false); }
  };

  const fetchVehiclesLocal = async (queryStr) => {
    if (!queryStr || queryStr === formData.vehicle_reg) return;
    setVehiclesLoadingLocal(true);
    try {
      const colRef = collection(db, 'vehicles');
      const q = query(colRef, limit(20));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      const filtered = list.filter(v =>
        v.registrationNo?.toLowerCase().includes(queryStr.toLowerCase()) ||
        v.make?.toLowerCase().includes(queryStr.toLowerCase())
      );
      setVehiclesList(filtered);
    } finally { setVehiclesLoadingLocal(false); }
  };

  const fetchRoutesLocal = async (queryStr) => {
    if (!queryStr || queryStr === formData.route) return;
    setRoutesLoadingLocal(true);
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
      setRoutesList(filtered);
    } finally { setRoutesLoadingLocal(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchDriversLocal(driverSearch), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverSearch, formData.driver]);

  useEffect(() => {
    const timer = setTimeout(() => fetchVehiclesLocal(vehicleSearch), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleSearch, formData.vehicle_reg]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRoutesLocal(routeSearch), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeSearch, formData.route]);

  useEffect(() => {
    if (routeRequest) {
      const initFromRequest = async () => {
        try {
          const routesRef = collection(db, 'routes');
          const q = query(routesRef, limit(100));
          const snapshot = await getDocs(q);
          const list = snapshot.docs.map(doc => ({ docId: doc.id, ...doc.data() }));

          // Try to find a matching route
          const matchingRoute = list.find(r =>
            (r.name || '').toLowerCase() === routeRequest.name.toLowerCase() ||
            ((r.startingPoint || '').toLowerCase() === routeRequest.from.toLowerCase() &&
              (r.endPoint || '').toLowerCase() === routeRequest.to.toLowerCase())
          );

          if (matchingRoute) {
            setFormData(prev => ({
              ...prev,
              route: matchingRoute.name,
              routeId: matchingRoute.docId,
              selectedRoute: matchingRoute,
              routes: matchingRoute.routes || [],
              routeTiming: (matchingRoute.routes || []).reduce((acc, curr) => ({ ...acc, [curr]: "" }), {})
            }));
            setRouteSearch(matchingRoute.name);

            // Populate the schedules from routeRequest.schedules
            if (routeRequest.schedules && routeRequest.schedules.length > 0) {
              const initialSchedules = routeRequest.schedules.map((s, idx) => {
                const parts = s.date.split('-');
                const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD

                const timing = {};
                if (s.time && s.time.length > 0) {
                  try {
                    const timeStr = s.time[0].toLowerCase();
                    const ampm = timeStr.includes('pm');
                    const cleanTime = timeStr.replace('am', '').replace('pm', '').trim();
                    const [h, m] = cleanTime.split(':');
                    let hours = parseInt(h, 10);
                    const minutes = parseInt(m, 10) || 0;
                    if (ampm && hours < 12) hours += 12;
                    if (!ampm && hours === 12) hours = 0;
                    const hoursStr = String(hours).padStart(2, '0');
                    const minutesStr = String(minutes).padStart(2, '0');
                    const time24 = `${hoursStr}:${minutesStr}`;

                    if (matchingRoute.routes && matchingRoute.routes.length > 0) {
                      timing[matchingRoute.routes[0]] = time24;
                    }
                  } catch (e) {
                    console.error("Error parsing schedule time:", e);
                  }
                }

                return {
                  id: Date.now() + idx,
                  date: formattedDate,
                  routeTiming: timing,
                  passengerCount: 1
                };
              });

              setSchedules(initialSchedules);
            }
          } else {
            setShowNoRouteModal(true);
            setRouteSearch(routeRequest.name);
          }
        } catch (err) {
          console.error("Error pre-populating trip from route request:", err);
        }
      };

      initFromRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeRequest]);

  const handleCreateRoute = () => {
    if (!routeRequest) return;

    const fromNode = routeRequest.from || '';
    const toNode = routeRequest.to || '';
    const routeNodes = [fromNode, toNode].filter(Boolean);
    const routesDataNodes = routeNodes.map(node => ({ name: node, distanceFromStart: 0 }));

    const operatingDates = routeRequest.schedules ? routeRequest.schedules.map(s => {
      try {
        const parts = s.date.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } catch (e) {
        return '';
      }
    }).filter(Boolean) : [];

    navigate('/routes/add', {
      state: {
        route: {
          name: routeRequest.name,
          operating_dates: operatingDates,
          routes: routeNodes,
          routesData: routesDataNodes
        }
      }
    });
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSchedule = () => {
    if (!formData.date) {
      showToast("Please select a date first.", "error");
      return;
    }
    if (routeSelectedDates.length > 0 && !routeSelectedDates.includes(formData.date)) {
      showToast("The selected date is not in the operating dates of the selected route corridor.", "error");
      return;
    }
    const isDuplicate = schedules.some(s => s.date === formData.date);
    if (isDuplicate) {
      showToast("This date has already been scheduled.", "error");
      return;
    }
    if (formData.seatingCapacity && Number(formData.total_pcount) > Number(formData.seatingCapacity)) {
      showToast(`Planned Pax Count cannot exceed seating capacity of ${formData.seatingCapacity}.`, "error");
      return;
    }
    setSchedules(prev => [
      ...prev,
      {
        id: Date.now(),
        date: formData.date,
        routeTiming: { ...formData.routeTiming },
        passengerCount: formData.total_pcount || 0
      }
    ]);
    setFormData(prev => ({ ...prev, date: '', total_pcount: '' }));
  };

  const handleRemoveSchedule = (sid) => {
    setSchedules(prev => prev.filter(s => s.id !== sid));
  };

  const handleSave = async () => {
    if (!formData.routeId || !formData.vehicleId || !formData.driverId) {
      showToast("Please select Route, Vehicle and Driver.", "error");
      return;
    }

    const itemsToSave = schedules.length > 0 ? schedules : (formData.date ? [{
      date: formData.date,
      routeTiming: formData.routeTiming,
      passengerCount: formData.total_pcount
    }] : []);

    if (itemsToSave.length === 0) {
      showToast("Please add at least one schedule date.", "error");
      return;
    }

    if (routeSelectedDates.length > 0) {
      const invalidDateItem = itemsToSave.find(item => !routeSelectedDates.includes(item.date));
      if (invalidDateItem) {
        showToast(`The date ${invalidDateItem.date} is not in the operating dates of the selected route corridor.`, "error");
        return;
      }
    }

    const maxCapacity = parseInt(formData.seatingCapacity || 0);
    const exceedsCapacity = itemsToSave.some(item => parseInt(item.passengerCount || 0) > maxCapacity);
    if (maxCapacity && exceedsCapacity) {
      showToast(`Planned Pax Count in schedule exceeds seating capacity of ${maxCapacity}.`, "error");
      return;
    }

    setSaving(true);
    const capacity = parseInt(formData.seatingCapacity || 0);
    const allDates = itemsToSave.map(item => item.date);
    const availableSeatsMap = {};
    itemsToSave.forEach(item => {
      availableSeatsMap[item.date] = parseInt(item.passengerCount || 0);
    });

    const payload = {
      available_seats: availableSeatsMap,
      fareMatrix: formData.selectedRoute?.fareMatrix || {},
      order: formData.selectedRoute?.order || 1,
      routePairs: formData.selectedRoute?.routePairs || [],
      routeTiming: itemsToSave[0].routeTiming,
      route_id: formData.routeId,
      route_name: formData.route,
      route_type: formData.routeType,
      routes: formData.routes,
      selectedDates: allDates,
      status: formData.status,
      total_seats: capacity,
      driver_name: formData.driver,
      driver_id: formData.driverId,
      vehicle_id: formData.vehicleId,
      vehicle_reg: formData.vehicle_reg,
      notes: formData.notes
    };

    try {
      const res = await FunctionsAPI.addTrip({
        type: "add",
        fields: payload
      });

      if (res.success) {
        showToast("Trip scheduled successfully!", "success");
        navigate('/trips');
      } else {
        showToast(res.error || "Failed to process trip", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <Link to="/trips" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
            <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              Initialize New Trip
            </h2>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Asset Allocation & Multi-Date Routing</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">

        {/* ── Section 1: Resource Allocation ── */}
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Hash className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Resource Allocation</h3>
          </div>

          <div className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">

              {/* Driver Autocomplete */}
              <div className="md:col-span-2">
                <Autocomplete
                  label="Verified Operator"
                  placeholder="Search driver dossier..."
                  icon={User}
                  value={driverSearch}
                  onChange={setDriverSearch}
                  loading={driversLoadingLocal}
                  results={driversList}
                  onSelect={async (driver) => {
                    setFormData(prev => ({ ...prev, driver: driver.name, driverId: driver.docId }));
                    setDriverSearch(driver.name);
                    try {
                      const vehiclesCollection = collection(db, 'vehicles');
                      const q = query(vehiclesCollection, where('driverId', '==', driver.docId));
                      const snap = await getDocs(q);
                      if (!snap.empty) {
                        const vehicleDoc = snap.docs[0];
                        const vehicle = { docId: vehicleDoc.id, ...vehicleDoc.data() };
                        const searchKeyUpper = (vehicle.searchKey || vehicle.registrationNo || '').toUpperCase();
                        setVehicleSearch(searchKeyUpper);
                        setFormData(prev => ({
                          ...prev,
                          vehicle_reg: vehicle.registrationNo || '',
                          vehicleId: vehicle.docId,
                          selectedVehicle: vehicle,
                          seatingCapacity: vehicle.seatingCapacity || ''
                        }));
                      }
                    } catch (err) {
                      console.error("Error auto-filling vehicle:", err);
                    }
                  }}
                  renderItem={(driver) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-sm">{driver.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">{driver.mobile}</span>
                    </div>
                  )}
                />
              </div>

              {/* Vehicle Autocomplete */}
              <div className="md:col-span-2">
                <Autocomplete
                  label="Asset Assignment"
                  placeholder="Search registration no..."
                  icon={Car}
                  value={vehicleSearch}
                  onChange={setVehicleSearch}
                  loading={vehiclesLoadingLocal}
                  results={vehiclesList}
                  onSelect={(vehicle) => {
                    setFormData(prev => ({ ...prev, vehicle_reg: vehicle.registrationNo, vehicleId: vehicle.docId, selectedVehicle: vehicle, seatingCapacity: vehicle.seatingCapacity || '' }));
                    setVehicleSearch(vehicle.registrationNo);
                  }}
                  renderItem={(vehicle) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-sm">{vehicle.registrationNo}</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">{vehicle.make} {vehicle.model}</span>
                    </div>
                  )}
                />
              </div>

              {/* Seating Capacity */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Seating Capacity</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Status</label>
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-indigo-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="Completed">🔵 Completed</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 2: Route Intelligence ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Milestone className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Route Intelligence</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Select Route Corridor</label>
                  {formData.routeId && (
                    <Link
                      to={`/routes/view/${formData.routeId}`}
                      target="_blank"
                      className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 flex items-center gap-1 uppercase tracking-widest transition-colors"
                    >
                      View Route Dossier <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  )}
                </div>
                <Autocomplete
                  placeholder="Search route name or starting point..."
                  icon={Milestone}
                  value={routeSearch}
                  onChange={setRouteSearch}
                  loading={routesLoadingLocal}
                  results={routesList}
                  onSelect={(route) => {
                    setFormData(prev => ({
                      ...prev,
                      route: route.name,
                      routeId: route.docId,
                      selectedRoute: route,
                      routes: route.routes || [],
                      routeTiming: (route.routes || []).reduce((acc, curr) => ({ ...acc, [curr]: "" }), {})
                    }));
                    setRouteSearch(route.name);
                    setSchedules([]);
                  }}
                  renderItem={(route) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800 text-sm">{route.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                        <span>{route.startingPoint}</span>
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span>{route.endPoint}</span>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Type</label>
                <select
                  name="routeType" value={formData.routeType} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="core">Core Service</option>
                  <option value="flexi">Flexi / On-Demand</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Remarks</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" name="notes" value={formData.notes} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="Optional notes for the driver..."
                  />
                </div>
              </div>
            </div>

            {/* Stop Timings Visualizer */}
            {formData.routes.length > 0 && (
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-1">Arrival Sequence Configuration</h4>
                <div className="flex items-start overflow-x-auto pb-4 scrollbar-hide gap-0">
                  {formData.routes.map((stop, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex flex-col items-center w-36">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${formData.routeTiming[stop] ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-500'}`}>
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div className="mt-4 text-center px-2">
                          <p className="text-[11px] font-black text-slate-800 truncate w-32 uppercase tracking-tighter" title={typeof stop === 'string' ? stop : ''}>
                            {typeof stop === 'string' ? stop : 'Unknown Stop'}
                          </p>
                          <div className="mt-2">
                            <input
                              type="time"
                              value={formData.routeTiming[stop] || ""}
                              onChange={(e) => {
                                const newTiming = { ...formData.routeTiming, [stop]: e.target.value };
                                setFormData(prev => ({ ...prev, routeTiming: newTiming }));
                              }}
                              className="w-24 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 focus:border-indigo-500 transition-all outline-none text-center"
                            />
                          </div>
                        </div>
                      </div>
                      {idx < formData.routes.length - 1 && (
                        <div className="pt-5 px-1">
                          <div className="w-8 h-0.5 bg-slate-200"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Section 3: Scheduling ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Trip Execution & Multi-Date Scheduling</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  {!formData.routeId ? (
                    <select
                      disabled
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-bold outline-none cursor-not-allowed text-sm"
                    >
                      <option>Select Route Corridor First</option>
                    </select>
                  ) : routeSelectedDates.length > 0 ? (
                    <select
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm cursor-pointer"
                    >
                      <option value="">Select Operational Date</option>
                      {routeSelectedDates.map(d => {
                        const dateObj = new Date(d);
                        return (
                          <option key={d} value={d}>
                            {isNaN(dateObj.getTime()) ? d : dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Planned Pax Count</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="number" name="total_pcount" value={formData.total_pcount} onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-2.5 rounded-xl border bg-white font-bold outline-none transition-all text-sm ${formData.seatingCapacity && Number(formData.total_pcount) > Number(formData.seatingCapacity)
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-slate-200 focus:border-indigo-500'
                      }`}
                    placeholder="Pax Count"
                    max={formData.seatingCapacity}
                  />
                </div>
                {formData.seatingCapacity && Number(formData.total_pcount) > Number(formData.seatingCapacity) && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 animate-in fade-in slide-in-from-top-1">
                    Pax count cannot exceed seating capacity of {formData.seatingCapacity}
                  </p>
                )}
              </div>

              <button
                type="button" onClick={handleAddSchedule}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 active:scale-95 text-sm"
              >
                <Plus className="w-4 h-4" /> Add to Schedule
              </button>
            </div>

            {/* Schedules Table */}
            {schedules.length > 0 ? (
              <div className="mt-8 overflow-hidden border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Deployment Pax</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex flex-col items-center justify-center border border-indigo-100 text-indigo-600">
                              <span className="text-[13px] font-black leading-none">{new Date(schedule.date).getDate()}</span>
                              <span className="text-[8px] font-bold uppercase">{new Date(schedule.date).toLocaleString('default', { month: 'short' })}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{new Date(schedule.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric' })}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-black text-slate-800">{schedule.passengerCount} <span className="text-slate-500 font-bold ml-1 uppercase text-[10px]">Seats Reserved</span></span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <button
                            type="button" onClick={() => handleRemoveSchedule(schedule.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="mt-6 py-12 flex flex-col items-center justify-center bg-slate-50/30 rounded-2xl border-2 border-dashed border-slate-200">
                <Calendar className="w-8 h-8 text-slate-200 mb-3" />
                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">No Execution Windows Scheduled</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <Link
            to="/trips"
            className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider"
          >
            Discard
          </Link>
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Confirm & Schedule
          </button>
        </div>

      </div>

      {showNoRouteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setShowNoRouteModal(false)}
          />

          <div className="relative bg-white w-[92%] sm:w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 mx-auto">
            <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-amber-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-xl">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Route Corridor Not Found</h3>
              </div>
              <button
                onClick={() => setShowNoRouteModal(false)}
                className="p-2 hover:bg-amber-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm font-medium text-slate-600 leading-relaxed">
                The route corridor <strong className="text-slate-800">"{routeRequest?.name}"</strong> does not exist in the database yet.
                A route corridor is required to assign schedules and initialize a trip.
              </p>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>From:</span>
                  <span className="text-slate-800">{routeRequest?.from}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>To:</span>
                  <span className="text-slate-800">{routeRequest?.to}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <button
                onClick={() => setShowNoRouteModal(false)}
                className="px-4 py-3 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-200 transition-all w-full sm:flex-1 order-2 sm:order-1"
              >
                Close
              </button>
              <button
                onClick={handleCreateRoute}
                className="px-4 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 w-full sm:flex-[2] order-1 sm:order-2"
              >
                Establish Route
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
