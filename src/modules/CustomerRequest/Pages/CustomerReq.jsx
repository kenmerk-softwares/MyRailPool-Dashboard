import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRequest } from "../hooks/request.useRequest";
import { SectionHeader, StatusBadge } from "../../../components/Shared";
import { Table } from '../../../shared/Table/Table';
import { Calendar, Edit, Eye, Phone, Trash2, MapPin, CheckCircle2 } from "lucide-react";
export function CustomerReq() {

    const navigate = useNavigate();
    const { requests, loading, hasMore, fetchRequests } = useRequest();
    const [activeFilter, setActiveFilter] = React.useState('');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [fromDate, setFromDate] = React.useState('');
    const [toDate, setToDate] = React.useState('');

    const handleView = (requests) => {
        const Id = String(requests?.docId || '').replace('#', '');
        navigate(`view/${Id}`);
    };

    const handleClear = () => {
        setActiveFilter('');
        setSearchQuery('');
        setFromDate('');
        setToDate('');
    };

    useEffect(() => {
        fetchRequests({ searchQuery, activeFilter, fromDate, toDate });
    }, [searchQuery, activeFilter, fromDate, toDate, fetchRequests]);
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <SectionHeader
                title="Customer requests"
                subtitle="Manage your customer requests."
            />

            <div className="pb-10">
                <Table
                    headers={['Sl No', 'Customer Name', 'Commuting Station', 'Status', 'Requested Date']}
                    data={requests}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    onClear={handleClear}
                    searchPlaceholder="Search by name..."
                    filterOptions={[
                        { label: 'Pending', value: 'Pending' },
                        { label: 'Approved', value: 'Approved' },
                        { label: 'Rejected', value: 'Rejected' },
                    ]}
                    renderRow={(requests, idx) => (
                        <>
                            <td className="px-6 py-5 text-[13px] font-black text-slate-500/80 text-left">{(idx + 1)}</td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200">
                                        {requests.fullName?.charAt(0) || 'C'}
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[14px] font-black text-slate-800 leading-tight">{requests.fullName}</span>
                                        <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                                            <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {requests.mobileNumber}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                                        <span className="text-[13px] font-bold text-slate-600 tracking-tight">{requests.commutingStation}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {requests.agreeTerms && (
                                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 font-bold">
                                                <CheckCircle2 className="w-3 h-3" /> Terms
                                            </span>
                                        )}
                                        {requests.agreeUpdates && (
                                            <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-bold">
                                                <CheckCircle2 className="w-3 h-3" /> Updates
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-5">
                                <StatusBadge
                                    status={requests?.status || 'Pending'}
                                    statusColor={
                                        requests?.status === 'Approved' ? 'success' :
                                            requests?.status === 'Pending' ? 'warning' :
                                                'danger'
                                    }
                                />
                            </td>
                            <td className="px-6 py-5">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-slate-300" />
                                    <span className="text-[13px] font-black text-slate-500">
                                        {requests.createdAt ? new Date(requests.createdAt?.seconds * 1000 || requests.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </td>
                        </>
                    )}
                // actions={(requests) => (
                //     <div className="flex items-center gap-1.5">
                //         <button
                //             onClick={() => handleView(requests)}
                //             className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                //             title="View Full Profile"
                //         >
                //             <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
                //         </button>
                //         <Link
                //             to={`/requests/edit/${requests.docId}`}
                //             className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-100 hover:bg-amber-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                //             title="Edit Records"
                //         >
                //             <Edit className="w-4 h-4 transition-transform group-hover:scale-110" />
                //         </Link>
                //         <button
                //             className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50/30 rounded-xl transition-all duration-300 hover:shadow-md active:scale-95 group"
                //             title="Remove requests"
                //         >
                //             <Trash2 className="w-4 h-4 transition-transform group-hover:scale-110" />
                //         </button>
                //     </div>
                // )}
                />

                {hasMore && (
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => fetchRequests({ searchQuery, activeFilter, fromDate, toDate, isLoadMore: true })}
                            disabled={loading}
                            className="group relative px-10 py-3.5 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 overflow-hidden"
                        >
                            <span className="relative z-10">{loading ? 'Synchronizing Data...' : 'Load More Records'}</span>
                            <div className="absolute inset-0 bg-indigo-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}