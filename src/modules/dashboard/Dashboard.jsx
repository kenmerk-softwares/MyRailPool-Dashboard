import React, { useEffect, useState } from 'react';
import { CalendarCheck, MapIcon, Users, Eye, Route, Car, UserCheck, DollarSign, TrendingUp } from 'lucide-react';
import { SectionHeader, StatCard, Activity } from '../../components/Shared';
import { useNavigate } from 'react-router-dom';
import { Table } from '../../shared/Table/Table';
import { useBookings } from '../bookings/hooks/booking.useBookings';
import { collection, getCountFromServer, getAggregateFromServer, sum, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const monthsList = [
    { value: '01', name: 'January' },
    { value: '02', name: 'February' },
    { value: '03', name: 'March' },
    { value: '04', name: 'April' },
    { value: '05', name: 'May' },
    { value: '06', name: 'June' },
    { value: '07', name: 'July' },
    { value: '08', name: 'August' },
    { value: '09', name: 'September' },
    { value: '10', name: 'October' },
    { value: '11', name: 'November' },
    { value: '12', name: 'December' }
];

const formatAndSortAnalytics = (docs, timeframe, selectedMonth, selectedYear) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if (timeframe === 'daily') {
        const filteredDocs = docs.filter(d => d.month === selectedMonth && d.year === selectedYear);

        return filteredDocs.sort((a, b) => {
            const partsA = a.id.split('-');
            const partsB = b.id.split('-');
            const wA = Number(partsA[2] || 0);
            const wB = Number(partsB[2] || 0);
            if (wA !== wB) return wA - wB;

            const dA = Number(a.day || 0);
            const dB = Number(b.day || 0);
            return dA - dB;
        }).map(d => {
            const parts = d.id.split('-');
            const weekOfMonth = parts[2] || d.week;
            const dayName = daysOfWeek[d.day] || `Day ${d.day}`;
            return {
                ...d,
                label: `${dayName} (Wk ${weekOfMonth})`,
                amount: d.amount || 0,
                noOfTrips: d.noOfTrips || 0,
                passengerCount: d.passengerCount || 0
            };
        });
    }

    if (timeframe === 'weekly') {
        const filteredDocs = docs.filter(d => d.month === selectedMonth && d.year === selectedYear);

        return filteredDocs.sort((a, b) => {
            const partsA = a.id.split('-');
            const partsB = b.id.split('-');
            const wA = Number(partsA[2] || 0);
            const wB = Number(partsB[2] || 0);
            return wA - wB;
        }).map(w => {
            const parts = w.id.split('-');
            const weekOfMonth = parts[2] || w.week;
            return {
                ...w,
                label: `Week ${weekOfMonth}`,
                amount: w.amount || 0,
                noOfTrips: w.noOfTrips || 0,
                passengerCount: w.passengerCount || 0
            };
        });
    }

    if (timeframe === 'monthly') {
        return docs.sort((a, b) => {
            const yA = Number(a.year || 0);
            const yB = Number(b.year || 0);
            if (yA !== yB) return yA - yB;

            const mA = Number(a.month || 0);
            const mB = Number(b.month || 0);
            return mA - mB;
        }).map(m => {
            const monthName = months[Number(m.month) - 1] || m.month;
            return {
                ...m,
                label: `${monthName} ${m.year}`,
                amount: m.amount || 0,
                noOfTrips: m.noOfTrips || 0,
                passengerCount: m.passengerCount || 0
            };
        });
    }

    if (timeframe === 'yearly') {
        return docs.sort((a, b) => {
            const yA = Number(a.year || a.id || 0);
            const yB = Number(b.year || b.id || 0);
            return yA - yB;
        }).map(y => {
            const yearStr = y.year || y.id;
            return {
                ...y,
                label: `${yearStr}`,
                amount: y.amount || 0,
                noOfTrips: y.noOfTrips || 0,
                passengerCount: y.passengerCount || 0
            };
        });
    }

    return docs;
};

const formatAnalytics = (docs, timeframe) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return docs.map(d => {
        let label = '';
        if (timeframe === 'daily') {
            const parts = d.id.split('-');
            const weekOfMonth = parts[2] || d.week;
            const dayName = daysOfWeek[d.day] || `Day ${d.day}`;
            label = `${dayName} (Wk ${weekOfMonth})`;
        } else if (timeframe === 'weekly') {
            const parts = d.id.split('-');
            const weekOfMonth = parts[2] || d.week;
            label = `Week ${weekOfMonth}`;
        } else if (timeframe === 'monthly') {
            const monthName = months[Number(d.month) - 1] || d.month;
            label = `${monthName} ${d.year}`;
        } else if (timeframe === 'yearly') {
            const yearStr = d.year || d.id;
            label = `${yearStr}`;
        }

        return {
            ...d,
            label,
            amount: d.amount || 0,
            noOfTrips: d.noOfTrips || 0,
            passengerCount: d.passengerCount || 0
        };
    });
};

const CustomTooltip = ({ active, payload, label, metric }) => {
    if (active && payload && payload.length) {
        const value = payload[0].value;
        const formattedValue = metric === 'amount'
            ? `₹${value.toLocaleString('en-IN')}`
            : value.toLocaleString();

        const metricName = metric === 'amount' ? 'Revenue' : metric === 'noOfTrips' ? 'Trips' : 'Passengers';

        return (
            <div className="bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl text-white text-[12px] font-bold">
                <p className="text-slate-400 font-semibold mb-1">{label}</p>
                <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${metric === 'amount' ? 'bg-indigo-400' : metric === 'noOfTrips' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}></span>
                    <span>{metricName}: <span className="font-extrabold">{formattedValue}</span></span>
                </div>
            </div>
        );
    }
    return null;
};

export const Dashboard = () => {
    const { bookings, loading, hasMore, fetchBookings } = useBookings();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = React.useState('');
    const [activeFilter, setActiveFilter] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');
    const [statsLoading, setStatsLoading] = useState(true);

    const [stats, setStats] = useState({
        bookings: 0,
        trips: 0,
        drivers: 0,
        routes: 0,
        vehicles: 0,
        admins: 0,
        revenue: 0
    });

    // Analytics state
    const [timeframe, setTimeframe] = useState('monthly');
    const [metric, setMetric] = useState('amount');
    const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, '0'));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [analyticsData, setAnalyticsData] = useState([]);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);

    useEffect(() => {
        fetchBookings({ searchQuery, activeFilter, fromDate, toDate });
    }, [searchQuery, activeFilter, fromDate, toDate, fetchBookings]);

    useEffect(() => {
        const fetchStats = async () => {
            setStatsLoading(true);
            try {
                // Bookings Count
                const bookingsSnap = await getCountFromServer(collection(db, 'bookings'));
                const bookingsCount = bookingsSnap.data().count;

                // Trips Count
                const tripsSnap = await getCountFromServer(collection(db, 'trips'));
                const tripsCount = tripsSnap.data().count;

                // Drivers Count
                const driversSnap = await getCountFromServer(collection(db, 'drivers'));
                const driversCount = driversSnap.data().count;

                // Routes Count
                const routesSnap = await getCountFromServer(collection(db, 'routes'));
                const routesCount = routesSnap.data().count;

                // Vehicles Count
                const vehiclesSnap = await getCountFromServer(collection(db, 'vehicles'));
                const vehiclesCount = vehiclesSnap.data().count;

                // Admin Users Count
                const adminsSnap = await getCountFromServer(collection(db, 'admin-users'));
                const adminsCount = adminsSnap.data().count;

                // Total Revenue
                let totalRevenue = 0;
                try {
                    const revSnap = await getAggregateFromServer(collection(db, 'finance'), {
                        total: sum('amount')
                    });
                    totalRevenue = revSnap.data().total;
                } catch (e) {
                    console.error("Revenue aggregate failed:", e);
                }

                setStats({
                    bookings: bookingsCount,
                    trips: tripsCount,
                    drivers: driversCount,
                    routes: routesCount,
                    vehicles: vehiclesCount,
                    admins: adminsCount,
                    revenue: totalRevenue
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, []);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setAnalyticsLoading(true);
            try {
                let q;
                if (timeframe === 'daily') {
                    q = query(
                        collection(db, 'daily_analytics'),
                        where('month', '==', selectedMonth),
                        where('year', '==', selectedYear),
                        orderBy('week', 'asc'),
                        orderBy('day', 'asc')
                    );
                } else if (timeframe === 'weekly') {
                    q = query(
                        collection(db, 'weekly_analytics'),
                        where('month', '==', selectedMonth),
                        where('year', '==', selectedYear),
                        orderBy('week', 'asc')
                    );
                } else if (timeframe === 'monthly') {
                    q = query(
                        collection(db, 'monthly_analytics'),
                        where('year', '==', selectedYear),
                        orderBy('month', 'asc')
                    );
                } else {
                    q = query(
                        collection(db, 'yearly_analytics'),
                        orderBy('year', 'asc')
                    );
                }

                try {
                    const snap = await getDocs(q);
                    const docs = snap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    const formatted = formatAnalytics(docs, timeframe);
                    setAnalyticsData(formatted);
                } catch (indexError) {
                    console.warn("Query sorting failed (likely missing index), falling back to client-side sorting:", indexError);

                    let fallbackQ;
                    if (timeframe === 'daily') {
                        fallbackQ = query(
                            collection(db, 'daily_analytics'),
                            where('month', '==', selectedMonth),
                            where('year', '==', selectedYear)
                        );
                    } else if (timeframe === 'weekly') {
                        fallbackQ = query(
                            collection(db, 'weekly_analytics'),
                            where('month', '==', selectedMonth),
                            where('year', '==', selectedYear)
                        );
                    } else if (timeframe === 'monthly') {
                        fallbackQ = query(
                            collection(db, 'monthly_analytics'),
                            where('year', '==', selectedYear)
                        );
                    } else {
                        fallbackQ = query(collection(db, 'yearly_analytics'));
                    }

                    const snap = await getDocs(fallbackQ);
                    const docs = snap.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    const formatted = formatAndSortAnalytics(docs, timeframe, selectedMonth, selectedYear);
                    setAnalyticsData(formatted);
                }
            } catch (err) {
                console.error("Error fetching analytics data:", err);
            } finally {
                setAnalyticsLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeframe, selectedMonth, selectedYear]);

    const handleClear = () => {
        setFromDate('');
        setToDate('');
        setActiveFilter('');
        setSearchQuery('');
    };

    const handleView = (booking) => {
        const cleanId = String(booking?.booking_id || booking?.id || '').replace('#', '');
        navigate(`/bookings/view/${cleanId}`);
    };

    const metricColors = {
        amount: {
            stroke: '#6366f1',
            fillId: 'colorAmount',
            activeBtn: 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10'
        },
        noOfTrips: {
            stroke: '#10b981',
            fillId: 'colorTrips',
            activeBtn: 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/10'
        },
        passengerCount: {
            stroke: '#f59e0b',
            fillId: 'colorPassengers',
            activeBtn: 'bg-amber-600 text-white shadow-sm shadow-amber-600/10'
        }
    };

    const activeColor = metricColors[metric];

    // Compute period aggregates
    const totalAmount = analyticsData.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    const totalTrips = analyticsData.reduce((acc, curr) => acc + (curr.noOfTrips || 0), 0);
    const totalPassengers = analyticsData.reduce((acc, curr) => acc + (curr.passengerCount || 0), 0);

    return (
        <>
            <SectionHeader
                title="Dashboard Overview"
                subtitle="Monitor your bookings, trips, and overall platform metrics."
                actionLabel="New Booking"
                actionIcon={CalendarCheck}
                actionTo="/bookings/add"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                <StatCard title="Total Revenue" value={`₹${(stats.revenue || 0).toLocaleString('en-IN')}`} icon={DollarSign} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Total Bookings" value={stats.bookings} icon={CalendarCheck} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Active Trips" value={stats.trips} icon={MapIcon} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Available Drivers" value={stats.drivers} icon={Users} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Total Routes" value={stats.routes} icon={Route} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Total Vehicles" value={stats.vehicles} icon={Car} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
                <StatCard title="Admin Users" value={stats.admins} icon={UserCheck} trend="Live" trendUp={true} trendLabel="" loading={statsLoading} />
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 md:mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-50">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-600" />
                            Analytics Overview
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">Track booking trends, revenues, and trip frequency across different time frames.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {(timeframe === 'daily' || timeframe === 'weekly') && (
                            <div className="flex items-center gap-2">
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    {monthsList.map((m) => (
                                        <option key={m.value} value={m.value}>{m.name}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all cursor-pointer hover:bg-slate-100"
                                >
                                    {['2025', '2026', '2027'].map((yr) => (
                                        <option key={yr} value={yr}>{yr}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="flex bg-slate-50 rounded-xl p-1 border border-slate-100">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((tf) => (
                                <button
                                    key={tf}
                                    onClick={() => setTimeframe(tf)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${timeframe === tf
                                            ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                                            : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                >
                                    {tf}
                                </button>
                            ))}
                        </div>

                        <div className="flex bg-slate-100 rounded-xl p-1">
                            <button
                                onClick={() => setMetric('amount')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${metric === 'amount' ? activeColor.activeBtn : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Revenue
                            </button>
                            <button
                                onClick={() => setMetric('noOfTrips')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${metric === 'noOfTrips' ? activeColor.activeBtn : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Trips
                            </button>
                            <button
                                onClick={() => setMetric('passengerCount')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${metric === 'passengerCount' ? activeColor.activeBtn : 'text-slate-500 hover:text-slate-800'
                                    }`}
                            >
                                Passengers
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-4 my-2">
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period Revenue</span>
                        <p className="text-base font-black text-slate-800 mt-0.5">₹{totalAmount.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period Trips</span>
                        <p className="text-base font-black text-slate-800 mt-0.5">{totalTrips.toLocaleString()}</p>
                    </div>
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Period Passengers</span>
                        <p className="text-base font-black text-slate-800 mt-0.5">{totalPassengers.toLocaleString()}</p>
                    </div>
                </div>

                {/* Chart Area */}
                <div className="mt-4">
                    {analyticsLoading ? (
                        <div className="h-[300px] w-full bg-slate-50/50 rounded-2xl animate-pulse flex items-center justify-center border border-slate-100">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="text-xs font-semibold text-slate-400">Loading charts...</span>
                            </div>
                        </div>
                    ) : analyticsData.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                            <TrendingUp className="w-12 h-12 text-slate-300 mb-2" />
                            <h4 className="text-sm font-bold text-slate-700">No Analytics Data Available</h4>
                            <p className="text-xs text-slate-500 max-w-[280px] text-center mt-1">Data is recorded automatically when payments are confirmed.</p>
                        </div>
                    ) : (
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={analyticsData}
                                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                                >
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorPassengers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                        tickFormatter={(val) => metric === 'amount' ? `₹${val}` : val}
                                    />
                                    <Tooltip content={<CustomTooltip metric={metric} />} />
                                    <Area
                                        type="monotone"
                                        dataKey={metric}
                                        stroke={activeColor.stroke}
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill={`url(#${activeColor.fillId})`}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
            </div>

            <div className="pb-10">
                <Table
                    headers={[
                        'Sl No', 'Trip No', 'Route', 'From', 'To',
                        'Travel Date', 'Driver', 'Booked / Total'
                    ]}
                    data={bookings}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    onClear={handleClear}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    searchPlaceholder="Search by trip no, route name, driver..."
                    renderRow={(booking, idx) => {
                        return (
                            <>
                                {/* Sl No */}
                                <td className="px-6 py-4 text-[13px] font-black text-slate-800">
                                    {idx + 1}
                                </td>

                                {/* Trip No */}
                                <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-lg bg-primary-50 text-primary-700 font-extrabold text-[12px] border border-primary-100">
                                        #{booking.tripNo ?? '—'}
                                    </span>
                                </td>

                                {/* Route name */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[140px]">
                                    {booking.route_name || '—'}
                                </td>

                                {/* From */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                                    {booking.route_start || '—'}
                                </td>

                                {/* To */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700 truncate max-w-[120px]">
                                    {booking.route_end || '—'}
                                </td>

                                {/* Travel Date */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-600 whitespace-nowrap">
                                    {booking.selectedDate || '—'}
                                </td>

                                {/* Driver */}
                                <td className="px-6 py-4 text-[13px] font-bold text-slate-700">
                                    {booking.driver_name || '—'}
                                </td>

                                {/* Booked / Total seats */}
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center gap-1 text-[13px]">
                                        <span className="font-black text-indigo-600">
                                            {booking.bookedCount ?? (booking.users?.length ?? 0)}
                                        </span>
                                        <span className="text-slate-400 font-semibold">/</span>
                                        <span className="font-bold text-slate-600">
                                            {booking.totalSeats ?? '—'}
                                        </span>
                                    </span>
                                </td>
                            </>
                        );
                    }}
                    actions={(booking) => (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleView(booking)}
                                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                                title="View Booking"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                />
                {hasMore && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => fetchBookings({ searchQuery, activeFilter, isLoadMore: true })}
                            disabled={loading}
                            className="px-8 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Synchronizing...' : 'Load More Booking Data'}
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
