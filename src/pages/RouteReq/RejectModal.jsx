import React, { useState } from 'react';
import { X, AlertCircle, Send } from 'lucide-react';

const RejectModal = ({ isOpen, onClose, onConfirm, request }) => {
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');

  const reasons = [
    "No drivers available",
    "Invalid request details",
    "Customer requested cancellation",
    "Out of service area",
    "Other"
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 rounded-xl">
              <AlertCircle className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Reject Request</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-rose-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Requesting Customer</span>
            <p className="text-sm font-bold text-slate-800">{request?.customerName || 'N/A'}</p>
            <p className="text-xs text-slate-500 mt-0.5">{request?.id || 'N/A'}</p>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block ml-1">Reason for Rejection</label>
            <select 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all cursor-pointer"
            >
              <option value="">Select a reason...</option>
              {reasons.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block ml-1">Additional Comments (Optional)</label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Provide more context for the customer..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none"
            />
          </div>
        </div>

        <div className="px-6 py-6 bg-slate-50 border-t border-slate-100 flex items-center gap-4">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-black text-slate-500 hover:bg-slate-200 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(reason, comment)}
            disabled={!reason}
            className="flex-[2] px-4 py-3 bg-rose-600 text-white rounded-xl text-sm font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
          >
            Confirm Rejection
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;
