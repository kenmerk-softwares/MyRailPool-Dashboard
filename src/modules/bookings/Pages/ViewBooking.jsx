import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Car, Navigation, ArrowLeft, AlertCircle,
  Hash, Users, CreditCard, Loader2, User, CheckCircle2,
  XCircle, Clock, Phone, UserCheck, Route, Activity
} from 'lucide-react';
import { doc, getDoc, collection, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { StatusBadge } from '../../../components/Shared';
import { useDocument } from '../../../shared/hooks/useDocument';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';

const Field = ({ label, value, mono = false, highlight, className = '' }) => (
  <div className={`space-y-1.5 ${className}`}>
    <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">{label}</label>
    <p className={`px-4 py-3 rounded-xl border text-sm font-bold ${highlight
      ? 'bg-primary-50 text-primary-700 border-primary-100'
      : 'bg-white text-slate-700 border-slate-200'
      } ${mono ? 'font-mono text-xs break-all' : ''}`}>
      {value || '—'}
    </p>
  </div>
);

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

// Beautiful modal styled identically to DeleteModal for passenger booking cancellation
const CancelBookingModal = ({
  isOpen,
  onClose,
  onConfirm,
  passengerName,
  refund,
  setRefund,
  reason,
  setReason,
  loading = false,
  confirmedPaymentsCount = 0,
  loadingPaymentsCount = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 transform transition-all scale-100 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Cancel Booking</h3>
        <p className="text-slate-600 text-sm mt-2 mb-4">
          Are you sure you want to cancel the booking for <span className="font-semibold text-gray-900">{passengerName || 'this passenger'}</span>?
        </p>

        {loadingPaymentsCount ? (
          <div className="mb-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-100 rounded-xl py-2 px-3">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" /> Checking confirmed payments...
          </div>
        ) : confirmedPaymentsCount > 0 ? (
          <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl py-2 px-3">
            There are {confirmedPaymentsCount} confirmed payment(s) for this booking.
          </div>
        ) : null}

        {/* Refund Checkbox */}
        {confirmedPaymentsCount > 0 && !loadingPaymentsCount && (
          <div className="mb-6 flex items-center justify-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl py-3 px-4">
            <input
              type="checkbox"
              id="refund-modal-checkbox"
              checked={refund}
              onChange={(e) => setRefund(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-colors cursor-pointer"
            />
            <label htmlFor="refund-modal-checkbox" className="text-xs font-bold text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors">
              Refund booking amount
            </label>
          </div>
        )}

        {/* Optional Cancellation Reason */}
        <div className="mb-6 space-y-1.5 text-left">
          <label htmlFor="cancel-reason-textarea" className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Cancellation Reason (Optional)
          </label>
          <textarea
            id="cancel-reason-textarea"
            rows="3"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Passenger requested cancellation..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white font-semibold text-sm hover:bg-red-600 shadow-lg shadow-red-200 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel Booking'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

// Beautiful modal styled identically to CancelBookingModal for passenger details
const PassengerDetailsModal = ({ isOpen, onClose, user, passengers }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const passengerList = passengers || [];

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Passenger Details</h3>
              <p className="text-xs text-slate-500 font-medium">Booked under: {user.name || 'Unknown'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-600 transition-colors"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[350px] overflow-y-auto pr-1 space-y-3">
          {passengerList.length === 0 ? (
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-700 truncate">{user.name || 'Unknown'}</p>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-500" /> {user.mobile || user.phone || '—'}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">Primary</span>
              </div>
            </div>
          ) : (
            passengerList.map((p, idx) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-extrabold text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-700 truncate">{p.name || 'Unknown'}</p>
                    {p.age && (
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        Age: <span className="font-bold text-slate-700">{p.age}</span>
                      </p>
                    )}
                    {(p.mobile || p.phone) && (
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-500" /> {p.mobile || p.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


export const ViewBooking = () => {
  const { id } = useParams();
  const docId = decodeURIComponent(id || '');

  const { data: booking, loading, error, fetchDocument } = useDocument('bookings');
  const [trip, setTrip] = useState(null);
  const [driver, setDriver] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [linkedLoading, setLinkedLoading] = useState(false);

  const { showToast } = useToast();
  const [cancelModal, setCancelModal] = useState({ isOpen: false, passenger: null });
  const [passengerModal, setPassengerModal] = useState({ isOpen: false, user: null });
  const [refund, setRefund] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [confirmedPaymentsCount, setConfirmedPaymentsCount] = useState(0);
  const [loadingPaymentsCount, setLoadingPaymentsCount] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const confirmCancelBooking = async () => {
    if (!cancelModal.passenger) return;
    setCancelling(true);
    try {
      const response = await FunctionsAPI.cancelBooking({
        bookingId: booking.bookingId,
        userId: cancelModal.passenger.userId,
        refund,
        reason: cancellationReason
      });
      if (response?.success === false) {
        throw new Error(response.error || 'Failed to cancel booking');
      }

      showToast(response?.message || 'Booking cancelled successfully', 'success');

      setCancelModal({ isOpen: false, passenger: null });
      setCancellationReason('');
      fetchDocument(docId);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error occurred';
      showToast(`Error cancelling booking: ${errorMessage}`, 'error');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (docId) fetchDocument(docId);
  }, [docId, fetchDocument]);

  useEffect(() => {
    if (!cancelModal.isOpen || !booking) {
      setConfirmedPaymentsCount(0);
      return;
    }

    const fetchConfirmedCount = async () => {
      setLoadingPaymentsCount(true);
      try {
        const colRef = collection(db, 'finance');
        const q = query(
          colRef,
          where('status', '==', 'Confirmed'),
          where('tripId', '==', booking.tripId),
          where('bookingId', '==', booking.bookingId),
          where('paymentStatus', '==', 'complete')
        );

        const snapshot = await getCountFromServer(q);
        setConfirmedPaymentsCount(snapshot.data().count);
        console.log(snapshot.data().count);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPaymentsCount(false);
      }
    };

    fetchConfirmedCount();
  }, [cancelModal.isOpen, booking]);

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
  // const totalCollected = users.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);

  return (
    <div className="max-w-5xl mx-auto pb-12 px-4 animate-in fade-in duration-500 font-jakarta">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Trip Booking — <span className="text-primary-600">#{booking.tripNo}</span></h2>
          </div>
          <p className="text-slate-500 text-xs font-mono mt-1 break-all">{docId}</p>
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
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Start Point</label>
              <p className="px-4 py-3 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-primary-500 shrink-0" /> {booking.route_start || '—'}
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">End Point</label>
              <p className="px-4 py-3 rounded-xl bg-indigo-50/40 border border-indigo-100 font-bold text-slate-700 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-indigo-500 shrink-0" /> {booking.route_end || '—'}
              </p>
            </div>
            {/* Route stops from trips collection */}
            {trip?.routes?.length > 0 && (
              <div className="col-span-2 md:col-span-3 space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route Stops</label>
                <div className="flex flex-wrap gap-2">
                  {trip.routes.map((stop, i) => (
                    <span key={i} className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-600">
                      <MapPin className="w-3 h-3 text-primary-400" /> {stop}
                      {trip.routeTiming?.[stop] && <span className="text-slate-500 font-medium ml-1">({trip.routeTiming[stop]})</span>}
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
              <div className="flex items-center gap-3 text-slate-500 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading trip details...
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                <Field label="Status" value={trip?.status} />
                <Field label="Total Seats" value={trip?.total_seats} />
                <Field label="Route Type" value={trip?.route_type} />
                <Field label="Total Bookings" value={trip?.total_bookings} />
                <Field label="Fare Matrix" value={trip?.fareMatrix ? Object.entries(trip.fareMatrix).map(([k, v]) => `${k}: £${v}`).join('  |  ') : '—'} className="col-span-2 md:col-span-3" />
                {trip?.notes && <div className="col-span-2 md:col-span-4 space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Notes</label>
                  <p className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 italic text-sm">{trip.notes}</p>
                </div>}
              </div>
            )}
          </Card>
        )}

        {/* ===== 4. DRIVER DETAILS (from drivers collection) ===== */}
        <Card icon={UserCheck} iconBg="bg-amber-50" iconColor="text-amber-600" title="Driver Details">
          {linkedLoading && !driver ? (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
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
                <p className="col-span-2 text-slate-500 text-xs italic">Driver document not available.</p>
              )}
            </div>
          )}
        </Card>

        {/* ===== 5. VEHICLE DETAILS (from vehicles collection) ===== */}
        <Card icon={Car} iconBg="bg-blue-50" iconColor="text-blue-600" title="Vehicle Details">
          {linkedLoading && !vehicle ? (
            <div className="flex items-center gap-3 text-slate-500 text-sm">
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
            <p className="text-slate-500 text-xs italic">
              {users.find(u => u.vehicle_id) ? 'Vehicle document not found.' : 'No vehicle assigned to this booking.'}
            </p>
          )}
        </Card>

        {/* ===== 6. PASSENGERS ===== */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50/50">
            <div className="p-2 bg-indigo-50 rounded-lg"><Users className="w-4 h-4 text-indigo-600" /></div>
            <h3 className="font-bold text-slate-800">User Details</h3>
          </div>

          {users.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
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
                        <p className="text-[11px] text-slate-500 font-mono break-all">{u.userId}</p>
                      </div>
                    </div>
                    <StatusBadge status={u.status} statusColor={getStatusColor(u.status)} />
                  </div>

                  {/* Passenger details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Phone</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{u.mobile || u.phone || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">From</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-500 shrink-0" />{u.startingPoint || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Drop</span>
                      <p className="font-bold text-slate-700 flex items-center gap-1"><Navigation className="w-3 h-3 text-indigo-500 shrink-0" />{u.dropPoint || '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Seats</span>
                      <p className="font-black text-slate-800">{u.bookingCount ?? '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Fare</span>
                      <p className="font-black text-emerald-600">£{u.totalFare ?? '—'}</p>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Payment</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest ${u.paymentType === 'online' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-slate-50 text-slate-600 border border-slate-200'
                        }`}><CreditCard className="w-2.5 h-2.5" />{u.paymentType || '—'}</span>
                    </div>
                    <div className="space-y-0.5 col-span-2">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider">Booked At</span>
                      <p className="font-medium text-slate-500">{formatTs(u.createdAt)}</p>
                    </div>
                  </div>

                  {/* Status footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        {u.status === 'Confirmed'
                          ? <><CheckCircle2 className="w-4 h-4 text-emerald-500" /><span className="text-xs font-bold text-emerald-600">Payment Confirmed</span></>
                          : u.status === 'Cancelled'
                            ? <><XCircle className="w-4 h-4 text-red-500" /><span className="text-xs font-bold text-red-600">Booking Cancelled</span></>
                            : <><Clock className="w-4 h-4 text-amber-500" /><span className="text-xs font-bold text-amber-600">Awaiting Payment</span></>
                        }
                      </div>

                      <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                        <span>Passenger Count: <span className="font-bold text-slate-800">{u.passengers?.length || u.bookingCount || 0}</span></span>
                        <span>Total: <span className="font-bold text-emerald-600">£{u.totalFare || 0}</span></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setPassengerModal({ isOpen: true, user: u })}
                        className="px-3 py-1.5 bg-white border border-indigo-200 text-indigo-500 hover:bg-indigo-50 rounded-xl font-bold text-xs transition-all hover:shadow-sm active:scale-95 flex items-center gap-1.5"
                      >
                        View Passenger Details
                      </button>

                      {u.status !== 'Cancelled' && (
                        <button
                          onClick={() => {
                            setRefund(false); // Reset refund selection for safety on open
                            setCancellationReason(''); // Reset reason on open
                            setCancelModal({ isOpen: true, passenger: u });
                          }}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition-all hover:shadow-sm active:scale-95 flex items-center gap-1.5"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <CancelBookingModal
        isOpen={cancelModal.isOpen}
        onClose={() => {
          setCancelModal({ isOpen: false, passenger: null });
          setCancellationReason('');
        }}
        onConfirm={confirmCancelBooking}
        passengerName={cancelModal.passenger?.name}
        refund={refund}
        setRefund={setRefund}
        reason={cancellationReason}
        setReason={setCancellationReason}
        loading={cancelling}
        confirmedPaymentsCount={confirmedPaymentsCount}
        loadingPaymentsCount={loadingPaymentsCount}
      />
      <PassengerDetailsModal
        isOpen={passengerModal.isOpen}
        onClose={() => setPassengerModal({ isOpen: false, user: null })}
        user={passengerModal.user}
        passengers={passengerModal.user?.passengers}
      />

    </div>
  );
};
