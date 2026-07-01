import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  PoundSterling, CheckCircle, Clock, XCircle, RefreshCcw, Download
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';
import { serialize } from '../../shared/utils/serialize';
import StatCard from './StatCard';
import PaymentTable from './PaymentTable';
import PaymentCharts from './PaymentCharts';
import PaymentDetailsModal from './PaymentDetailsModal';
import { revenueChartData, methodDistributionData } from '../../data/mockData';

const parseDateTime = (val) => {
  if (!val) return { date: '', time: '' };

  let dateObj = null;
  if (typeof val === 'number') {
    dateObj = new Date(val);
  } else if (val && typeof val.toDate === 'function') {
    dateObj = val.toDate();
  } else {
    const str = String(val).trim();
    let normalized = str.replace(',', '').replace(/\s+/, 'T');

    const dmmmPattern = /^\d{1,2}-[A-Za-z]{3}-\d{4}$/;
    if (dmmmPattern.test(str)) {
      return { date: str, time: '' };
    }

    dateObj = new Date(normalized);
    if (isNaN(dateObj.getTime())) {
      dateObj = new Date(str);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    const strVal = String(val);
    const timeMatch = strVal.match(/\b\d{1,2}:\d{2}\b/);
    const time = timeMatch ? timeMatch[0] : '';
    let date = strVal.replace(/\b\d{1,2}:\d{2}\b/, '').replace(/[,]/g, '').trim();
    return { date, time };
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  const formattedDate = `${day}-${month}-${year}`;

  const hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, '0');

  let formattedTime = '';
  if (
    typeof val === 'number' ||
    (val && typeof val.toDate === 'function') ||
    String(val).includes(':') ||
    String(val).toLowerCase().includes('t')
  ) {
    formattedTime = `${hours}:${minutes}`;
  }

  return { date: formattedDate, time: formattedTime };
};

const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const str = String(val).trim();
  const cleanNumStr = str.replace('£', '').trim();
  const num = Number(cleanNumStr.replace(/[^0-9.-]/g, ''));
  if (isNaN(num)) return str;
  return `£${num.toFixed(2)}`;
};

const Payment = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [serverTotalRevenue, setServerTotalRevenue] = useState(0);
  const [serverStats, setServerStats] = useState({
    confirmed: 0,
    pending: 0,
    cancelled: 0,
    online: 0
  });
  const [hasMore, setHasMore] = useState(true);

  const allProcessedPaymentsRef = useRef([]);
  const allFilteredPaymentsRef = useRef([]);
  const visibleCountRef = useRef(15);

  const fetchPayments = useCallback(async (isLoadMore = false) => {
    setLoading(true);
    try {
      let processedData = allProcessedPaymentsRef.current;

      if (!isLoadMore || processedData.length === 0) {
        // Fetch users to map userIds to userNames
        const usersColRef = collection(db, 'users');
        const usersSnap = await getDocs(usersColRef);
        const userMap = {};
        usersSnap.forEach(uDoc => {
          const uData = uDoc.data();
          if (uData) {
            userMap[uDoc.id] = uData;
          }
        });

        const colRef = collection(db, 'finance');
        const snap = await getDocs(query(colRef, orderBy('createdAt', 'desc')));
        const rawDocs = snap.docs.map(d => ({ id: d.id, ...d.data() }));

        // Fetch bookings to get route name and travel date
        const uniqueBookingIds = Array.from(new Set(rawDocs.map(p => {
          const bId = Array.isArray(p.bookingId) ? p.bookingId[0] : p.bookingId;
          return bId;
        }).filter(Boolean)));

        const bookingSnaps = await Promise.all(
          uniqueBookingIds.map(id => getDoc(doc(db, 'bookings', id)))
        );

        const bookingMap = {};
        bookingSnaps.forEach(bSnap => {
          if (bSnap.exists()) {
            bookingMap[bSnap.id] = bSnap.data();
          }
        });

        processedData = rawDocs.map(d => {
          const userId = d.userId;
          const mappedName = userId && userMap[userId] ? userMap[userId].name : null;
          const mappedPhone = userId && userMap[userId] ? (userMap[userId].mobile || userMap[userId].phone) : null;

          const bId = Array.isArray(d.bookingId) ? d.bookingId[0] : d.bookingId;
          const booking = bId ? bookingMap[bId] : null;

          const matchedUser = booking?.users?.find(
            u => String(u.financeId || '').trim() === String(d.id || d.financeId || '').trim()
          ) || booking?.users?.find(
            u => String(u.userId || '').trim() === String(userId || '').trim()
          ) || booking?.users?.[0] || {};

          const formattedDate = booking?.selectedDate
            ? (Array.isArray(booking.selectedDate) ? booking.selectedDate.join(', ') : booking.selectedDate)
            : null;

          return serialize({
            ...d,
            userName: mappedName || d.userName || d.customerName || matchedUser.name || booking?.name || null,
            userPhone: mappedPhone || d.userPhone || matchedUser.phone || matchedUser.mobile || booking?.phone || null,
            routeName: booking?.route_name || null,
            travelDate: formattedDate || null
          });
        });

        allProcessedPaymentsRef.current = processedData;
      }

      // 1. Apply date filters to compute date-based aggregates
      let dateFilteredDocs = processedData;
      if (fromDate || toDate) {
        const fromTime = fromDate ? new Date(fromDate + 'T00:00:00').getTime() : null;
        const toTime = toDate ? new Date(toDate + 'T23:59:59').getTime() : null;

        dateFilteredDocs = processedData.filter(d => {
          const createdTime = typeof d.createdAt === 'number'
            ? d.createdAt
            : (d.createdAt?.toDate ? d.createdAt.toDate().getTime() : new Date(d.createdAt).getTime());

          if (!createdTime || isNaN(createdTime)) return true;
          if (fromTime && createdTime < fromTime) return false;
          if (toTime && createdTime > toTime) return false;
          return true;
        });
      }

      // Compute statistics based on dateFilteredDocs
      const newServerStats = {
        confirmed: dateFilteredDocs.filter(p => p.status && p.status.toLowerCase() === 'confirmed').length,
        pending: dateFilteredDocs.filter(p => p.status && p.status.toLowerCase() === 'pending').length,
        cancelled: dateFilteredDocs.filter(p => p.status && p.status.toLowerCase() === 'cancelled').length,
        online: dateFilteredDocs.filter(p => p.paymentType && p.paymentType.toLowerCase() === 'online').length
      };

      // 2. Apply status filter
      let finalFilteredDocs = dateFilteredDocs;
      if (statusFilter && statusFilter.trim() !== '') {
        finalFilteredDocs = finalFilteredDocs.filter(d =>
          d.status && d.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      // 3. Apply search query (bookingId, tripId, description, userName, userPhone)
      if (searchTerm && searchTerm.trim() !== '') {
        const s = searchTerm.toLowerCase().trim();
        finalFilteredDocs = finalFilteredDocs.filter(d =>
          (d.bookingId && String(d.bookingId).toLowerCase().includes(s)) ||
          (d.tripId && String(d.tripId).toLowerCase().includes(s)) ||
          (d.description && d.description.toLowerCase().includes(s)) ||
          (d.id && d.id.toLowerCase().includes(s)) ||
          (d.userName && d.userName.toLowerCase().includes(s)) ||
          (d.userPhone && d.userPhone.toLowerCase().includes(s))
        );
      }

      // Compute total revenue from final filtered transactions
      const currentTotalRevenue = finalFilteredDocs.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

      // Save all filtered payments for CSV export
      allFilteredPaymentsRef.current = finalFilteredDocs;

      // Handle pagination slicing client-side
      if (!isLoadMore) {
        visibleCountRef.current = 15;
      } else {
        visibleCountRef.current += 15;
      }

      const slicedDocs = finalFilteredDocs.slice(0, visibleCountRef.current);

      setPayments(slicedDocs);
      setServerTotalRevenue(currentTotalRevenue);
      setServerStats(newServerStats);
      setHasMore(visibleCountRef.current < finalFilteredDocs.length);
    } catch (e) {
      console.error('Error fetching finance:', e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchPayments(false);
  }, [fetchPayments]);

  const totalRevenue = serverTotalRevenue;
  const confirmed = serverStats.confirmed;
  const pending = serverStats.pending;
  const cancelled = serverStats.cancelled;
  const online = serverStats.online;

  const handleExportCSV = async () => {
    const targetPayments = allFilteredPaymentsRef.current;
    if (targetPayments.length === 0) return;
    setExporting(true);
    try {
      // 1. Fetch bookings
      const uniqueBookingIds = Array.from(
        new Set(
          targetPayments.map(p => {
            const bId = Array.isArray(p.bookingId) ? p.bookingId[0] : p.bookingId;
            return bId;
          }).filter(Boolean)
        )
      );
      const bookingSnaps = await Promise.all(
        uniqueBookingIds.map(id => getDoc(doc(db, 'bookings', id)))
      );

      const bookingMap = {};
      bookingSnaps.forEach(snap => {
        if (snap.exists()) {
          bookingMap[snap.id] = snap.data();
        }
      });

      // 2. Gather unique driver, vehicle, and trip IDs
      const uniqueDriverIds = Array.from(
        new Set([
          ...targetPayments.map(p => p.driverId),
          ...Object.values(bookingMap).map(b => b.driver_id),
          ...Object.values(bookingMap).flatMap(b => b.users?.map(u => u.driver_id) || [])
        ].filter(Boolean))
      );

      const uniqueVehicleIds = Array.from(
        new Set([
          ...Object.values(bookingMap).map(b => b.vehicle_id),
          ...Object.values(bookingMap).flatMap(b => b.users?.map(u => u.vehicle_id) || [])
        ].filter(Boolean))
      );

      const uniqueTripIds = Array.from(
        new Set([
          ...targetPayments.map(p => p.tripId),
          ...Object.values(bookingMap).map(b => b.tripId)
        ].filter(Boolean))
      );

      // 3. Fetch from corresponding collections
      const [driverSnaps, vehicleSnaps, tripSnaps] = await Promise.all([
        Promise.all(uniqueDriverIds.map(id => getDoc(doc(db, 'drivers', id)))),
        Promise.all(uniqueVehicleIds.map(id => getDoc(doc(db, 'vehicles', id)))),
        Promise.all(uniqueTripIds.map(id => getDoc(doc(db, 'trips', id))))
      ]);

      const driverMap = {};
      driverSnaps.forEach(snap => {
        if (snap.exists()) {
          driverMap[snap.id] = snap.data();
        }
      });

      const vehicleMap = {};
      vehicleSnaps.forEach(snap => {
        if (snap.exists()) {
          vehicleMap[snap.id] = snap.data();
        }
      });

      const tripMap = {};
      tripSnaps.forEach(snap => {
        if (snap.exists()) {
          tripMap[snap.id] = snap.data();
        }
      });

      // 4. Fetch users to map user profiles (phone, email, etc.)
      const usersColRef = collection(db, 'users');
      const usersSnap = await getDocs(usersColRef);
      const userMap = {};
      usersSnap.forEach(uDoc => {
        const uData = uDoc.data();
        if (uData) {
          userMap[uDoc.id] = uData;
        }
      });

      const headers = [
        'Booking_Request_Reference', 'Booking_ID', 'Date_Requested', 'Time_Requested',
        'Booking_Channel', 'Journey_Status', 'Passenger_First_Name', 'Passenger_Last_Name',
        'Contact_Phone', 'Contact_Email', 'Passenger_Count', 'Pickup_Date', 'Pickup_Time',
        'Pickup_Location', 'Booked_Destination', 'Actual_Dropoff (If different)', 'Actual_Dropoff_Time',
        'Fare_Quoted_Amount', 'Fare_Quoted_Date_Time', 'Fare_Confirmed_YN', 'Fare_Confirmed_Date_Time',
        'Fare_Confirmation_Channel', 'Payment_Method', 'Amount_Paid', 'Accessibility_Needs_YN',
        'Accessibility_Details', 'Third_Row_Seat_Warning_YN', 'PSV_Consent_YN', 'Accepted_By',
        'Dispatched_By', 'Driver_Name', 'Driver_Licence_No', 'Vehicle_Reg', 'Vehicle_Licence_No',
        'Other_Drivers_Responded', 'Subcontracted_YN', 'Subcontracted_To', 'Subcontracted_Date_Time',
        'Cancelled_YN', 'Cancellation_By', 'Cancellation_Date_Time', 'Notes',
        // New Payment/Finance fields
        'Finance_ID', 'Transaction_Type', 'Payment_Status', 'Booking_Charge', 'Multi_Bookings',
        'Description', 'Trip_ID', 'Trip_Status', 'Driver_ID', 'User_ID', 'Payment_Intent_ID',
        'Offline_Payment_Time'
      ];

      const formatPaymentMethod = (method) => {
        if (!method) return '';
        const str = String(method).toLowerCase().trim();
        if (str === 'online') return 'Online';
        if (str === 'cash') return 'Cash';
        if (str === 'offline') return 'Offline';
        return str.charAt(0).toUpperCase() + str.slice(1);
      };

      const rows = targetPayments.map((p) => {
        const bId = Array.isArray(p.bookingId) ? p.bookingId[0] : p.bookingId;
        const booking = bookingMap[bId] || {};
        const matchedUser = booking.users?.find(
          u => String(u.financeId || '').trim() === String(p.id || p.financeId || '').trim()
        ) || booking.users?.find(
          u => String(u.userId || '').trim() === String(p.userId || '').trim()
        ) || booking.users?.[0] || {};

        // Resolve driver, vehicle, trip objects
        const driverId = booking.driver_id || p.driverId;
        const driverObj = driverId ? driverMap[driverId] : null;

        const vehicleId = matchedUser.vehicle_id || booking.vehicle_id;
        const vehicleObj = vehicleId ? vehicleMap[vehicleId] : null;

        const tripId = booking.tripId || p.tripId;
        const tripObj = tripId ? tripMap[tripId] : null;

        // Fallbacks for date-times
        const reqDateTime = parseDateTime(booking.req_date || p.createdAt);

        let pickupDateTimeVal = booking.pickup_date;
        if (!pickupDateTimeVal && tripObj) {
          if (tripObj.trip_date && tripObj.start_time) {
            pickupDateTimeVal = `${tripObj.trip_date} ${tripObj.start_time}`;
          } else {
            pickupDateTimeVal = tripObj.trip_date || tripObj.start_time;
          }
        }
        const pickupDateTime = parseDateTime(pickupDateTimeVal);

        const fareQuotedDateTime = parseDateTime(booking.fare_date);
        const fareConfirmedDateTime = parseDateTime(booking.fare_confirm_date);
        const subcontractDateTime = parseDateTime(booking.subcontract_date);
        const cancelDateTime = parseDateTime(booking.cancel_date || (booking.status?.toLowerCase() === 'cancelled' || p.status?.toLowerCase() === 'cancelled' ? p.updatedAt : ''));

        // Split name into first and last name
        const passengerName = matchedUser.name || p.userName || booking.name || userMap[p.userId]?.name || '';
        const nameParts = passengerName.trim().split(/\s+/);
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Journey Status fallbacks
        const journeyStatus = booking.status || p.status || p.tripStatus || '';

        return [
          booking.req_ref || (p.bookingNos && p.bookingNos[0]) || '',
          booking.booking_id || bId || '',
          reqDateTime.date,
          reqDateTime.time,
          matchedUser.bookingChannel || booking.channel || 'system',
          journeyStatus,
          firstName,
          lastName,
          matchedUser.phone || matchedUser.mobile || p.userPhone || booking.phone || userMap[p.userId]?.mobile || userMap[p.userId]?.phone || '',
          matchedUser.email || p.userEmail || booking.email || userMap[p.userId]?.email || '',
          booking.p_count || matchedUser.bookingCount || p.bookingCount || 1,
          pickupDateTime.date,
          pickupDateTime.time,
          matchedUser.startingPoint || booking.pickup || tripObj?.start_loc || '',
          matchedUser.dropPoint || booking.destination || tripObj?.end_loc || '',
          booking.actual_dropoff || tripObj?.actual_dest || '',
          booking.drop_time || tripObj?.end_time || '',
          formatCurrency(booking.fare || tripObj?.price || p.amount),
          fareQuotedDateTime.date,
          booking.fare_confirm || (booking.status || p.status ? 'Yes' : 'No'),
          fareConfirmedDateTime.date,
          matchedUser.paymentConfirmationChannel || booking.fare_channel || 'system',
          formatPaymentMethod(booking.payment || p.paymentType),
          formatCurrency(p.amount || booking.paid),
          (matchedUser.accessNeeds || booking.access_need || 'no').toLowerCase() === 'yes' ? 'Yes' : 'No',
          matchedUser.accessDetails || booking.access_details || '',
          booking.third_row_warn || 'No',
          booking.psv_consent || 'Yes',
          booking.accepted_by || 'System',
          booking.dispatched_by || '',
          booking.driver || booking.driver_name || driverObj?.name || '',
          booking.driver_lic || driverObj?.phLicenseNumber || driverObj?.dvlaLicenseNumber || '',
          booking.vehicle_reg || vehicleObj?.registrationNo || '',
          booking.vehicle_lic || vehicleObj?.phVehicleLicence || '',
          booking.other_drivers || 'None',
          booking.subcontracted || 'No',
          booking.subcontract_to || '',
          subcontractDateTime.date,
          booking.cancelled || (p.status?.toLowerCase() === 'cancelled' ? 'Yes' : 'No'),
          booking.cancel_by || '',
          cancelDateTime.date,
          booking.notes || '',
          // New Payment/Finance fields
          p.id || p.financeId || '',
          p.type || 'Credit',
          p.paymentStatus || p.status || '',
          p.bookingCharge !== undefined ? formatCurrency(p.bookingCharge) : '',
          p.multiBookings ? 'Yes' : 'No',
          p.description || '',
          p.tripId || '',
          p.tripStatus || '',
          p.driverId || '',
          p.userId || '',
          p.paymentIntentId || '',
          p.offlinePaymentTime ? parseDateTime(p.offlinePaymentTime).date + ' ' + parseDateTime(p.offlinePaymentTime).time : ''
        ];
      });

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Elaborated_Finance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error during report export:', e);
    } finally {
      setExporting(false);
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-8 w-64 bg-slate-200 rounded-xl mb-10" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 text-slate-800 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Dashboard</h2>
          <p className="text-slate-500 font-medium mt-1">Monitor transactions and track revenue .</p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={payments.length === 0 || exporting}
          className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100 shrink-0"
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Compiling Report...' : 'Export Elaborated CSV'}
        </button>
      </div>

      <div className="space-y-10">
        {/* stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          <StatCard title="Total Revenue" value={`£${totalRevenue.toLocaleString('en-GB')}`} icon={PoundSterling} color="indigo" />
          <StatCard title="Confirmed" value={confirmed} icon={CheckCircle} color="emerald" />
          <StatCard title="Pending" value={pending} icon={Clock} color="amber" />
          <StatCard title="Cancelled" value={cancelled} icon={XCircle} color="rose" />
          <StatCard title="Online Payments" value={online} icon={RefreshCcw} color="blue" />
        </div>

        {/* <PaymentCharts
          revenueData={revenueChartData}
          methodData={methodDistributionData}
        /> */}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">All Transactions</h3>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[10px] font-black text-indigo-600 uppercase tracking-widest">
              Live Feed
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse ml-1" />
            </div>
          </div>

          <PaymentTable
            payments={payments}
            loading={loading}
            onView={(p) => { setSelectedPayment(p); setIsDetailsOpen(true); }}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            fromDate={fromDate}
            setFromDate={setFromDate}
            toDate={toDate}
            setToDate={setToDate}
            onClear={() => {
              setSearchTerm('');
              setStatusFilter('');
              setFromDate('');
              setToDate('');
            }}
          />

          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => fetchPayments(true)}
                disabled={loading}
                className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Synchronizing...' : 'Load More Payments'}
              </button>
            </div>
          )}
        </div>
      </div>

      <PaymentDetailsModal
        payment={selectedPayment}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </div>
  );
};

export default Payment;
