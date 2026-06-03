import React, { useState, useEffect } from 'react';
import {
  Save,
  User,
  MapPin,
  Navigation,
  Hash,
  DollarSign,
  Calendar,
  Loader2,
  ChevronLeft,
  Users,
  Briefcase,
  AlertCircle,
  Car,
  UserCheck,
  CheckCircle2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../../../shared/services/firebase';
import { collection, getDocs, query, limit, doc, setDoc } from 'firebase/firestore';
import { Autocomplete } from '../../../components/Shared';
import { useToast } from '../../../shared/hooks/ToastContext';
import { FunctionsAPI } from '../../../shared/services/functions.api';

export const AddBooking = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);

  // Customer selection states
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // Customer form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  // Trip selection states
  const [tripsList, setTripsList] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripSearch, setTripSearch] = useState('');
  const [selectedTrip, setSelectedTrip] = useState(null);

  // Booking details
  const [bookingCount, setBookingCount] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedRouteKey, setSelectedRouteKey] = useState('');
  const [passengerNames, setPassengerNames] = useState(['']);
  const [remarks, setRemarks] = useState('');

  // Search local registered users
  const fetchUsersLocal = async (queryStr) => {
    if (!queryStr || isNewCustomer) return;
    setUsersLoading(true);
    try {
      const colRef = collection(db, 'users');
      const q = query(colRef, limit(50));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      const filtered = list.filter(u =>
        String(u.name || u.displayName || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        String(u.mobile || u.phone || u.phoneNumber || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        String(u.email || '').toLowerCase().includes(queryStr.toLowerCase())
      );
      setUsersList(filtered);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  // Search trips
  const fetchTripsLocal = async (queryStr) => {
    setTripsLoading(true);
    try {
      const colRef = collection(db, 'trips');
      const q = query(colRef, limit(50));
      const snap = await getDocs(q);
      const list = snap.docs.map(doc => ({ docId: doc.id, ...doc.data() }));
      const filtered = list.filter(t =>
        String(t.route_name || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        String(t.driver_name || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        String(t.vehicle_reg || '').toLowerCase().includes(queryStr.toLowerCase()) ||
        String(t.tripId || '').toLowerCase().includes(queryStr.toLowerCase())
      );
      setTripsList(filtered);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setTripsLoading(false);
    }
  };

  useEffect(() => {
    if (isNewCustomer) return;
    const timer = setTimeout(() => fetchUsersLocal(userSearch), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, isNewCustomer]);

  useEffect(() => {
    const timer = setTimeout(() => fetchTripsLocal(tripSearch), 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripSearch]);

  // Adjust passenger names array dynamically when bookingCount changes
  useEffect(() => {
    const count = parseInt(bookingCount) || 1;
    setPassengerNames(prev => {
      const next = [...prev];
      if (next.length < count) {
        while (next.length < count) {
          next.push(next.length === 0 ? customerName : '');
        }
      } else if (next.length > count) {
        next.splice(count);
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingCount]);

  // Sync first passenger name with customer name
  useEffect(() => {
    setPassengerNames(prev => {
      const next = [...prev];
      if (next[0] === '' || next[0] === undefined) {
        next[0] = customerName;
      }
      return next;
    });
  }, [customerName]);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setCustomerName(user.name || user.displayName || 'Unknown');
    setCustomerPhone(user.mobile || user.phone || user.phoneNumber || '');
    setCustomerEmail(user.email || '');
    setUserSearch(user.name || user.displayName || 'Unknown');
  };

  const handleToggleNewCustomer = (e) => {
    const isNew = e.target.checked;
    setIsNewCustomer(isNew);
    setSelectedUser(null);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerEmail('');
    setUserSearch('');
  };

  const handleTripSelect = (trip) => {
    setSelectedTrip(trip);
    setTripSearch(trip.route_name ? `${trip.route_name} (#${trip.tripId})` : `Trip #${trip.tripId}`);
    setSelectedDate('');
    setSelectedRouteKey('');
  };

  // Derive route segment choices from selected trip's fareMatrix
  const routeSegments = selectedTrip?.fareMatrix
    ? Object.keys(selectedTrip.fareMatrix)
    : [];

  const singleFare = selectedTrip?.fareMatrix?.[selectedRouteKey]
    ? Number(selectedTrip.fareMatrix[selectedRouteKey])
    : 0;

  const totalFare = singleFare * bookingCount;

  const availableSeats = selectedDate && selectedTrip?.available_seats
    ? (selectedTrip.available_seats[selectedDate] ?? selectedTrip.total_seats ?? 0)
    : (selectedTrip?.total_seats ?? 0);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!selectedTrip) {
      showToast("Please select a trip.", "error");
      return;
    }
    if (!selectedDate) {
      showToast("Please select a travel date.", "error");
      return;
    }
    if (!selectedRouteKey) {
      showToast("Please select a route segment.", "error");
      return;
    }
    if (bookingCount > availableSeats) {
      showToast(`Selected passenger count (${bookingCount}) exceeds available seats (${availableSeats}).`, "error");
      return;
    }

    let finalUserId = selectedUser?.docId;
    setSaving(true);

    try {
      // 1. If register new customer is selected, write customer doc to users collection on-the-fly
      if (isNewCustomer) {
        if (!customerName.trim() || !customerPhone.trim()) {
          showToast("Name and Phone are required for new customer registration.", "error");
          setSaving(false);
          return;
        }

        const newUserRef = doc(collection(db, 'users'));
        finalUserId = newUserRef.id;
        await setDoc(newUserRef, {
          name: customerName,
          searchKey: customerName.toLowerCase(),
          email: customerEmail,
          mobile: customerPhone,
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "Active",
        });
      }

      if (!finalUserId) {
        showToast("Please select a registered customer or toggle to register a new one.", "error");
        setSaving(false);
        return;
      }

      const [start, drop] = selectedRouteKey.split("-");

      // 2. Call tripBooking Callable Cloud Function
      const payload = {
        tripId: selectedTrip.docId,
        bookingCount: Number(bookingCount),
        userId: finalUserId,
        paymentType: "offline", // Bypassing Stripe payments for direct admin bookings
        startingPoint: start,
        dropPoint: drop,
        selectedDate: [selectedDate],
        passengers: passengerNames.map(n => n.trim()).filter(n => n !== ""),
        boardingPoint: { name: start },
        dropOffPoint: { name: drop },
        multiBookings: false,
      };

      const result = await FunctionsAPI.tripBooking(payload);

      if (result.success) {
        showToast("Booking created successfully!", "success");
        navigate('/bookings');
      } else {
        showToast(result.error || result.message || "Failed to process booking.", "error");
      }
    } catch (err) {
      console.error("Booking submission error:", err);
      showToast(err.message || "An unexpected error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Bar */}
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <Link to="/bookings" className="p-2 hover:bg-slate-100 rounded-xl transition-colors group">
          <ChevronLeft className="w-5 h-5 text-slate-500 group-hover:text-slate-600" />
        </Link>
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Create New Booking</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Register a new transport booking request directly without Stripe payment.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* ── SECTION 1: CUSTOMER ASSIGNMENT ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 text-sm">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-[22px]">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-800 tracking-tight">Customer Assignment</h3>
            </div>
            
            {/* New Customer Toggle */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="new-customer-checkbox"
                checked={isNewCustomer}
                onChange={handleToggleNewCustomer}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
              />
              <label htmlFor="new-customer-checkbox" className="text-xs font-bold text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors">
                Register New Customer?
              </label>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {!isNewCustomer && (
              <div className="max-w-md">
                <Autocomplete
                  label="Search Registered Customers"
                  placeholder="Search by name, phone or email..."
                  icon={User}
                  value={userSearch}
                  onChange={setUserSearch}
                  loading={usersLoading}
                  results={usersList}
                  onSelect={handleUserSelect}
                  renderItem={(user) => (
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 text-sm">{user.name || user.displayName || 'Unknown'}</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase">{user.mobile || user.phone || 'No mobile'} | {user.email || 'No email'}</span>
                    </div>
                  )}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Customer Name</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={!isNewCustomer}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 disabled:bg-slate-50 disabled:text-slate-500 font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder={isNewCustomer ? "Enter customer name" : "Select customer to populate"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={!isNewCustomer}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 disabled:bg-slate-50 disabled:text-slate-500 font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder={isNewCustomer ? "Enter mobile phone" : "Select customer to populate"}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={!isNewCustomer}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 disabled:bg-slate-50 disabled:text-slate-500 font-bold focus:border-indigo-500 outline-none transition-all"
                  placeholder={isNewCustomer ? "Enter email address" : "Select customer to populate"}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 2: TRIP SELECT & LIVE DETAIL DISPLAY ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 text-sm">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-[22px]">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Trip Allocation</h3>
          </div>

          <div className="p-6 space-y-6">
            <div className="max-w-md">
              <Autocomplete
                label="Search Trip Schedule"
                placeholder="Search trip no, route name, driver, vehicle..."
                icon={Briefcase}
                value={tripSearch}
                onChange={setTripSearch}
                loading={tripsLoading}
                results={tripsList}
                onSelect={handleTripSelect}
                renderItem={(trip) => (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-800 text-sm">{trip.route_name || 'Unnamed Route'}</span>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase">Trip: #{trip.tripId} | Driver: {trip.driver_name || 'N/A'} | Reg: {trip.vehicle_reg || 'N/A'}</span>
                  </div>
                )}
              />
            </div>

            {selectedTrip && (
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-150 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 rounded-xl">
                    <UserCheck className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Driver</span>
                    <p className="font-bold text-slate-700 text-sm">{selectedTrip.driver_name || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {selectedTrip.driver_id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-emerald-50 rounded-xl">
                    <Car className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Allocated Asset</span>
                    <p className="font-bold text-slate-700 text-sm">{selectedTrip.vehicle_reg || 'N/A'}</p>
                    <p className="text-[10px] text-slate-500 font-mono">ID: {selectedTrip.vehicle_id || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 rounded-xl">
                    <Navigation className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Route Corridor</span>
                    <p className="font-bold text-slate-700 text-sm truncate max-w-[200px]" title={selectedTrip.route_name}>{selectedTrip.route_name || 'N/A'}</p>
                    <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">{selectedTrip.route_type || 'core'} corridor</p>
                  </div>
                </div>

                {selectedTrip.routes && selectedTrip.routes.length > 0 && (
                  <div className="col-span-1 md:col-span-3 pt-4 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Arrival Sequence stops</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedTrip.routes.map((stop, index) => (
                        <span key={index} className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                          <MapPin className="w-3 h-3 text-indigo-500" /> {stop}
                          {selectedTrip.routeTiming?.[stop] && (
                            <span className="text-slate-400 font-semibold ml-1">({selectedTrip.routeTiming[stop]})</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── SECTION 3: ROUTE & SCHEDULING DETAILS ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 text-sm">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-[22px]">
            <Calendar className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Route & Scheduling Details</h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Travel Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Travel Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                disabled={!selectedTrip}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-slate-700 font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                required
              >
                <option value="">-- Choose Date --</option>
                {selectedTrip?.selectedDates?.map((dateStr) => (
                  <option key={dateStr} value={dateStr}>
                    {new Date(dateStr).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  </option>
                ))}
              </select>
              {selectedDate && (
                <div className="flex items-center gap-1.5 mt-1 ml-1 text-xs font-bold text-indigo-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Available Seats: {availableSeats}</span>
                </div>
              )}
            </div>

            {/* Route segment */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Route Segment (Fare Key)</label>
              <select
                value={selectedRouteKey}
                onChange={(e) => setSelectedRouteKey(e.target.value)}
                disabled={!selectedTrip}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 bg-white text-slate-700 font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer disabled:bg-slate-50 disabled:text-slate-400"
                required
              >
                <option value="">-- Choose Corridor Segment --</option>
                {routeSegments.map((segment) => (
                  <option key={segment} value={segment}>
                    {segment.replace('-', ' → ')} (₹{selectedTrip.fareMatrix[segment]})
                  </option>
                ))}
              </select>
            </div>

            {/* Passenger count */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Count</label>
              <input
                type="number"
                min="1"
                max={availableSeats || 100}
                value={bookingCount}
                onChange={(e) => setBookingCount(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={!selectedTrip || !selectedDate}
                className={`w-full px-4 py-2.5 rounded-xl border font-bold focus:border-indigo-500 outline-none transition-all disabled:bg-slate-50 disabled:text-slate-400 ${
                  bookingCount > availableSeats ? 'border-red-500 focus:border-red-500 text-red-600' : 'border-slate-200 text-slate-800'
                }`}
                required
              />
              {bookingCount > availableSeats && (
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-red-500">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Cannot exceed available capacity of {availableSeats} seats</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── SECTION 4: DYNAMIC PASSENGER NAME INPUTS ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 text-sm">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-[22px]">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Passenger Details</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {passengerNames.map((name, index) => (
                <div key={index} className="space-y-2 animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Passenger {index + 1} Name {index === 0 && "(Primary)"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      const next = [...passengerNames];
                      next[index] = e.target.value;
                      setPassengerNames(next);
                    }}
                    className="w-full px-4 py-2 rounded-xl border border-slate-250 focus:border-indigo-500 outline-none transition-all font-semibold"
                    placeholder={`Enter passenger ${index + 1} name`}
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 5: FARES & REMARKS ── */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 text-sm">
          <div className="px-6 py-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50 rounded-t-[22px]">
            <DollarSign className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Fares & Operational Notes</h3>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Live Pricing Estimator Card */}
            <div className="md:col-span-1 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pricing Estimator</span>
              <div className="my-3 space-y-1">
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>Base fare per seat:</span>
                  <span>₹{singleFare}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 font-semibold">
                  <span>Passenger count:</span>
                  <span>x {bookingCount}</span>
                </div>
              </div>
              <div className="flex justify-between items-end pt-3 border-t border-indigo-200">
                <span className="text-xs font-black text-indigo-700 uppercase">Estimated Total:</span>
                <span className="text-2xl font-black text-indigo-800">₹{totalFare}</span>
              </div>
            </div>

            {/* Remarks Textarea */}
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remarks / Notes</label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-250 focus:border-indigo-500 outline-none transition-all h-[110px] resize-none font-medium"
                placeholder="Add operational notes or travel details regarding this booking..."
              />
            </div>

          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 mt-8">
          <Link
            to="/bookings"
            className="w-full sm:w-auto text-center px-6 py-3 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-250 transition-all text-sm uppercase tracking-wider"
          >
            Discard Request
          </Link>
          <button
            type="submit"
            disabled={saving || bookingCount > availableSeats}
            className="text-sm bg-primary-800 text-white px-8 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-primary-900 active:bg-primary-900 transition-all shadow-xl shadow-primary-600/30 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Confirm & Save Booking
          </button>
        </div>

      </form>
    </div>
  );
};
