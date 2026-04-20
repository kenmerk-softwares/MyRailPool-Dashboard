import React, { useState } from 'react';
import { X, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react';

const RefundModal = ({ payment, isOpen, onClose }) => {
  const [refundType, setRefundType] = useState('full');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !payment) return null;

  const handleRefund = () => {
    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in-95 duration-300">
        {isSuccess ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">Refund Successful</h3>
            <p className="text-sm font-medium text-slate-500">The amount has been credited back to the customer's original method.</p>
          </div>
        ) : (
          <>
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <RotateCcw className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-lg">Process Refund</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Booking ID: {payment.id}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0" />
                <p className="text-xs font-bold text-amber-700 leading-relaxed">
                  Refunds are processed immediately but may take 3-5 business days to reflect in the account.
                </p>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Refund Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setRefundType('full')}
                    className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${refundType === 'full' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Full (₹{payment.amount})
                  </button>
                  <button 
                    onClick={() => setRefundType('partial')}
                    className={`px-4 py-3 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all ${refundType === 'partial' ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                  >
                    Partial
                  </button>
                </div>
              </div>

              {refundType === 'partial' && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Refund Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-black text-slate-800 focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block">Reason for Refund</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Driver cancelled, Trip not completed..."
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm font-medium text-slate-800 focus:border-indigo-500 outline-none transition-all h-24 resize-none"
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100">
              <button 
                onClick={handleRefund}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg flex items-center justify-center gap-3 ${isProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Initiate Refund</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RefundModal;
