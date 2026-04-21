import React from 'react';
import { 
  User, MapPin, Calendar, Clock, Users, 
  ChevronRight, CheckCircle2, XCircle, Clock4, ShieldCheck 
} from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    Pending: "bg-amber-50 text-amber-600 border-amber-200",
    Accepted: "bg-emerald-50 text-emerald-600 border-emerald-200",
    Rejected: "bg-rose-50 text-rose-600 border-rose-200"
  };

  const icons = {
    Pending: <Clock4 className="w-3 h-3" />,
    Accepted: <CheckCircle2 className="w-3 h-3" />,
    Rejected: <XCircle className="w-3 h-3" />
  };

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${styles[status]}`}>
      {icons[status]}
      {status}
    </div>
  );
};

const RequestCard = ({ request, onView, onAccept, onReject }) => {
  const isPending = request.status === 'Pending';

  return (
    <div className={`group relative bg-white border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${
      isPending ? 'border-amber-200 shadow-sm' : 'border-slate-100'
    }`}>
      {isPending && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-200">
          New Request
        </div>
      )}

      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">{request.customerName}</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">{request.id}</p>
            </div>
          </div>
          <StatusBadge status={request.status} />
        </div>

        {/* Route Info */}
        <div className="space-y-4 mb-8">
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-dashed border-l-2 border-slate-100 border-dashed" />
            
            <div className="relative">
              <MapPin className="absolute -left-[22px] top-0 w-4 h-4 text-emerald-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-400 uppercase tracking-tighter text-[9px]">Pickup</span>
                <p className="text-slate-700 font-bold leading-tight">{request.pickup}</p>
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute -left-[22px] top-0 w-4 h-4 text-rose-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-400 uppercase tracking-tighter text-[9px]">Drop</span>
                <p className="text-slate-700 font-bold leading-tight">{request.drop}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-700">{request.passengerCount} Pass.</span>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
              <Clock className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500">{new Date(request.requestSentAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Route Dates */}
        <div className="mb-8">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Planned Schedule</label>
          <div className="flex flex-wrap gap-2">
            {request.routeDates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-[10px] font-bold text-indigo-700">
                <Calendar className="w-3 h-3" />
                <span>{new Date(date).toLocaleDateString()}</span>
                <span className="opacity-30">|</span>
                <span>{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center gap-3">
          <button 
            onClick={() => onView(request)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            Details
            <ChevronRight className="w-4 h-4" />
          </button>
          
          {isPending && (
            <>
              <button 
                onClick={() => onReject(request)}
                className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Reject
              </button>
              <button 
                onClick={() => onAccept(request)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Accept
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
