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
  Clock
} from 'lucide-react';
import { db } from '../../../shared/services/firebase';
import { collection, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { Autocomplete } from '../../../components/Shared';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../../shared/hooks/ToastContext';
import { FunctionsAPI } from '../../../shared/services/functions.api';

export const EditTrip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local state for isolated autocompletes
  const [driversList, setDriversList] = useState([]);
  const [driversLoadingLocal, setDriversLoadingLocal] = useState(false);
  const [vehiclesList, setVehiclesList] = useState([]);
  const [vehiclesLoadingLocal, setVehiclesLoadingLocal] = useState(false);
  const [routesList, setRoutesList] = useState([]);
  const [routesLoadingLocal, setRoutesLoadingLocal] = useState(false);

  // Autocomplete search states
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

  // Load Edit Data
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "trips", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          let vehicleSeatingCapacity = data.total_seats;
          if (data.vehicle_id) {
            try {
              const vehicleRef = doc(db, "vehicles", data.vehicle_id);
              const vehicleSnap = await getDoc(vehicleRef);
              if (vehicleSnap.exists()) {
                vehicleSeatingCapacity = vehicleSnap.data().seatingCapacity || data.total_seats;
              }
            } catch (err) {
              console.error("Error fetching vehicle seating capacity:", err);
            }
          }
          setFormData({
            driver: data.driver_name || '',
            driverId: data.driver_id || '',
            vehicle_reg: data.vehicle_reg || '',
            vehicleId: data.vehicle_id || '',
            route: data.route_name || '',
            routeId: data.route_id || '',
            routeType: data.route_type || 'core',
            status: data.status || 'Active',
            notes: data.notes || '',
            date: '',
            total_pcount: '',
            selectedRoute: { routes: data.routes, fareMatrix: data.fareMatrix, order: data.order, routePairs: data.routePairs },
            selectedVehicle: { seatingCapacity: vehicleSeatingCapacity },
            routes: data.routes || [],
            routeTiming: data.routeTiming || {},
            seatingCapacity: vehicleSeatingCapacity || ''
          });
          setDriverSearch(data.driver_name || '');
          setVehicleSearch(data.vehicle_reg || '');
          setRouteSearch(data.route_name || '');

          const initialSchedules = Array.isArray(data.selectedDates)
            ? data.selectedDates.map((d, idx) => ({
              id: idx,
              date: typeof d === 'string' ? d : '',
              routeTiming: data.routeTiming || {},
              passengerCount: data.available_seats?.[d] || 0
            })).filter(s => s.date !== '')
            : [];
          setSchedules(initialSchedules);
        } else {
          showToast("Trip not found", "error");
          navigate('/trips');
        }
      } catch (error) {
        console.error("Error fetching trip:", error);
        showToast("Failed to retrieve trip details", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [id, navigate, showToast]);

  // Isolated Fetchers
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
  }, [driverSearch, formData.driver]);

  useEffect(() => {
    const timer = setTimeout(() => fetchVehiclesLocal(vehicleSearch), 400);
    return () => clearTimeout(timer);
  }, [vehicleSearch, formData.vehicle_reg]);

  useEffect(() => {
    const timer = setTimeout(() => fetchRoutesLocal(routeSearch), 400);
    return () => clearTimeout(timer);
  }, [routeSearch, formData.route]);

  const handleSave = async () => {
    if (!formData.routeId || !formData.vehicleId || !formData.driverId) {
      showToast("Please select Route, Vehicle and Driver.", "error");
      return;
    }
    if (schedules.length === 0) {
      showToast("Please add at least one schedule date.", "error");
      return;
    }

    setSaving(true);
    const capacity = parseInt(formData.seatingCapacity || 0);
    const allDates = schedules.map(item => item.date);
    const availableSeatsMap = {};
    schedules.forEach(item => {
      availableSeatsMap[item.date] = parseInt(item.passengerCount || 0);
    });

    const payload = {
      available_seats: availableSeatsMap,
      fareMatrix: formData.selectedRoute?.fareMatrix || {},
      order: formData.selectedRoute?.order || 1,
      routePairs: formData.selectedRoute?.routePairs || [],
      routeTiming: schedules[0].routeTiming,
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
        type: "edit",
        id: id.replace('#', ''),
        fields: payload
      });
      if (res.success) {
        showToast("Trip updated successfully!", "success");
        navigate('/trips');
      } else {
        showToast(res.error || "Failed to update trip", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSchedule = () => {
    if (!formData.date) {
      showToast("Please select a date first.", "error");
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Trip Configuration...</p>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6 px-2">
        <div className="flex items-center gap-4">
          <Link to="/trips" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
            <ChevronLeft className="w-5 h-5 text-slate-400 group-hover:text-slate-600" />
          </Link>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase tracking-widest">Update Trip Schedule</h2>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Asset Allocation & Multi-Date Routing</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Hash className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Resource Allocation</h3>
          </div>

          <div className="px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="md:col-span-2">
                <Autocomplete
                  label="Verified Operator"
                  placeholder="Search driver dossier..."
                  icon={User}
                  value={driverSearch}
                  onChange={setDriverSearch}
                  loading={driversLoadingLocal}
                  results={driversList}
                  onSelect={(driver) => {
                    setFormData(prev => ({ ...prev, driver: driver.name, driverId: driver.docId }));
                    setDriverSearch(driver.name);
                  }}
                  renderItem={(driver) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-sm">{driver.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase">{driver.mobile}</span>
                    </div>
                  )}
                />
              </div>

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
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, seatingCapacity: e.target.value }))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Status</label>
                <select
                  name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-indigo-700 font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="Completed">🔵 Completed</option>
                  <option value="Cancelled">🔴 Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Route Details */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Milestone className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Route Intelligence</h3>
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
                  placeholder="Search route name..."
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
                  }}
                  renderItem={(route) => (
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800 text-sm">{route.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-tight">
                        <span>{route.startingPoint}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <span>{route.endPoint}</span>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Type</label>
                <select
                  name="routeType" value={formData.routeType} onChange={(e) => setFormData(prev => ({ ...prev, routeType: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="core">Core Service</option>
                  <option value="flexi">Flexi / On-Demand</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Remarks</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text" name="notes" value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            </div>

            {/* Stop Timings Visualizer */}
            {formData.routes.length > 0 && (
              <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 ml-1">Arrival Sequence Configuration</h4>
                <div className="flex items-start overflow-x-auto pb-4 scrollbar-hide gap-0">
                  {formData.routes.map((stop, idx) => (
                    <div key={idx} className="flex items-start">
                      <div className="flex flex-col items-center w-36">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${formData.routeTiming[stop] ? 'bg-indigo-600 text-white' : 'bg-white border-2 border-slate-200 text-slate-400'}`}>
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

        {/* Scheduling */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight uppercase text-xs">Trip Execution Scheduling</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operational Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date" name="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Planned Pax Count</label>
                <div className="relative">
                  <Users className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number" name="total_pcount" value={formData.total_pcount} onChange={(e) => setFormData(prev => ({ ...prev, total_pcount: e.target.value }))}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                    placeholder="0"
                  />
                </div>
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
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Execution Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deployment Pax</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-indigo-50 rounded-lg flex flex-col items-center justify-center border border-indigo-100 text-indigo-600">
                              <span className="text-[13px] font-black leading-none">{typeof schedule.date === 'string' ? new Date(schedule.date).getDate() : '?'}</span>
                              <span className="text-[8px] font-bold uppercase">{typeof schedule.date === 'string' ? new Date(schedule.date).toLocaleString('default', { month: 'short' }) : '??'}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-800">{typeof schedule.date === 'string' ? new Date(schedule.date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric' }) : 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <span className="text-sm font-black text-slate-800">{schedule.passengerCount} <span className="text-slate-400 font-bold ml-1 uppercase text-[10px]">Seats Reserved</span></span>
                        </td>
                        <td className="px-8 py-4 text-center">
                          <button
                            type="button" onClick={() => setSchedules(prev => prev.filter(s => s.id !== schedule.id))}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-4">
          <Link
            to="/trips"
            className="px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 transition-all text-sm uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="button" onClick={handleSave} disabled={saving}
            className="bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Updating..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
