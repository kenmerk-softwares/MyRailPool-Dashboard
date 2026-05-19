import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, CheckCircle, Clock, XCircle, RefreshCcw, Download
} from 'lucide-react';
import { collection, getDocs, query, orderBy, where, Timestamp, limit, doc, getDoc, getAggregateFromServer, sum, getCountFromServer } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';
import { serialize } from '../../shared/utils/serialize';
import StatCard from './StatCard';
import PaymentTable from './PaymentTable';
import PaymentCharts from './PaymentCharts';
import PaymentDetailsModal from './PaymentDetailsModal';
import { revenueChartData, methodDistributionData } from '../../data/mockData';

// this component manages transactions and tracks revenue
// it uses live firestore queries for all search terms, status filters, and date filters

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

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const colRef = collection(db, 'finance');
      let docs = [];
      let currentTotalRevenue = 0;
      let newServerStats = { confirmed: 0, pending: 0, cancelled: 0, online: 0 };

      // if searching, run parallel queries for bookingId, tripId, and description
      if (searchTerm && searchTerm.trim() !== '') {
        const s = searchTerm.trim();
        const queryPromises = [];

        // bookingId prefix query
        let q1 = query(
          colRef,
          where("bookingId", ">=", s),
          where("bookingId", "<=", s + "\uf8ff"),
          limit(30)
        );
        if (statusFilter) {
          q1 = query(colRef, where("bookingId", ">=", s), where("bookingId", "<=", s + "\uf8ff"), where("status", "==", statusFilter), limit(30));
        }
        queryPromises.push(getDocs(q1));

        // tripId prefix query
        let q2 = query(
          colRef,
          where("tripId", ">=", s),
          where("tripId", "<=", s + "\uf8ff"),
          limit(30)
        );
        if (statusFilter) {
          q2 = query(colRef, where("tripId", ">=", s), where("tripId", "<=", s + "\uf8ff"), where("status", "==", statusFilter), limit(30));
        }
        queryPromises.push(getDocs(q2));

        // description prefix query
        let q3 = query(
          colRef,
          where("description", ">=", s),
          where("description", "<=", s + "\uf8ff"),
          limit(30)
        );
        if (statusFilter) {
          q3 = query(colRef, where("description", ">=", s), where("description", "<=", s + "\uf8ff"), where("status", "==", statusFilter), limit(30));
        }
        queryPromises.push(getDocs(q3));

        const snapshots = await Promise.all(queryPromises);

        const seen = new Set();
        snapshots.forEach((snap) => {
          snap.docs.forEach((d) => {
            if (!seen.has(d.id)) {
              const data = serialize({ id: d.id, ...d.data() });

              // filter date range client-side since firestore doesn't allow inequality range on different fields
              if (fromDate) {
                const fromTime = new Date(fromDate + 'T00:00:00').getTime();
                const createdTime = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : new Date(data.createdAt).getTime();
                if (createdTime < fromTime) return;
              }
              if (toDate) {
                const toTime = new Date(toDate + 'T23:59:59').getTime();
                const createdTime = data.createdAt?.toDate ? data.createdAt.toDate().getTime() : new Date(data.createdAt).getTime();
                if (createdTime > toTime) return;
              }

              seen.add(d.id);
              docs.push(data);
            }
          });
        });

        // sort results by date descending
        docs.sort((a, b) => {
          const timeA = a.createdAt?.toDate ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
          const timeB = b.createdAt?.toDate ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
          return timeB - timeA;
        });

        currentTotalRevenue = docs.reduce((s, p) => s + (Number(p.amount) || 0), 0);
        newServerStats = {
          confirmed: docs.filter(p => p.status === 'Confirmed').length,
          pending: docs.filter(p => p.status === 'Pending').length,
          cancelled: docs.filter(p => p.status === 'Cancelled').length,
          online: docs.filter(p => p.paymentType === 'online').length
        };

      } else {
        // BROWSE MODE — run single direct firestore query with compound filters
        const filterConstraints = [];
        const dateConstraints = [];

        if (statusFilter) {
          filterConstraints.push(where('status', '==', statusFilter));
        }
        if (fromDate) {
          const dFilter = where('createdAt', '>=', Timestamp.fromDate(new Date(fromDate + 'T00:00:00')));
          filterConstraints.push(dFilter);
          dateConstraints.push(dFilter);
        }
        if (toDate) {
          const dFilter = where('createdAt', '<=', Timestamp.fromDate(new Date(toDate + 'T23:59:59')));
          filterConstraints.push(dFilter);
          dateConstraints.push(dFilter);
        }

        const [snap, aggSnap, cSnap, pSnap, cxSnap, oSnap] = await Promise.all([
          getDocs(query(colRef, ...filterConstraints, orderBy('createdAt', 'desc'))),
          getAggregateFromServer(query(colRef, ...filterConstraints), { total: sum('amount') }),
          getCountFromServer(query(colRef, ...dateConstraints, where('status', '==', 'Confirmed'))),
          getCountFromServer(query(colRef, ...dateConstraints, where('status', '==', 'Pending'))),
          getCountFromServer(query(colRef, ...dateConstraints, where('status', '==', 'Cancelled'))),
          getCountFromServer(query(colRef, ...dateConstraints, where('paymentType', '==', 'online')))
        ]);
        
        docs = snap.docs.map(d => serialize({ id: d.id, ...d.data() }));
        currentTotalRevenue = aggSnap.data().total || 0;
        newServerStats = {
          confirmed: cSnap.data().count,
          pending: pSnap.data().count,
          cancelled: cxSnap.data().count,
          online: oSnap.data().count
        };
      }

      setPayments(docs);
      setServerTotalRevenue(currentTotalRevenue);
      setServerStats(newServerStats);
    } catch (e) {
      console.error('Error fetching finance:', e);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const totalRevenue = serverTotalRevenue;
  const confirmed = serverStats.confirmed;
  const pending = serverStats.pending;
  const cancelled = serverStats.cancelled;
  const online = serverStats.online;

  const handleExportCSV = async () => {
    if (payments.length === 0) return;
    setExporting(true);
    try {
      const uniqueBookingIds = Array.from(new Set(payments.map(p => p.bookingId).filter(Boolean)));
      const bookingSnaps = await Promise.all(
        uniqueBookingIds.map(id => getDoc(doc(db, 'bookings', id)))
      );

      const bookingMap = {};
      bookingSnaps.forEach(snap => {
        if (snap.exists()) {
          bookingMap[snap.id] = snap.data();
        }
      });

      const headers = [
        'Sl No', 'Finance ID', 'Booking ID', 'Trip ID', 'User ID', 'Driver ID',
        'Description', 'Amount', 'Transaction Type', 'Payment Method', 'Payment Status', 'Created At',
        'Route Name', 'Route Points', 'Travel Date', 'Trip Number', 'Driver Name',
        'Passenger Name', 'Passenger Phone', 'Passenger Start Point', 'Passenger Drop Point',
        'Seats Booked', 'Passenger Fare', 'Passenger Status'
      ];

      const rows = payments.map((p, idx) => {
        const booking = bookingMap[p.bookingId] || {};
        const matchedUser = booking.users?.find(
          u => String(u.userId || '').trim() === String(p.userId || '').trim()
        ) || {};

        return [
          idx + 1,
          p.financeId || '',
          p.bookingId || '',
          p.tripId || '',
          p.userId || '',
          p.driverId || '',
          p.description || '',
          p.amount || 0,
          p.type || '',
          p.paymentType || '',
          p.status || '',
          p.createdAt?.toDate ? p.createdAt.toDate().toLocaleString('en-IN') : String(p.createdAt || ''),
          booking.route_name || '',
          booking.route_start && booking.route_end ? `${booking.route_start} - ${booking.route_end}` : '',
          booking.selectedDate || '',
          booking.tripNo ? `#${booking.tripNo}` : '',
          booking.driver_name || '',
          matchedUser.name || '',
          matchedUser.phone || '',
          matchedUser.startingPoint || '',
          matchedUser.dropPoint || '',
          matchedUser.bookingCount || '',
          matchedUser.totalFare || '',
          matchedUser.status || ''
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
          <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} icon={DollarSign} color="indigo" />
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
