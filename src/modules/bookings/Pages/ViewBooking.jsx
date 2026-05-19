import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Calendar, Car, Navigation, ArrowLeft, AlertCircle,
  Hash, Users, CreditCard, Loader2, User, CheckCircle2,
  XCircle, Clock, Phone, Bus, UserCheck, Route, Mail,
  Activity, Shield
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { StatusBadge } from '../../../components/Shared';
import { useDocument } from '../../../shared/hooks/useDocument';

// small reusable field box — label on top, value below
const Field = ({ label, value, mono = false, highlight }) => (
  <div className="space-y-1.5">
    <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">{label}</label>
    <p className={`px-4 py-3 rounded-xl border text-sm font-bold ${highlight
      ? 'bg-primary-50 text-primary-700 border-primary-100'
      : 'bg-white text-slate-700 border-slate-200'
      } ${mono ? 'font-mono text-xs break-all' : ''}`}>
      {value || '—'}
    </p>
  </div>
);

// card wrapper used for each section
const Card = ({ icon: Icon, iconBg = 'bg-primary-50', iconColor = 'text-primary-600', title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
    <div className="px-6 py-4 flex items-center gap-3 bg-slate-50/50 border-b border-slate-100">
      <div className={`p-2 ${iconBg} rounded-lg`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <h3 className="font-bold text-slate-800">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export const ViewBooking = () => {
  const { id } = useParams();
  const docId = decodeURIComponent(id || '');

  const { data: booking, loading, error, fetchDocument } = useDocument('bookings');
  const [trip, setTrip] = useState(null);
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [linkedLoading, setLinkedLoading] = useState(false);

  // load the booking doc when the page opens
  useEffect(() => {
    if (docId) fetchDocument(docId);
  }, [docId, fetchDocument]);

  // once we have the booking, go fetch the trip, driver and vehicle too
  useEffect(() => {
    if (!booking) return;
    const vehicleId = booking.vehicle_id || '';

    const fetchLinked = async () => {
      setLinkedLoading(true);
      try {
        const [tripSnap, driverSnap, vehicleSnap] = await Promise.all([
          booking.tripId ? getDoc(doc(db, 'trips', booking.tripId)) : Promise.resolve(null),
          booking.driver_id ? getDoc(doc(db, 'drivers', booking.driver_id)) : Promise.resolve(null),
          vehicleId ? getDoc(doc(db, 'vehicles', vehicleId)) : Promise.resolve(null),
        ]);
        if (tripSnap?.exists()) setTrip({ id: tripSnap.id, ...tripSnap.data() });
        if (driverSnap?.exists()) setDriver({ id: driverSnap.id, ...driverSnap.data() });
        if (vehicleSnap?.exists()) setVehicle({ id: vehicleSnap.id, ...vehicleSnap.data() });
      } catch (e) {
        console.error('Error fetching linked docs:', e);
      } finally {
        setLinkedLoading(false);
      }
    };
    fetchLinked();
  }, [booking]);

  const formatTs = (val) => {
    if (!val) return '—';
    if (typeof val === 'number') return new Date(val).toLocaleString('en-IN');
    if (val?.toDate) return val.toDate().toLocaleString('en-IN');
    return String(val);
  };

  const getStatusColor = (s) =>
    s === 'Confirmed' ? 'success' : s === 'Pending' ? 'warning' : s === 'Cancelled' ? 'danger' : 'slate';

  // still loading
  if (loading) return (
    <div className="p-12 flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      <p className="text-slate-500 font-medium">Loading booking details...</p>
    </div>
  );

  // doc not found or something went wrong
  if (!booking || error) return (
    <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm">
      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-800">Booking Not Found</h3>
      <p className="text-slate-500 mt-1 mb-6 text-sm">
        No document: <code className="font-mono text-xs bg-slate-100 px-1 rounded">{docId}</code>
      </p>
      <Link to="/bookings" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all">
        <ArrowLeft className="w-4 h-4" /> Back to Bookings
      </Link>
    </div>
  );

  const users = booking.users || [];
  const hasPending = users.some(u => u.status === 'Pending');
  const tripStatus = users.length === 0 ? 'No Bookings' : hasPending ? 'Pending' : 'Confirmed';
  const totalCollected = users.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 animate-in fade-in duration-500 font-jakarta">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Trip Booking — <span className="text-primary-600">#{booking.tripNo}</span></h2>
            <StatusBadge status={tripStatus} statusColor={getStatusColor(tripStatus)} />
          </div>
          <p className="text-slate-400 text-xs font-mono mt-1 break-all">{docId}</p>
        </div>
        <Link to="/bookings" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm shrink-0">
          <ArrowLeft className="w-4 h-4" /> Back to Bookings
        </Link>
      </div>

      <div className="space-y-5">

        {/* ===== 1. BOOKING OVERVIEW ===== */}
        <Card icon={Hash} iconBg="bg-primary-50" iconColor="text-primary-600" title="Booking Overview">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            <Field label="Trip No" value={`#${booking.tripNo}`} highlight />
            <Field label="Travel Date" value={booking.selectedDate} />
            <Field label="Booked / Total" value={`${booking.bookedCount ?? users.length} / ${booking.totalSeats ?? '—'} seats`} />
            <Field label="Last Updated" value={formatTs(booking.updatedAt)} />
            <Field label="Booking ID" value={booking.bookingId} mono />
            <Field label="Trip ID" value={booking.tripId} mono />
          </div>
        </Card>

        {/* ===== 2. ROUTE DETAILS ===== */}
        <Card icon={Route} iconBg="bg-emerald-50" iconColor="text-emerald-600" title="Route Details">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            <Field label="Route Name" value={booking.route_name} highlight />
            <Field label="Route Type" value={booking.route_type} />
            <Field label="Route ID" value={booking.route_id} mono />
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Start Point</label>
              <p className="px-4 py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" /> {booking.route_start || '—'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">End Point</label>
              <p className="px-4 py-3 rounded-xl bg-indigo-50/40 border border-indigo-100 font-bold text-slate-700 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {booking.route_end || '—'}
              </p>
            </div>
            {/* Route stops from trips collection */}
            {trip?.routes?.length > 0 && (
              <div className="col-span-2 md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Route Stops</label>
                <div className="flex flex-wrap gap-2">
                  {trip.routes.map((stop, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                      <MapPin className="w-3 h-3 text-primary-400" /> {stop}
                      {trip.routeTiming?.[stop] && <span className="text-slate-400 font-medium ml-1">({trip.routeTiming[stop]})</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* ===== 3. TRIP DETAILS (from trips collection) ===== */}
        {(linkedLoading || trip) && (
          <Card icon={Activity} iconBg="bg-violet-50" iconColor="text-violet-600" title="Trip Details">
            {linkedLoading && !trip ? (
              <div className="flex items-center gap-3 text-slate-400 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading trip details...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <Field label="Status" value={trip?.status} />
                <Field label="Total Seats" value={trip?.total_seats} />
                <Field label="Route Type" value={trip?.route_type} />
                <Field label="Total Bookings" value={trip?.total_bookings} />
                <Field label="Fare Matrix" value={trip?.fareMatrix ? Object.entries(trip.fareMatrix).map(([k, v]) => `${k}: ₹${v}`).join(' | ') : '—'} />
                {trip?.notes && <div className="col-span-2 md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Notes</label>
                  <p className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 italic text-sm">{trip.notes}</p>
                </div>}
              </div>
            )}
          </Card>
        )}

        {/* ===== 4. DRIVER DETAILS (from drivers collection) ===== */}
        <Card icon={UserCheck} iconBg="bg-amber-50" iconColor="text-amber-600" title="Driver Details">
          {linkedLoading && !driver ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading driver details...
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Driver Name" value={booking.driver_name || driver?.name} highlight />
              <Field label="Driver ID" value={booking.driver_id} mono />
              {driver && <>
                <Field label="Mobile" value={driver.mobile} />
                <Field label="Email" value={driver.email} />
                <Field label="Status" value={driver.status} />
                <Field label="PH License" value={driver.phLicenseNumber} />
                <Field label="PH Expiry" value={driver.phExpiryDate} />
                <Field label="DVLA License" value={driver.dvlaLicenseNumber} />
                <Field label="Address" value={driver.address} />
                <Field label="Training Status" value={driver.trainingStatus} />
              </>}
              {!driver && !linkedLoading && (
                <p className="col-span-2 text-slate-400 text-xs italic">Driver document not available.</p>
              )}
            </div>
          )}
        </Card>

        {/* ===== 5. VEHICLE DETAILS (from vehicles collection) ===== */}
        <Card icon={Car} iconBg="bg-blue-50" iconColor="text-blue-600" title="Vehicle Details">
          {linkedLoading && !vehicle ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading vehicle details...
            </div>
          ) : vehicle ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <Field label="Make & Model" value={`${vehicle.make || ''} ${vehicle.model || ''}`.trim() || '—'} highlight />
              <Field label="Reg. No" value={vehicle.registrationNo} />
              <Field label="Type" value={vehicle.type} />
              <Field label="Colour" value={vehicle.colour} />
              <Field label="Seating Capacity" value={vehicle.seatingCapacity} />
              <Field label="Operational Status" value={vehicle.operationalStatus} />
              <Field label="PH Vehicle Licence" value={vehicle.phVehicleLicence} />
              <Field label="Licence Expiry" value={vehicle.licenceExpiry} />
              <Field label="Insurance Provider" value={vehicle.providerName} />
              <Field label="Policy Number" value={vehicle.policyNumber} />
              <Field label="Insurance Expiry" value={vehicle.insuranceExpiry} />
              <Field label="Vehicle ID" value={vehicle.id} mono />
            </div>
          ) : (
            <p className="text-slate-400 text-xs italic">
              {users.find(u => u.vehicle_id) ? 'Vehicle document not found.' : 'No vehicle assigned to this booking.'}
            </p>
          )}
        </Card>

        {/* ===== 6. PASSENGERS ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 rounded-lg"><Users className="w-4 h-4 text-indigo-600" /></div>
              <h3 className="font-bold text-slate-800">
                Passengers
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-[11px] font-extrabold">{users.length}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Total: <span className="font-black text-emerald-600">₹{totalCollected}</span>
            </p>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-sm">No passenger records.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((u, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50/30 transition-colors">
                  {/* Passenger header */}
                  <div className="flex items-start justify-between gap-4 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center font-extrabold text-indigo-600 text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{u.name || 'Unknown'}</p>
                        <p className="text-[11px] text-slate-400 font-mono break-all">{u.userId}</p>
                      </div>
                    </div>
                    <StatusBadge status={u.status} statusColor={getStatusColor(u.status)} />
                  </div>

                  {/* Passenger details grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Phone</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{u.phone || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">From</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500 shrink-0" />{u.startingPoint || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Drop</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><Navigation className="w-3 h-3 text-indigo-500 shrink-0" />{u.dropPoint || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Seats</span>
                      <p className="font-black text-slate-800">{u.bookingCount ?? '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Fare</span>
                      <p className="font-black text-emerald-600">₹{u.totalFare ?? '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Payment</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${u.paymentType === 'online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}><CreditCard className="w-2.5 h-2.5" />{u.paymentType || '—'}</span>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-slate-400 font-semibold uppercase tracking-wider">Booked At</span>
                      <p className="font-medium text-slate-500">{formatTs(u.createdAt)}</p>
                    </div>
                    {u.stripeSessionId && (
                      <div className="space-y-0.5 col-span-4">
                        <span className="text-slate-400 font-semibold uppercase tracking-wider">Stripe Session</span>
                        <p className="font-mono text-[10px] text-slate-400 break-all">{u.stripeSessionId}</p>
                      </div>
                    )}
                  </div>

                  {/* Status footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                    {u.status === 'Confirmed'
                      ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-emerald-600">Payment Confirmed</span></>
                      : u.status === 'Cancelled'
                        ? <><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-red-600">Booking Cancelled</span></>
                        : <><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-amber-600">Awaiting Payment</span></>
                    }
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
