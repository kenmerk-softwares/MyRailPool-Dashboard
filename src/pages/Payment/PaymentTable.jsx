import React from 'react';
import { Eye, RotateCcw, MoreVertical, CreditCard, Wallet, Smartphone, Banknote } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    Paid: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Pending: 'bg-amber-50 text-amber-600 border-amber-100',
    Failed: 'bg-rose-50 text-rose-600 border-rose-100',
    Refunded: 'bg-blue-50 text-blue-600 border-blue-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles[status]}`}>
      {status}
    </span>
  );
};

const MethodIcon = ({ method }) => {
  switch (method) {
    case 'Card': return <CreditCard className="w-3.5 h-3.5" />;
    case 'Wallet': return <Wallet className="w-3.5 h-3.5" />;
    case 'UPI': return <Smartphone className="w-3.5 h-3.5" />;
    case 'Cash': return <Banknote className="w-3.5 h-3.5" />;
    default: return null;
  }
};

const PaymentTable = ({ payments, onView, onRefund }) => {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
               <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sl No</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Booking ID</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Customer</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Route</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Amount</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Method</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payments.map((payment, idx) => (
              <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                 <td className="px-4 md:px-6 py-4 text-xs md:text-sm font-medium text-slate-900">{idx + 1}</td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold text-slate-900">{payment.id}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-800">{payment.customer}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-[11px] font-medium text-slate-600 line-clamp-1 max-w-[150px]">{payment.route}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-black text-slate-900">₹{payment.amount}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <MethodIcon method={payment.method} />
                    <span className="text-[10px] font-bold uppercase">{payment.method}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={payment.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-[10px] font-medium text-slate-500">{payment.dateTime}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => onView(payment)}
                      className="p-2 hover:bg-indigo-50 text-slate-500  hover:text-indigo-600 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {payment.status === 'Paid' && (
                      <button 
                        onClick={() => onRefund(payment)}
                        className="p-2 hover:bg-rose-50 text-slate-500  hover:text-rose-600 rounded-xl transition-all"
                        title="Initiate Refund"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 hover:bg-slate-100 text-slate-300 hover:text-slate-600 rounded-xl transition-all">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {payments.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500  font-medium italic">No transactions found matching your filters.</p>
        </div>
      )}

      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <p className="text-[10px] font-bold text-slate-500  uppercase tracking-widest">
          Showing {payments.length} results
        </p>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">Previous</button>
          <button className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-[10px] font-bold text-indigo-600">1</button>
          <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[10px] font-bold text-slate-500 hover:bg-slate-50 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
};

export default PaymentTable;
