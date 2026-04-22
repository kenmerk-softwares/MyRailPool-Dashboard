import React from 'react';
import { Search, Filter, Calendar, X } from 'lucide-react';

const Filters = ({ searchTerm, setSearchTerm, statusFilter, setStatusFilter, methodFilter, setMethodFilter }) => {
  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Booking ID, Customer, Transaction..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-100 bg-slate-50/50 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all"
        />
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-white min-w-[140px]">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-bold text-slate-700 outline-none cursor-pointer w-full"
          >
            <option value="All Status">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Refunded">Refunded</option>
          </select>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-100 bg-white min-w-[140px]">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select 
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs font-bold text-slate-700 outline-none cursor-pointer w-full"
          >
            <option value="All Methods">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Wallet">Wallet</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100">
          Apply Filter
        </button>
      </div>
    </div>
  );
};

export default Filters;
