import React, { useState, useEffect } from 'react';
import { X, CreditCard, Receipt, Hash, User } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';
import { StatusBadge } from '../../components/Shared';

const Row = ({ label, value }) => (
  <div className="flex justify-between items-start gap-4 text-xs font-bold py-2 border-b border-slate-50 last:border-0">
    <span className="text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-slate-700 text-right break-all font-mono">{value || '—'}</span>
  </div>
);

const statusColor = (s) =>
  s === 'Confirmed' ? 'success' : s === 'Pending' ? 'warning' : s === 'Cancelled' ? 'danger' : 'slate';

const formatTs = (val) => {
  if (!val) return '—';
  if (typeof val === 'number') return new Date(val).toLocaleString('en-IN');
  if (val?.toDate) return val.toDate().toLocaleString('en-IN');
  return String(val);
};

const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
  const [bookingData, setBookingData] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(false);

  useEffect(() => {
    if (!isOpen || !payment?.bookingId) {
      setBookingData(null);
      return;
    }

    const fetchBooking = async () => {
      setLoadingBooking(true);
      try {
        const snap = await getDoc(doc(db, 'bookings', payment.bookingId));
        if (snap.exists()) {
          setBookingData(snap.data());
        }
      } catch (e) {
        console.error('Error fetching booking in modal:', e);
      } finally {
        setLoadingBooking(false);
      }
    };

    fetchBooking();
  }, [isOpen, payment]);

  if (!isOpen || !payment) return null;

  // find matching user/passenger inside booking users array
  const matchedUser = bookingData?.users?.find(
    (u) => String(u.userId || '').trim() === String(payment.userId || '').trim()
  );

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-250">
        {/* header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Receipt className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg font-jakarta">Payment Details</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono truncate max-w-[220px]">
                {payment.bookingId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* amount hero */}
          <div className="flex items-center justify-between p-5 bg-indigo-600 rounded-[24px] text-white shadow-lg shadow-indigo-100">
            <div>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Amount</p>
              <h2 className="text-3xl font-black">₹{payment.amount}</h2>
              <p className="text-indigo-300 text-xs font-bold mt-1">{payment.description}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest">
                {payment.type}
              </span>
              <StatusBadge status={payment.status} statusColor={statusColor(payment.status)} />
            </div>
          </div>

          {/* booking & trip details */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-3">
              <Hash className="w-3.5 h-3.5 text-indigo-500" /> Booking Trip Details
            </h4>
            {loadingBooking ? (
              <div className="text-xs font-bold text-slate-500 p-4 bg-slate-50 rounded-2xl animate-pulse">
                Loading trip info...
              </div>
            ) : bookingData ? (
              <div className="bg-slate-50 rounded-2xl px-5 py-2">
                <Row label="Route Name" value={bookingData.route_name} />
                <Row label="Route" value={`${bookingData.route_start || '—'} ➔ ${bookingData.route_end || '—'}`} />
                <Row label="Travel Date" value={bookingData.selectedDate} />
                <Row label="Trip Number" value={bookingData.tripNo ? `#${bookingData.tripNo}` : '—'} />
                <Row label="Driver Name" value={bookingData.driver_name} />
              </div>
            ) : (
              <div className="text-xs italic text-slate-500 p-4 bg-slate-50 rounded-2xl">
                Booking record not found.
              </div>
            )}
          </div>

          {/* passenger details (from users array of booking) */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-indigo-500" /> Passenger Details
            </h4>
            {loadingBooking ? (
              <div className="text-xs font-bold text-slate-500 p-4 bg-slate-50 rounded-2xl animate-pulse">
                Loading passenger info...
              </div>
            ) : matchedUser ? (
              <div className="bg-slate-50 rounded-2xl px-5 py-2">
                <Row label="Passenger Name" value={matchedUser.name} />
                <Row label="Phone" value={matchedUser.phone} />
                <Row label="Starting Point" value={matchedUser.startingPoint} />
                <Row label="Drop Point" value={matchedUser.dropPoint} />
                <Row label="Seat Count" value={matchedUser.bookingCount} />
                <Row label="Total Fare" value={matchedUser.totalFare ? `₹${matchedUser.totalFare}` : '—'} />
                <Row label="Status" value={matchedUser.status} />
              </div>
            ) : (
              <div className="text-xs italic text-slate-500 p-4 bg-slate-50 rounded-2xl">
                No matching user found in booking users array.
              </div>
            )}
          </div>

          {/* transaction info */}
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-3">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Transaction Info
            </h4>
            <div className="bg-slate-50 rounded-2xl px-5 py-2">
              <Row label="Finance ID" value={payment.financeId} />
              <Row label="Booking ID" value={payment.bookingId} />
              <Row label="Trip ID" value={payment.tripId} />
              <Row label="Payment Method" value={payment.paymentType} />
              <Row label="Created At" value={formatTs(payment.createdAt)} />
              <Row label="User ID" value={payment.userId} />
              <Row label="Driver ID" value={payment.driverId} />
            </div>
          </div>
        </div>

        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95 font-jakarta"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
