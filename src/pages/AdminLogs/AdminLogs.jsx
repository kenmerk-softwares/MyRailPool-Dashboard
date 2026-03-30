import React from 'react';
import { Search, Calendar, Filter, Clock, MoreVertical, ShieldCheck, User, ArrowRight } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { SectionHeader, StatusBadge } from '../../components/Shared';

const adminLogsMockData = [
    { id: 1, user: 'Super Admin', email: "superadmin@gmail.com", action: 'Trip Created', details: 'Manual trip creation for Route #102', time: '10:00 AM', date: 'Mar 30, 2024', status: 'Approved', statusColor: 'success' },
    { id: 2, user: 'Admin User', email: "admin@gmail.com", action: 'Booking Cancelled', details: 'Booking #BK-4521 cancelled by operator', time: '11:30 AM', date: 'Mar 30, 2024', status: 'Declined', statusColor: 'danger' },
    { id: 3, user: 'Super Admin', email: "superadmin@gmail.com", action: 'Driver Assigned', details: 'Driver John Doe assigned to Trip #TR-88', time: '02:15 PM', date: 'Mar 30, 2024', status: 'Completed', statusColor: 'success' },
    { id: 4, user: 'Manager', email: "manager@gmail.com", action: 'Profile Updated', details: 'Vehicle #UP-32-AB-1234 maintenance logs updated', time: '04:45 PM', date: 'Mar 29, 2024', status: 'Approved', statusColor: 'success' },
    { id: 5, user: 'Super Admin', email: "superadmin@gmail.com", action: 'Settings Changed', details: 'System backup schedule updated to daily', time: '09:00 AM', date: 'Mar 29, 2024', status: 'Pending', statusColor: 'warning' },
];

export default function AdminLogs() {
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    return (
        <div className="p-4 md:p-6 lg:p-8">
            <SectionHeader
                title="Admin Logs"
                subtitle="Monitor system activities, configuration changes, and administrator actions."
            // actionLabel="Export Logs"
            // actionIcon={ShieldCheck}
            />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="p-4 md:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <h3 className="text-base md:text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" />
                        Activity Timeline
                    </h3>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative group min-w-[200px] md:min-w-[300px]">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="Search logs, admins, actions..."
                            />
                        </div>

                        {/* Date Filter */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                            <FaCalendarAlt className="text-slate-400 text-xs" />
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => setFromDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-slate-600 w-28 focus:ring-0"
                            />
                            <ArrowRight className="w-3 h-3 text-slate-300" />
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => setToDate(e.target.value)}
                                className="bg-transparent border-none outline-none text-xs text-slate-600 w-28 focus:ring-0"
                            />
                        </div>

                        {/* <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm text-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none">
                            <option value="">All Actions</option>
                            <option value="create">Created</option>
                            <option value="update">Updated</option>
                            <option value="delete">Deleted</option>
                            <option value="assign">Assigned</option>
                        </select> */}

                        <button className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs md:text-sm">Clear</button>

                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Administrator</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Action Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Timestamp</th>
                                {/* <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Status</th> */}
                                {/* <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100 text-right">Actions</th> */}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {adminLogsMockData.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs mr-3">
                                                {log.user.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-900">{log.user}</span>
                                                <span className="text-xs text-slate-500">{log.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-slate-600 max-w-xs md:max-w-md truncate">{log.details}</p>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-xs text-slate-900 font-medium">{log.time}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{log.date}</div>
                                    </td>
                                    {/* <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={log.status} statusColor={log.statusColor} />
                                    </td> */}
                                    {/* <td className="px-6 py-4 text-right">
                                        <button className="text-slate-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td> */}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-xs md:text-sm text-slate-500">
                        Showing <span className="font-semibold text-slate-800">5</span> of <span className="font-semibold text-slate-800">50</span> log entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors" disabled>
                            Previous
                        </button>
                        <button className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}