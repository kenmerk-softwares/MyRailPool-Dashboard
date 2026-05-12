import React, { useEffect, useState, useCallback } from 'react';
import { Search, Clock, ArrowRight } from 'lucide-react';
import { FaCalendarAlt } from 'react-icons/fa';
import { SectionHeader } from '../../../components/Shared';
import { adminDb } from '../../../Config/Config';
import { where, orderBy } from 'firebase/firestore';
import { useCollection } from '../../../shared/hooks/useCollection';

export default function AdminLogs() {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const { data: logs, loading, hasMore, fetchData } = useCollection('admin-logs', { 
        pageSize: 20, 
        dbInstance: adminDb 
    });

    const getConstraints = useCallback(() => {
        const constraints = [orderBy('createdAt', 'desc')];
        if (fromDate) {
            constraints.push(where('createdAt', '>=', new Date(fromDate + "T00:00:00")));
        }
        if (toDate) {
            constraints.push(where('createdAt', '<=', new Date(toDate + "T23:59:59")));
        }
        if (searchQuery) {
            constraints.push(where('email', '==', searchQuery.trim()));
        }
        return constraints;
    }, [fromDate, toDate, searchQuery]);

    useEffect(() => {
        fetchData({ constraints: getConstraints() });
    }, [fetchData, getConstraints]);

    const handleSearch = () => {
        setSearchQuery(searchTerm);
    };

    const handleLoadMore = () => {
        fetchData({ 
            constraints: getConstraints(), 
            isLoadMore: true 
        });
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return { time: 'N/A', date: 'N/A' };
        const date = timestamp.seconds ? new Date(timestamp.seconds * 1000) : new Date(timestamp);
        return {
            time: date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        };
    };

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
                        <div className="relative group min-w-[200px] md:min-w-[300px]">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors">
                                <Search className="h-4 w-4" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent rounded-xl text-xs md:text-sm placeholder-slate-400 focus:border-primary-500 focus:bg-white focus:ring focus:ring-primary-500/20 transition-all duration-200"
                                placeholder="Search by email..."
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <button 
                            onClick={handleSearch}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all active:scale-95 shadow-sm"
                        >
                            Search
                        </button>

                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
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
                    </div>
                </div>

                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Sl No</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Name</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Action Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Details</th>
                                <th className="px-6 py-4 text-xs font-semibold text-slate-500 tracking-wider uppercase border-b border-slate-100">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                                        Loading logs...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-slate-400">
                                        No admin logs found.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log, idx) => {
                                    const { time, date } = formatTimestamp(log.createdAt);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap text-xs md:text-sm font-medium text-slate-500">{idx + 1}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs mr-3">
                                                        {(log.email || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-900">{log.name || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs text-slate-600">{log.email || 'N/A'}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                                                    {log.action || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-slate-600 max-w-xs md:max-w-md truncate">{log.description || 'N/A'}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-xs text-slate-900 font-medium">{time}</div>
                                                <div className="text-[10px] text-slate-400 mt-0.5">{date}</div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 md:p-6 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs md:text-sm text-slate-500">
                        Showing <span className="font-semibold text-slate-800">{logs.length}</span> log entries
                    </p>
                    
                    {hasMore && (
                        <button
                            onClick={handleLoadMore}
                            disabled={loading}
                            className="w-full sm:w-auto px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    Load More Logs
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}