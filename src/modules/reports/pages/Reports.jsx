import React, { useEffect, useState, useMemo } from 'react';
import {
  FileText, TrendingUp, Calendar, Route as RouteIcon, Users,
  BarChart3, Car, RefreshCw, Download, Search, Printer,
  MapPin, Navigation, ArrowRight, ChevronDown, ChevronRight,
  CheckCircle2, AlertCircle, PoundSterling, Activity, AlertTriangle
} from 'lucide-react';
import { collection, getDocs, query, where, orderBy, getCountFromServer, getAggregateFromServer, sum } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { SectionHeader, StatCard } from '../../../components/Shared';
import { serialize } from '../../../shared/utils/serialize';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend
} from 'recharts';

const formatDateLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayString = () => formatDateLocal(new Date());

const getStartOfWeekString = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return formatDateLocal(new Date(d.setDate(diff)));
};

const getEndOfWeekString = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? 0 : 7);
  return formatDateLocal(new Date(d.setDate(diff)));
};

const getStartOfMonthString = () => {
  const d = new Date();
  return formatDateLocal(new Date(d.getFullYear(), d.getMonth(), 1));
};

const getEndOfMonthString = () => {
  const d = new Date();
  return formatDateLocal(new Date(d.getFullYear(), d.getMonth() + 1, 0));
};

export const Reports = () => {
  const [bookings, setBookings] = useState(() => {
    try {
      const cached = localStorage.getItem('reports_bookings_cache');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState(() => localStorage.getItem('reports_fromDate') || getTodayString());
  const [toDate, setToDate] = useState(() => localStorage.getItem('reports_toDate') || getTodayString());
  const [preset, setPreset] = useState(() => localStorage.getItem('reports_preset') || 'today');
  const [routeTypeFilter, setRouteTypeFilter] = useState(() => localStorage.getItem('reports_routeTypeFilter') || 'all');
  const [searchQuery, setSearchQuery] = useState(() => localStorage.getItem('reports_searchQuery') || '');
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('reports_activeTab') || 'overview');
  const [expandedRouteId, setExpandedRouteId] = useState(null);
  const [allTimeConfirmed, setAllTimeConfirmed] = useState(false);
  const [warning, setWarning] = useState(null);

  // Server stats state hooks
  const [serverCount, setServerCount] = useState(() => {
    return Number(localStorage.getItem('reports_serverCount') || 0);
  });
  const [serverCapacity, setServerCapacity] = useState(() => {
    return Number(localStorage.getItem('reports_serverCapacity') || 0);
  });

  // Sync state parameters to localStorage
  useEffect(() => {
    localStorage.setItem('reports_fromDate', fromDate);
  }, [fromDate]);

  useEffect(() => {
    localStorage.setItem('reports_toDate', toDate);
  }, [toDate]);

  useEffect(() => {
    localStorage.setItem('reports_preset', preset);
  }, [preset]);

  useEffect(() => {
    localStorage.setItem('reports_routeTypeFilter', routeTypeFilter);
  }, [routeTypeFilter]);

  useEffect(() => {
    localStorage.setItem('reports_searchQuery', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('reports_activeTab', activeTab);
  }, [activeTab]);

  // Pagination states for tables
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset pagination on filter or tab changes
  useEffect(() => {
    currentPage !== 1 && setCurrentPage(1);
  }, [searchQuery, fromDate, toDate, routeTypeFilter, activeTab]);

  // Fetch bookings from Firestore using active date range and route type filters
  const fetchAllBookings = async (forceAllTime = false) => {
    // If a specific range is selected (both fromDate and toDate are set), enforce max 3-month limit
    if (fromDate && toDate) {
      const start = new Date(fromDate);
      const end = new Date(toDate);
      const diffDays = Math.abs(end - start) / (1000 * 60 * 60 * 24);
      if (diffDays > 92) {
        setWarning({
          type: 'error_range',
          message: 'Error: Custom range searches are limited to 3 months (92 days) to prevent heavy database loads. Running wider queries will directly increase our Firebase read usage and monthly billing costs. Reverting filters to Today.'
        });
        setFromDate(getTodayString());
        setToDate(getTodayString());
        setPreset('today');
        setAllTimeConfirmed(false);
        return;
      }
    }

    // Alert confirmation for unconstrained searches (All Time)
    if (!fromDate && !toDate) {
      if (!allTimeConfirmed && !forceAllTime) {
        setWarning({
          type: 'confirm_all_time',
          message: 'Warning: Running a full historical scan reads every booking in the database. This causes heavy resource consumption and directly increases our Firebase monthly billing invoice. Please use predefined dates (Today, This Week, This Month) whenever possible.'
        });
        return;
      }
    }

    setLoading(true);
    try {
      const colRef = collection(db, "bookings");
      let constraints = [];

      // Query by date ranges if provided
      if (fromDate) {
        constraints.push(where("selectedDate", ">=", fromDate));
      }
      if (toDate) {
        constraints.push(where("selectedDate", "<=", toDate));
      }

      // Query by route type if filter is active
      if (routeTypeFilter !== 'all') {
        constraints.push(where("route_type", "==", routeTypeFilter));
      }

      // Order by selectedDate descending
      constraints.push(orderBy("selectedDate", "desc"));

      const q = query(colRef, ...constraints);

      // Perform direct server-side count query
      const countSnap = await getCountFromServer(q);
      const bookingCountVal = countSnap.data().count || 0;
      setServerCount(bookingCountVal);
      localStorage.setItem('reports_serverCount', String(bookingCountVal));

      // Perform direct server-side capacity aggregate query
      let seatingCapacityVal = 0;
      try {
        const capacitySnap = await getAggregateFromServer(q, {
          total: sum("totalSeats")
        });
        seatingCapacityVal = capacitySnap.data().total || 0;
        setServerCapacity(seatingCapacityVal);
        localStorage.setItem('reports_serverCapacity', String(seatingCapacityVal));
      } catch (err) {
        console.error("Capacity aggregation failed:", err);
      }

      const snap = await getDocs(q);
      const list = snap.docs.map(doc => serialize({ id: doc.id, ...doc.data() }));
      setBookings(list);
      localStorage.setItem('reports_bookings_cache', JSON.stringify(list));
    } catch (error) {
      console.error("Error querying bookings for reports:", error);
      // Fallback: if index is missing or there's an error, query all and let memory filter
      try {
        const snap = await getDocs(collection(db, "bookings"));
        let list = snap.docs.map(doc => serialize({ id: doc.id, ...doc.data() }));
        // Filter in memory if query failed
        if (fromDate) list = list.filter(b => b.selectedDate >= fromDate);
        if (toDate) list = list.filter(b => b.selectedDate <= toDate);
        if (routeTypeFilter !== 'all') list = list.filter(b => b.route_type === routeTypeFilter);
        list.sort((a, b) => (b.selectedDate || '').localeCompare(a.selectedDate || ''));

        const fallbackCount = list.length;
        const fallbackCapacity = list.reduce((sum, b) => sum + (Number(b.totalSeats) || 0), 0);

        setServerCount(fallbackCount);
        setServerCapacity(fallbackCapacity);
        localStorage.setItem('reports_serverCount', String(fallbackCount));
        localStorage.setItem('reports_serverCapacity', String(fallbackCapacity));

        setBookings(list);
        localStorage.setItem('reports_bookings_cache', JSON.stringify(list));
      } catch (fallbackError) {
        console.error("Fallback query failed:", fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllBookings();
  }, [fromDate, toDate, routeTypeFilter]);

  const handleConfirmAllTime = () => {
    setWarning(null);
    setAllTimeConfirmed(true);
    fetchAllBookings(true);
  };

  const handleCancelAllTime = () => {
    setWarning(null);
    setFromDate(getTodayString());
    setToDate(getTodayString());
    setPreset('today');
    setAllTimeConfirmed(false);
  };

  const applyPreset = (p) => {
    setPreset(p);
    setWarning(null); // Clear previous warnings
    if (p === 'today') {
      setFromDate(getTodayString());
      setToDate(getTodayString());
      setAllTimeConfirmed(false);
    } else if (p === 'week') {
      setFromDate(getStartOfWeekString());
      setToDate(getEndOfWeekString());
      setAllTimeConfirmed(false);
    } else if (p === 'month') {
      setFromDate(getStartOfMonthString());
      setToDate(getEndOfMonthString());
      setAllTimeConfirmed(false);
    } else if (p === 'all') {
      setFromDate('');
      setToDate('');
      setAllTimeConfirmed(false);
      setWarning({
        type: 'confirm_all_time',
        message: 'Warning: Running a full historical scan reads every booking in the database. This causes heavy resource consumption and directly increases our Firebase monthly billing invoice. Please use predefined dates (Today, This Week, This Month) whenever possible.'
      });
    }
  };

  const handleClearFilters = () => {
    setFromDate(getTodayString());
    setToDate(getTodayString());
    setPreset('today');
    setRouteTypeFilter('all');
    setSearchQuery('');
    setAllTimeConfirmed(false);
    setWarning(null);
  };

  // Format dates/timestamps for display
  const formatTs = (val) => {
    if (!val) return '—';
    if (typeof val === 'number') return new Date(val).toLocaleDateString('en-IN');
    if (val?.toDate) return val.toDate().toLocaleDateString('en-IN');
    return String(val);
  };

  // Filter bookings list based on search term
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Search Filter (by trip number, route name, driver, or vehicle)
      if (searchQuery.trim() !== '') {
        const queryStr = searchQuery.toLowerCase();
        const tripNoStr = String(b.tripNo || '');
        const routeName = (b.route_name || '').toLowerCase();
        const driverName = (b.driver_name || '').toLowerCase();
        const vehicleReg = (b.vehicle_reg || '').toLowerCase();

        const matches = tripNoStr.includes(queryStr) ||
          routeName.includes(queryStr) ||
          driverName.includes(queryStr) ||
          vehicleReg.includes(queryStr);
        if (!matches) return false;
      }

      return true;
    });
  }, [bookings, searchQuery]);

  // Compute overall totals for the top stats strip
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalBookingsCount = searchQuery.trim() === '' ? serverCount : filteredBookings.length;
    let totalPassengers = 0;
    let totalCapacity = searchQuery.trim() === '' ? serverCapacity : 0;

    filteredBookings.forEach(b => {
      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      // Revenue is sum of fares from non-cancelled users
      const bookingRev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      totalRevenue += bookingRev;

      // Passengers is sum of bookingCount from non-cancelled users
      const bookingPax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);
      totalPassengers += bookingPax;

      if (searchQuery.trim() !== '') {
        totalCapacity += Number(b.totalSeats) || 0;
      }
    });

    const loadFactor = totalCapacity > 0 ? ((totalPassengers / totalCapacity) * 100).toFixed(1) : 0;

    return {
      revenue: totalRevenue,
      bookings: totalBookingsCount,
      passengers: totalPassengers,
      capacity: totalCapacity,
      loadFactor: loadFactor
    };
  }, [filteredBookings, serverCount, serverCapacity, searchQuery]);

  // Aggregate revenue and passenger counts by date for timeline charts
  const timelineData = useMemo(() => {
    const dailyMap = {};
    filteredBookings.forEach(b => {
      const dateKey = b.selectedDate || 'Unknown Date';
      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      const rev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      const pax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, revenue: 0, passengers: 0, bookings: 0 };
      }
      dailyMap[dateKey].revenue += rev;
      dailyMap[dateKey].passengers += pax;
      dailyMap[dateKey].bookings += 1;
    });

    // Convert map to sorted array
    return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredBookings]);

  // Group and aggregate metrics by route corridor
  const routeData = useMemo(() => {
    const routeMap = {};
    filteredBookings.forEach(b => {
      const routeId = b.route_id || 'unassigned-route';
      const routeName = b.route_name || 'Unassigned Route';
      const routeType = b.route_type || 'flexi';
      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      const rev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      const pax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);
      const cap = Number(b.totalSeats) || 0;
      const tripNo = b.tripNo || b.tripId || '—';

      if (!routeMap[routeId]) {
        routeMap[routeId] = {
          routeId: routeId,
          routeName: routeName,
          routeType: routeType,
          tripsRun: 0,
          associatedTrips: new Set(),
          passengers: 0,
          capacity: 0,
          revenue: 0,
          tripDetails: []
        };
      }

      routeMap[routeId].tripsRun += 1;
      routeMap[routeId].associatedTrips.add(tripNo);
      routeMap[routeId].passengers += pax;
      routeMap[routeId].capacity += cap;
      routeMap[routeId].revenue += rev;
      routeMap[routeId].tripDetails.push({
        tripNo: tripNo,
        date: b.selectedDate,
        driver: b.driver_name || '—',
        vehicle: b.vehicle_reg || '—',
        passengers: pax,
        capacity: cap,
        revenue: rev
      });
    });

    return Object.values(routeMap).map(r => ({
      ...r,
      associatedTripsList: Array.from(r.associatedTrips),
      occupancyRate: r.capacity > 0 ? ((r.passengers / r.capacity) * 100).toFixed(1) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  }, [filteredBookings]);

  // Format individual trip data points for registry table
  const tripData = useMemo(() => {
    return filteredBookings.map(b => {
      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      const rev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      const pax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);
      const cap = Number(b.totalSeats) || 0;

      return {
        id: b.id,
        tripNo: b.tripNo || '—',
        tripId: b.tripId || '—',
        routeName: b.route_name || '—',
        routeId: b.route_id || '—',
        routeType: b.route_type || 'flexi',
        date: b.selectedDate || '—',
        driver: b.driver_name || '—',
        vehicle: b.vehicle_reg || '—',
        passengers: pax,
        capacity: cap,
        occupancyRate: cap > 0 ? ((pax / cap) * 100).toFixed(1) : 0,
        revenue: rev,
        status: b.status || 'Active'
      };
    });
  }, [filteredBookings]);

  // Group data by service type (core vs. flexi)
  const routeTypeData = useMemo(() => {
    const typeMap = {
      core: { name: 'Core Service', trips: 0, passengers: 0, capacity: 0, revenue: 0 },
      flexi: { name: 'Flexi / On-Demand', trips: 0, passengers: 0, capacity: 0, revenue: 0 }
    };

    filteredBookings.forEach(b => {
      const rawType = (b.route_type || 'flexi').toLowerCase();
      const typeKey = rawType.includes('flexi') ? 'flexi' : 'core';

      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      const rev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      const pax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);
      const cap = Number(b.totalSeats) || 0;

      typeMap[typeKey].trips += 1;
      typeMap[typeKey].passengers += pax;
      typeMap[typeKey].capacity += cap;
      typeMap[typeKey].revenue += rev;
    });

    return Object.keys(typeMap).map(key => ({
      type: key,
      ...typeMap[key],
      occupancyRate: typeMap[key].capacity > 0 ? ((typeMap[key].passengers / typeMap[key].capacity) * 100).toFixed(1) : 0
    }));
  }, [filteredBookings]);

  // Compute performance metrics for drivers and vehicles
  const resourceData = useMemo(() => {
    const driverMap = {};
    const vehicleMap = {};

    filteredBookings.forEach(b => {
      const driverId = b.driver_id || 'unassigned-driver';
      const driverName = b.driver_name || 'Unassigned Driver';
      const vehicleId = b.vehicle_id || 'unassigned-vehicle';
      const vehicleReg = b.vehicle_reg || 'Unassigned Vehicle';

      const users = b.users || [];
      const confirmedUsers = users.filter(u => u.status !== 'Cancelled');

      const rev = confirmedUsers.reduce((sum, u) => sum + (Number(u.totalFare) || 0), 0);
      const pax = confirmedUsers.reduce((sum, u) => sum + (Number(u.bookingCount) || 1), 0);
      const cap = Number(b.totalSeats) || 0;

      // Driver
      if (!driverMap[driverId]) {
        driverMap[driverId] = { driverId, name: driverName, trips: 0, passengers: 0, revenue: 0 };
      }
      driverMap[driverId].trips += 1;
      driverMap[driverId].passengers += pax;
      driverMap[driverId].revenue += rev;

      // Vehicle
      if (!vehicleMap[vehicleId]) {
        vehicleMap[vehicleId] = { vehicleId, registration: vehicleReg, trips: 0, passengers: 0, capacity: 0, revenue: 0 };
      }
      vehicleMap[vehicleId].trips += 1;
      vehicleMap[vehicleId].passengers += pax;
      vehicleMap[vehicleId].capacity += cap;
      vehicleMap[vehicleId].revenue += rev;
    });

    const driversList = Object.values(driverMap).sort((a, b) => b.revenue - a.revenue);
    const vehiclesList = Object.values(vehicleMap).map(v => ({
      ...v,
      occupancyRate: v.capacity > 0 ? ((v.passengers / v.capacity) * 100).toFixed(1) : 0
    })).sort((a, b) => b.trips - a.trips);

    return { drivers: driversList, vehicles: vehiclesList };
  }, [filteredBookings]);


  // Export tabulated data to CSV format
  const handleCSVExport = (type) => {
    if (type === 'routes') {
      const headers = ['routeId', 'routeName', 'routeType', 'tripsRun', 'associatedTripsList', 'passengers', 'occupancyRate', 'revenue'];
      const labels = ['Route ID', 'Route Name', 'Route Type', 'Total Trips', 'Associated Trips', 'Total Passengers', 'Avg Occupancy (%)', 'Total Revenue (£)'];
      exportToCSV(routeData, 'Route_Booking_Analysis', headers, labels);
    } else if (type === 'trips') {
      const headers = ['tripNo', 'routeName', 'routeId', 'routeType', 'date', 'driver', 'vehicle', 'passengers', 'capacity', 'occupancyRate', 'revenue', 'status'];
      const labels = ['Trip No', 'Route Name', 'Route ID', 'Route Type', 'Travel Date', 'Driver', 'Vehicle Registration', 'Booked Seats', 'Seating Capacity', 'Occupancy (%)', 'Revenue (£)', 'Operational Status'];
      exportToCSV(tripData, 'Trip_Booking_Analysis', headers, labels);
    } else if (type === 'routeTypes') {
      const headers = ['name', 'trips', 'passengers', 'occupancyRate', 'revenue'];
      const labels = ['Route Service Type', 'Total Trips Run', 'Total Passengers Transported', 'Average Occupancy (%)', 'Total Revenue (£)'];
      exportToCSV(routeTypeData, 'Route_Type_Booking_Analysis', headers, labels);
    } else if (type === 'drivers') {
      const headers = ['name', 'driverId', 'trips', 'passengers', 'revenue'];
      const labels = ['Driver Name', 'Driver ID', 'Trips Completed', 'Passengers Carried', 'Revenue Generated (£)'];
      exportToCSV(resourceData.drivers, 'Driver_Performance_Report', headers, labels);
    } else if (type === 'vehicles') {
      const headers = ['registration', 'vehicleId', 'trips', 'occupancyRate', 'revenue'];
      const labels = ['Vehicle Registration', 'Vehicle ID', 'Trips Run', 'Average Occupancy (%)', 'Revenue Generated (£)'];
      exportToCSV(resourceData.vehicles, 'Vehicle_Utilization_Report', headers, labels);
    } else if (type === 'overview') {
      const headers = ['date', 'bookings', 'passengers', 'revenue'];
      const labels = ['Date', 'Total Bookings', 'Total Passengers', 'Daily Revenue (£)'];
      exportToCSV(timelineData, 'Overall_Daily_Trends', headers, labels);
    }
  };

  const exportToCSV = (data, filename, headers, headerLabels = headers) => {
    const csvRows = [];
    csvRows.push(headerLabels.join(","));

    data.forEach(row => {
      const values = headers.map(header => {
        let val = row[header] !== undefined ? row[header] : '';
        if (Array.isArray(val)) {
          val = val.join('; ');
        }
        const stringVal = String(val);
        const escaped = stringVal.replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Recharts color palettes
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

  // Table pagination selectors
  const paginatedRoutes = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return routeData.slice(offset, offset + itemsPerPage);
  }, [routeData, currentPage]);

  const paginatedTrips = useMemo(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    return tripData.slice(offset, offset + itemsPerPage);
  }, [tripData, currentPage]);

  const totalPages = useMemo(() => {
    const currentListLength = activeTab === 'routes' ? routeData.length : tripData.length;
    return Math.ceil(currentListLength / itemsPerPage) || 1;
  }, [activeTab, routeData, tripData]);

  return (
    <div className="w-full max-w-full mx-auto pb-12 px-2 animate-in fade-in slide-in-from-bottom-4 duration-700 font-jakarta print:bg-white print:p-0">

      {/* Main header and actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 md:mb-8 gap-4 sm:gap-0 print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary-600" /> Bookings & Route Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            View booking performance, passenger statistics, route details, and resource utilization.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {loading && bookings.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] text-slate-500 font-bold animate-pulse shadow-sm">
              <RefreshCw className="w-3 h-3 text-primary-500 animate-spin" />
              <span>Updating...</span>
            </div>
          )}
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-colors bg-white shadow-sm"
          >
            <Printer className="w-4 h-4" /> Print PDF
          </button>
          <button
            onClick={() => handleCSVExport(activeTab)}
            className="px-4 py-2 bg-primary-600 text-white hover:bg-primary-700 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-2 transition-all shadow-md shadow-primary-600/10 active:scale-95"
          >
            <Download className="w-4 h-4" /> Export Tab Data
          </button>
        </div>
      </div>

      {/* PDF print-only header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-black text-slate-900 uppercase">MyRailPool Analytics Report</h1>
        <p className="text-sm text-slate-500 mt-1">Generated on: {new Date().toLocaleDateString('en-GB')} at {new Date().toLocaleTimeString('en-GB')}</p>
        {fromDate || toDate ? (
          <p className="text-sm font-bold text-indigo-700 mt-2">Filter Interval: {fromDate || 'Start'} to {toDate || 'End'}</p>
        ) : null}
      </div>

      {/* Filters section */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm mb-6 print:hidden">
        {/* Date presets pills */}
        <div className="flex flex-wrap gap-2 mb-4 pb-4 border-b border-slate-100 items-center justify-between">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/40">
            {[
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'all', label: 'All Time' },
            ].map(p => (
              <button
                key={p.id}
                onClick={() => applyPreset(p.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${preset === p.id
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Custom Range Active
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">

          {/* Date from */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Travel From Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={fromDate}
                onChange={(e) => { setFromDate(e.target.value); setPreset('custom'); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs"
              />
            </div>
          </div>

          {/* Date to */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Travel To Date</label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={toDate}
                onChange={(e) => { setToDate(e.target.value); setPreset('custom'); }}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all text-xs"
              />
            </div>
          </div>

          {/* Route type */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Route Service Type</label>
            <select
              value={routeTypeFilter}
              onChange={(e) => setRouteTypeFilter(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer text-xs"
            >
              <option value="all">All Service Types</option>
              {/* <option value="core">Core Service</option> */}
              <option value="flexi">Flexi / On-Demand</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="flex gap-2">
            <button
              onClick={handleClearFilters}
              className="flex-1 py-2 px-4 border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
            >
              Reset Filters
            </button>
            <button
              onClick={fetchAllBookings}
              disabled={loading}
              className="py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

        </div>

        {/* Warning notification banner */}
        {warning && (
          <div className={`mt-4 p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${warning.type === 'error_range'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
            <div className="flex items-start gap-2.5">
              <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${warning.type === 'error_range' ? 'text-rose-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-[11px] font-bold tracking-wide uppercase mb-0.5">{warning.type === 'error_range' ? 'Date Limit Reached' : 'Historical Data Scan'}</p>
                <p className="text-xs font-semibold leading-relaxed">{warning.message}</p>
              </div>
            </div>
            {warning.type === 'confirm_all_time' ? (
              <div className="flex gap-2 self-end sm:self-center">
                <button
                  onClick={handleConfirmAllTime}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95"
                >
                  Proceed
                </button>
                <button
                  onClick={handleCancelAllTime}
                  className="px-3 py-1.5 bg-white border border-amber-200 hover:bg-amber-100 text-amber-800 text-xs font-bold rounded-lg transition-colors active:scale-95"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setWarning(null)}
                className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-100 text-rose-850 text-xs font-bold rounded-lg transition-colors self-end sm:self-center active:scale-95"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Search input (full width below inputs) */}
        <div className="mt-4 pt-4 border-t border-slate-100 relative">
          <Search className="absolute left-3.5 top-[26px] w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by route, driver, vehicle, trip number, etc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium focus:border-indigo-500 outline-none transition-all text-xs"
          />
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <StatCard
          title="Aggregated Revenue"
          value={
            loading && bookings.length === 0 ? (
              <span className="inline-block w-24 h-8 bg-slate-100 animate-pulse rounded-md mt-1"></span>
            ) : (
              <span className={loading ? 'animate-pulse text-slate-500' : ''}>
                £{(stats.revenue || 0).toLocaleString('en-GB')}
              </span>
            )
          }
          icon={PoundSterling}
          trend="Live"
          trendUp={true}
          trendLabel="interval total"
        />
        <StatCard
          title="Total Bookings"
          value={
            loading && bookings.length === 0 ? (
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-md mt-1"></span>
            ) : (
              <span className={loading ? 'animate-pulse text-slate-500' : ''}>
                {stats.bookings}
              </span>
            )
          }
          icon={FileText}
          trend="Live"
          trendUp={true}
          trendLabel="interval total"
        />
        <StatCard
          title="Confirmed Passengers"
          value={
            loading && bookings.length === 0 ? (
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-md mt-1"></span>
            ) : (
              <span className={loading ? 'animate-pulse text-slate-500' : ''}>
                {stats.passengers}
              </span>
            )
          }
          icon={Users}
          trend="Live"
          trendUp={true}
          trendLabel="interval total"
        />
        <StatCard
          title="Total Fleet Seats"
          value={
            loading && bookings.length === 0 ? (
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-md mt-1"></span>
            ) : (
              <span className={loading ? 'animate-pulse text-slate-500' : ''}>
                {stats.capacity}
              </span>
            )
          }
          icon={Car}
          trend="Live"
          trendUp={true}
          trendLabel="interval total"
        />
        <StatCard
          title="Average Occupancy"
          value={
            loading && bookings.length === 0 ? (
              <span className="inline-block w-16 h-8 bg-slate-100 animate-pulse rounded-md mt-1"></span>
            ) : (
              <span className={loading ? 'animate-pulse text-slate-500' : ''}>
                {stats.loadFactor}%
              </span>
            )
          }
          icon={BarChart3}
          trend="Load"
          trendUp={Number(stats.loadFactor) > 50}
          trendLabel="capacity filled"
        />
      </div>

      {/* Tab bar navigation */}
      <div className="flex border-b border-slate-200 mb-6 overflow-x-auto gap-2 scrollbar-hide print:hidden">
        {[
          { id: 'overview', label: 'Timeline & Trends', icon: TrendingUp },
          { id: 'routes', label: 'Route Analysis', icon: RouteIcon },
          { id: 'trips', label: 'Trip Analysis', icon: Activity },
          { id: 'resources', label: 'Resource Utilization', icon: Car }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3.5 border-b-2 font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap ${activeTab === tab.id
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-slate-500 hover:text-slate-600 hover:border-slate-300'
              }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loader state */}
      {loading && bookings.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-24 text-center flex flex-col items-center justify-center gap-4 min-h-[40vh] shadow-sm">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary-500 border-t-transparent"></div>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Loading analytics data...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-20 text-center flex flex-col items-center justify-center gap-3 min-h-[40vh] shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 border border-slate-100 mb-2">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Data Matches Filter</h3>
          <p className="text-slate-500 text-xs max-w-sm">No records match your selected date boundaries, route types, or search queries.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="space-y-6">

          {/* TAB 1: OVERVIEW & DAILY TRENDS */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 gap-6">
              {/* Timeline Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Timeline */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <PoundSterling className="w-4 h-4 text-emerald-600" /> Revenue Over Time
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timelineData}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickFormatter={(v) => `£${v}`} />
                        <Tooltip formatter={(value) => [`£${value.toLocaleString()}`, 'Revenue']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Booking & Passenger Volume */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" /> Bookings & Passengers
                  </h3>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                        <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={3} name="Total Bookings" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="passengers" stroke="#6366f1" strokeWidth={3} name="Total Passengers" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Daily Trends</h3>
                  <span className="text-xs text-slate-500 font-bold">Showing {timelineData.length} days</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Travel Date</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Bookings</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Passengers Transported</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {timelineData.slice().reverse().map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                          <td className="px-6 py-4 text-xs font-bold text-slate-700">{row.date}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-600 text-center">{row.bookings}</td>
                          <td className="px-6 py-4 text-xs font-black text-indigo-600 text-center">{row.passengers}</td>
                          <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">£{row.revenue.toLocaleString('en-GB')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROUTE-BASED BOOKING ANALYSIS */}
          {activeTab === 'routes' && (
            <div className="grid grid-cols-1 gap-6">

              {/* Route Summary Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Revenue Contribution by Corridor</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={routeData.slice(0, 10)} layout="vertical" margin={{ left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={10} fontWeight="bold" tickFormatter={(v) => `£${v}`} />
                      <YAxis type="category" dataKey="routeName" stroke="#94a3b8" fontSize={10} fontWeight="bold" width={120} />
                      <Tooltip formatter={(v) => `£${v.toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Bar dataKey="revenue" fill="#6366f1" radius={[0, 8, 8, 0]} maxBarSize={30}>
                        {routeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Grouped Routes Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Route Performance</h3>
                  <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-bold uppercase">Route List</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="w-8 px-6 py-3.5"></th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Route Corridor</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Service Type</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Departures Run</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Passengers carried</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Occupancy Rate</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue Generated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRoutes.map((route, idx) => {
                        const isExpanded = expandedRouteId === route.routeId;
                        return (
                          <React.Fragment key={route.routeId}>
                            <tr className="hover:bg-slate-50/20 transition-colors">
                              {/* Expand toggle */}
                              <td className="px-6 py-4">
                                <button
                                  onClick={() => setExpandedRouteId(isExpanded ? null : route.routeId)}
                                  className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                </button>
                              </td>

                              {/* Route Corridor */}
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-extrabold text-slate-800">{route.routeName}</span>
                                </div>
                              </td>

                              {/* Service Type */}
                              <td className="px-6 py-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${route.routeType === 'core'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                  }`}>
                                  {route.routeType}
                                </span>
                              </td>

                              {/* Departures Run */}
                              <td className="px-6 py-4 text-xs font-bold text-slate-700 text-center">{route.tripsRun}</td>

                              {/* Passengers */}
                              <td className="px-6 py-4 text-xs font-bold text-slate-700 text-center">{route.passengers}</td>

                              {/* Occupancy */}
                              <td className="px-6 py-4 text-center">
                                <div className="flex flex-col items-center gap-1">
                                  <span className="text-xs font-black text-indigo-600">{route.occupancyRate}%</span>
                                  <div className="w-20 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-indigo-600 h-1.5" style={{ width: `${Math.min(route.occupancyRate, 100)}%` }}></div>
                                  </div>
                                </div>
                              </td>

                              {/* Revenue */}
                              <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">
                                £{route.revenue.toLocaleString('en-GB')}
                              </td>
                            </tr>

                            {/* Expanded Trips Drawer */}
                            {isExpanded && (
                              <tr className="bg-slate-50/40">
                                <td colSpan={7} className="px-8 py-5 border-y border-slate-100">
                                  <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-inner">
                                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                      <Activity className="w-3.5 h-3.5 text-indigo-500" /> Associated Trip Details
                                    </h4>
                                    <table className="w-full text-left text-xs border-collapse">
                                      <thead>
                                        <tr className="border-b border-slate-100 text-slate-500">
                                          <th className="pb-2 font-bold uppercase text-[9px]">Trip No</th>
                                          <th className="pb-2 font-bold uppercase text-[9px]">Travel Date</th>
                                          <th className="pb-2 font-bold uppercase text-[9px]">Driver Assigned</th>
                                          <th className="pb-2 font-bold uppercase text-[9px]">Vehicle</th>
                                          <th className="pb-2 font-bold uppercase text-[9px] text-center">Passengers</th>
                                          <th className="pb-2 font-bold uppercase text-[9px] text-center">Occupancy</th>
                                          <th className="pb-2 font-bold uppercase text-[9px] text-right">Trip Revenue</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50 text-slate-700">
                                        {route.tripDetails.map((trip, tIdx) => (
                                          <tr key={tIdx} className="hover:bg-slate-50/20">
                                            <td className="py-2.5">
                                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                                                #{trip.tripNo}
                                              </span>
                                            </td>
                                            <td className="py-2.5 font-bold">{trip.date}</td>
                                            <td className="py-2.5 font-semibold text-slate-600">{trip.driver}</td>
                                            <td className="py-2.5 font-mono text-[10px]">{trip.vehicle}</td>
                                            <td className="py-2.5 text-center font-bold">{trip.passengers}</td>
                                            <td className="py-2.5 text-center font-bold text-indigo-600">
                                              {trip.capacity > 0 ? ((trip.passengers / trip.capacity) * 100).toFixed(0) : 0}%
                                            </td>
                                            <td className="py-2.5 text-right font-black text-emerald-600">
                                              £{trip.revenue.toLocaleString('en-GB')}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between print:hidden">
                    <span className="text-xs font-bold text-slate-500">
                      Showing Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TRIP-BASED BOOKING ANALYSIS */}
          {activeTab === 'trips' && (
            <div className="grid grid-cols-1 gap-6">

              {/* Trip Capacity Load Chart */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider">Trip Occupancy Performance</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={tripData.slice(0, 15)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="tripNo" stroke="#94a3b8" fontSize={9} fontWeight="bold" tickFormatter={(v) => `#${v}`} />
                      <YAxis stroke="#94a3b8" fontSize={10} fontWeight="bold" tickFormatter={(v) => `${v}%`} />
                      <Tooltip formatter={(v) => [`${v}%`, 'Occupancy']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                      <Bar dataKey="occupancyRate" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={35}>
                        {tripData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Number(entry.occupancyRate) > 75 ? '#10b981' : Number(entry.occupancyRate) > 40 ? '#8b5cf6' : '#f59e0b'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Detailed Trips Registry Grid */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Trip Operations</h3>
                  <span className="text-[10px] bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 font-bold uppercase">Trip List</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100">
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Trip No</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Travel Date</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Route corridor</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Pax Booked</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Occupancy Rate</th>
                        <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedTrips.map((trip, idx) => (
                        <tr key={trip.id} className="hover:bg-slate-50/30 transition-colors">

                          {/* Trip No */}
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-[11px] border border-primary-100">
                              #{trip.tripNo}
                            </span>
                          </td>

                          {/* Travel Date */}
                          <td className="px-6 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{trip.date}</td>

                          {/* Route Name */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">{trip.routeName}</span>
                            </div>
                          </td>

                          {/* Driver */}
                          <td className="px-6 py-4 text-xs font-bold text-slate-700 whitespace-nowrap">{trip.driver}</td>

                          {/* Vehicle */}
                          <td className="px-6 py-4 text-xs font-mono font-bold text-slate-500 whitespace-nowrap">{trip.vehicle}</td>

                          {/* Pax Booked */}
                          <td className="px-6 py-4 text-center">
                            <span className="text-xs font-bold text-slate-800">{trip.passengers}</span>
                            <span className="text-slate-500 mx-0.5">/</span>
                            <span className="text-xs font-medium text-slate-500">{trip.capacity}</span>
                          </td>

                          {/* Occupancy Rate */}
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${Number(trip.occupancyRate) > 75
                              ? 'bg-emerald-50 text-emerald-700'
                              : Number(trip.occupancyRate) > 35
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'bg-amber-50 text-amber-700'
                              }`}>
                              {trip.occupancyRate}%
                            </span>
                          </td>

                          {/* Revenue */}
                          <td className="px-6 py-4 text-xs font-black text-emerald-600 text-right">
                            £{trip.revenue.toLocaleString('en-GB')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between print:hidden">
                    <span className="text-xs font-bold text-slate-500">
                      Showing Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ROUTE TYPE INSIGHTS */}
          {/* {activeTab === 'routeTypes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-wider">Revenue Breakdown</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Core vs. Flexi Revenue Share</p>
                </div>
                <div className="h-60 w-full my-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={routeTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="revenue"
                      >
                        {routeTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `£${v.toLocaleString()}`} />
                      <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Highest Earning</span>
                  <p className="text-sm font-black text-slate-800 mt-0.5">
                    {routeTypeData[0]?.revenue >= routeTypeData[1]?.revenue ? 'Core Services' : 'Flexi Services'}
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm lg:col-span-2 flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Service Type Revenue</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Type Name</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Trips Run</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Total Passengers</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Occupancy Rate</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {routeTypeData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                {row.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">{row.trips}</td>
                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">{row.passengers}</td>
                            <td className="px-6 py-4 text-center text-xs font-extrabold text-indigo-600">{row.occupancyRate}%</td>
                            <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">£{row.revenue.toLocaleString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.15em] mb-2">Service Classifications</h4>
                  <ul className="text-slate-500 text-xs space-y-1.5 list-disc pl-4 leading-relaxed font-semibold">
                    <li><strong className="text-slate-700">Core Service:</strong> Structured routes scheduled regularly.</li>
                    <li><strong className="text-slate-700">Flexi / On-Demand:</strong> Adaptive routes dispatched based on demand.</li>
                  </ul>
                </div>
              </div>

            </div>
          )} */}

          {/* TAB 5: RESOURCE PERFORMANCE (DRIVERS & VEHICLES) */}
          {activeTab === 'resources' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Driver Performance Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-500" /> Driver Performance
                    </h3>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-black uppercase">Sorted by Revenue</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver Name</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Trips Run</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Passengers Carried</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue Generated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resourceData.drivers.map((driver, idx) => (
                          <tr key={driver.driverId} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-extrabold text-slate-800">{driver.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">{driver.trips}</td>
                            <td className="px-6 py-4 text-center text-xs font-bold text-slate-700">{driver.passengers}</td>
                            <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">£{driver.revenue.toLocaleString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/30 border-t text-center text-[11px] font-bold text-slate-500">
                  Showing {resourceData.drivers.length} drivers
                </div>
              </div>

              {/* Vehicle Performance Table */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
                <div>
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary-500" /> Vehicle Utilization
                    </h3>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded font-black uppercase">Sorted by Trips</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">Vehicle Reg</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Trips Run</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Occupancy</th>
                          <th className="px-6 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Revenue</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {resourceData.vehicles.map((veh, idx) => (
                          <tr key={veh.vehicleId} className="hover:bg-slate-50/30 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-mono font-extrabold text-indigo-700">{veh.registration}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center text-xs font-semibold text-slate-700">{veh.trips}</td>
                            <td className="px-6 py-4 text-center">
                              <span className="text-xs font-black text-indigo-600">{veh.occupancyRate}%</span>
                            </td>
                            <td className="px-6 py-4 text-right text-xs font-black text-emerald-600">£{veh.revenue.toLocaleString('en-GB')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="p-4 bg-slate-50/30 border-t text-center text-[11px] font-bold text-slate-500">
                  Showing {resourceData.vehicles.length} vehicles
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* PDF print-only footer */}
      <div className="hidden print:block border-t mt-12 pt-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} MyRailPool Operations. All rights reserved. Operations Analytics Summary.
      </div>
    </div>
  );
};
