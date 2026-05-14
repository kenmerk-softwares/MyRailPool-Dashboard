import React from 'react';
import { Eye, RotateCcw, MoreVertical, CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react';
import { Table } from '../../shared/Table/Table';
import { StatusBadge } from '../../components/Shared';

const MethodIcon = ({ method }) => {
  switch (method) {
    case 'Card': return <CreditCard className="w-3.5 h-3.5" />;
    case 'Wallet': return <Wallet className="w-3.5 h-3.5" />;
    case 'UPI': return <Smartphone className="w-3.5 h-3.5" />;
    case 'Cash': return <Banknote className="w-3.5 h-3.5" />;
    default: return null;
  }
};

const PaymentTable = ({ payments, onView, onRefund, searchTerm, setSearchTerm, statusFilter, setStatusFilter, onClear }) => {
  return (
    <div className="pb-10">
      <Table
        headers={['Sl No', 'Booking ID', 'Customer', 'Route', 'Amount', 'Method', 'Status', 'Date & Time']}
        data={payments}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
        activeFilter={statusFilter}
        setActiveFilter={setStatusFilter}
        onClear={onClear}
        searchPlaceholder="Search transactions, customers..."
        filterOptions={[
          { label: 'All Status', value: 'All Status' },
          { label: 'Paid', value: 'Paid' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Failed', value: 'Failed' },
          { label: 'Refunded', value: 'Refunded' },
        ]}
        renderRow={(payment, idx) => (
          <>
            <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
            <td className="px-8 py-4 text-[13px] font-black text-slate-800">{payment.id}</td>
            <td className="px-8 py-4 text-[13px] font-black text-slate-800">{payment.customer}</td>
            <td className="px-8 py-4">
              <span className="text-[13px] font-black text-slate-600 line-clamp-1 max-w-[200px]">{payment.route}</span>
            </td>
            <td className="px-8 py-4">
              <span className="text-[13px] font-black text-slate-900">₹{payment.amount}</span>
            </td>
            <td className="px-8 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MethodIcon method={payment.method} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{payment.method}</span>
              </div>
            </td>
            <td className="px-8 py-4">
              <StatusBadge 
                status={payment.status} 
                statusColor={
                  payment.status === 'Paid' ? 'success' : 
                  payment.status === 'Pending' ? 'warning' : 
                  payment.status === 'Failed' ? 'danger' : 'slate'
                } 
              />
            </td>
            <td className="px-8 py-4 text-[11px] font-black text-slate-500 whitespace-nowrap">{payment.dateTime}</td>
          </>
        )}
        actions={(payment) => (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onView(payment)} 
              className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {payment.status === 'Paid' && (
              <button 
                onClick={() => onRefund(payment)} 
                className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Initiate Refund"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all hover:shadow-lg active:scale-95">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default PaymentTable;
