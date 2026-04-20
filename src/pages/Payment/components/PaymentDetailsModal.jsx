import React from 'react';
import { X, CreditCard, Clock, MapPin, Receipt, ShieldCheck } from 'lucide-react';

const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-xl rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
              <Receipt className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-lg">Payment Details</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID: {payment.id}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
          {/* Summary */}
          <div className="flex items-center justify-between p-5 bg-indigo-600 rounded-[24px] text-white shadow-lg shadow-indigo-100">
            <div>
              <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mb-1">Total Amount Paid</p>
              <h2 className="text-3xl font-black">₹{payment.amount}.00</h2>
            </div>
            <div className={`px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/20 text-xs font-black uppercase tracking-widest`}>
              {payment.status}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Fare Breakdown */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <Receipt className="w-3.5 h-3.5 text-indigo-500" />
                Fare Breakdown
              </h4>
              <div className="space-y-2.5">
                {[
                  { label: 'Base Fare', value: payment.fareBreakdown.baseFare },
                  { label: 'Distance Charge', value: payment.fareBreakdown.distance },
                  { label: 'Time Surcharge', value: payment.fareBreakdown.time },
                  { label: 'Tax', value: payment.fareBreakdown.tax },
                  { label: 'Discount', value: -payment.fareBreakdown.discount, color: 'text-emerald-500' },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-bold">
                    <span className="text-slate-400">{item.label}</span>
                    <span className={item.color || 'text-slate-700'}>{item.value > 0 ? `+₹${item.value}` : `-₹${Math.abs(item.value)}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payout Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                Payout Detail
              </h4>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Total Charged</span>
                  <span className="text-slate-700">₹{payment.paymentDetail.total}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400">Platform Comm. (10%)</span>
                  <span className="text-rose-500">-₹{payment.paymentDetail.commission}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-50 flex justify-between text-xs font-black">
                  <span className="text-slate-900 uppercase tracking-widest">Driver Earnings</span>
                  <span className="text-indigo-600">₹{payment.paymentDetail.driverEarnings}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-slate-50" />

          {/* Transaction Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
              Transaction Details
            </h4>
            <div className="bg-slate-50 rounded-2xl p-5 grid grid-cols-2 gap-6">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Transaction ID</p>
                <p className="text-xs font-black text-slate-700 truncate">{payment.transactionId}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                <p className="text-xs font-black text-slate-700">{payment.method}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
                <p className="text-xs font-black text-slate-700">{payment.dateTime}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Gateway Status</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">Success</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all active:scale-95"
          >
            Close Details
          </button>
          <button className="flex-1 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
            Download Receipt
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal;
