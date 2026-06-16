import React from 'react';
import {
  User,
  MapPin,
  Calendar,
  Clock,
  Users,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock4,
  Phone,
  Plus
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
    <div className={`group relative bg-white border rounded-3xl p-4 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 ${isPending ? 'border-amber-200 shadow-sm' : 'border-slate-100'
      }`}>
      {isPending && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-200">
          New Request
        </div>
      )}

      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-2xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-slate-500" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">Route Request</h3>
              {/* <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 truncate">{request.id}</p> */}
            </div>
          </div>
          <div className="flex-shrink-0">
            <StatusBadge status={request.status} />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="relative grid grid-cols-2 gap-3 pl-6">
            <div className="absolute left-1 top-1 bottom-1 w-0.5 bg-dashed border-l-2 border-slate-100 border-dashed" />

            <div className="relative">
              <User className="absolute -left-[22px] top-0 w-4 h-4 text-emerald-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-500 uppercase tracking-tighter text-[9px]">Name</span>
                <p className="text-slate-700 font-bold leading-tight">{request.name || 'N/A'}</p>
              </div>
            </div>
            <div className="relative">
              <Phone className="absolute -left-[22px] top-0 w-4 h-4 text-emerald-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-500 uppercase tracking-tighter text-[9px]">Phone Number</span>
                <p className="text-slate-700 font-bold leading-tight">{request.phone || 'N/A'}</p>
              </div>
            </div>
            <div className="relative">
              <MapPin className="absolute -left-[22px] top-0 w-4 h-4 text-emerald-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-500 uppercase tracking-tighter text-[9px]">Pickup</span>
                <p className="text-slate-700 font-bold leading-tight">{request.from || request.pickup || 'N/A'}</p>
              </div>
            </div>

            <div className="relative">
              <MapPin className="absolute -left-[22px] top-0 w-4 h-4 text-rose-500 bg-white" />
              <div className="text-xs">
                <span className="block font-semibold text-slate-500 uppercase tracking-tighter text-[9px]">Drop</span>
                <p className="text-slate-700 font-bold leading-tight">{request.to || request.drop || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">

            <div className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 rounded-xl">
              <Clock className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-500">{new Date(request.createdAt || request.requestSentAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2 px-1">Planned Schedule</label>
          <div className="flex flex-wrap gap-2">
            {request.schedules ? request.schedules.map((sched, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-[10px] font-bold text-indigo-700">
                <Calendar className="w-3 h-3" />
                <span>{sched.date}</span>
                {sched.time && sched.time.length > 0 && (
                  <>
                    <span className="opacity-30">|</span>
                    <span>{sched.time[0]}</span>
                  </>
                )}
              </div>
            )) : request.routeDates?.map((date, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-indigo-50/50 border border-indigo-100/50 rounded-lg text-[10px] font-bold text-indigo-700">
                <Calendar className="w-3 h-3" />
                <span>{new Date(date).toLocaleDateString()}</span>
                <span className="opacity-30">|</span>
                <span>{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={() => onView(request)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-bold transition-all active:scale-95 order-3 sm:order-1"
          >
            Details
            <ChevronRight className="w-4 h-4" />
          </button>

          {isPending && (
            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2 flex-1">
              <button
                onClick={() => onReject(request)}
                className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all active:scale-95"
              >
                Reject
              </button>
              <button
                onClick={() => onAccept(request)}
                className="flex-1 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition-all active:scale-95"
              >
                Accept
              </button>
            </div>
          )}

          {request.status === 'Accepted' && (
            <div className="flex gap-2 sm:gap-3 order-1 sm:order-2 flex-1">
              <button
                onClick={() => onAccept(request)}
                className="flex-1 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-lg shadow-emerald-100 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Trip
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestCard;
