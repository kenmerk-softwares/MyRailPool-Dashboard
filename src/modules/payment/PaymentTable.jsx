import React from 'react';
import { Eye, CreditCard, Smartphone, Banknote, Loader2 } from 'lucide-react';
import { Table } from '../../shared/Table/Table';
import { StatusBadge } from '../../components/Shared';

// little icon based on payment type
const MethodIcon = ({ method }) => {
  switch ((method || '').toLowerCase()) {
    case 'online': return <Smartphone className="w-3.5 h-3.5" />;
    case 'card': return <CreditCard className="w-3.5 h-3.5" />;
    case 'cash': return <Banknote className="w-3.5 h-3.5" />;
    default: return <CreditCard className="w-3.5 h-3.5" />;
  }
};

const statusColor = (s) =>
  s === 'Confirmed' ? 'success' : s === 'Pending' ? 'warning' : s === 'Cancelled' ? 'danger' : 'slate';

const formatTs = (val) => {
  if (!val) return '—';
  if (typeof val === 'number') return new Date(val).toLocaleString('en-IN');
  if (val?.toDate) return val.toDate().toLocaleString('en-IN');
  return String(val);
};

const PaymentTable = ({
  payments, loading, onView,
  searchTerm, setSearchTerm,
  statusFilter, setStatusFilter,
  fromDate, setFromDate,
  toDate, setToDate,
  onClear
}) => {
  return (
    <div className="pb-10">
      <Table
        headers={['Sl No', 'Description', 'Amount', 'Type', 'Method', 'Status', 'Date']}
        data={payments}
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
        activeFilter={statusFilter}
        setActiveFilter={setStatusFilter}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        onClear={onClear}
        searchPlaceholder="Search by booking ID, trip ID, description..."
        filterOptions={[
          { label: 'Confirmed', value: 'Confirmed' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Cancelled', value: 'Cancelled' },
        ]}
        renderRow={(payment, idx) => (
          <>
            <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>

            {/* booking ID
            <td className="px-8 py-4">
              <span className="font-mono text-[11px] text-slate-500 break-all max-w-[160px] block">{payment.bookingNos || '—'}</span>
            </td> */}

            {/* description */}
            <td className="px-8 py-4 text-[13px] font-bold text-slate-700 max-w-[180px] truncate">
              {payment.description || '—'}
            </td>

            {/* amount */}
            <td className="px-8 py-4">
              <span className="text-[13px] font-black text-emerald-600">£{payment.amount ?? '—'}</span>
            </td>

            {/* type (Credit / Debit) */}
            <td className="px-8 py-4">
              <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-widest border ${payment.type === 'Credit'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
                }`}>{payment.type || '—'}</span>
            </td>

            {/* payment method */}
            <td className="px-8 py-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MethodIcon method={payment.paymentType} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{payment.paymentType || '—'}</span>
              </div>
            </td>

            {/* status */}
            <td className="px-8 py-4">
              <StatusBadge status={payment.status} statusColor={statusColor(payment.status)} />
            </td>

            {/* date */}
            <td className="px-8 py-4 text-[11px] font-bold text-slate-500 whitespace-nowrap">
              {formatTs(payment.createdAt)}
            </td>
          </>
        )}
        actions={(payment) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onView(payment)}
              className="p-2 bg-white border border-slate-200 text-slate-500 hover:text-primary-600 hover:border-primary-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        )}
      />
      {loading && payments.length > 0 && (
        <div className="flex justify-center mt-4">
          <Loader2 className="w-5 h-5 text-primary-400 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default PaymentTable;
