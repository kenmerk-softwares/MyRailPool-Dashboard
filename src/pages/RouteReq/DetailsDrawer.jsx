import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Users,
  MessageSquare,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const DetailsDrawer = ({ isOpen, onClose, request, onAccept, onReject }) => {
  if (!request) return null;

  return (
    <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-500 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div 
        className={`relative w-full sm:max-w-4xl h-[85vh] sm:h-auto sm:max-h-[90vh] bg-white shadow-2xl rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 transform ${
          isOpen ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-full sm:translate-y-12 sm:scale-95 opacity-0'
        }`}
      >
        <div className="h-full flex flex-col max-h-[90vh]">
          {/* Mobile sheet drag handle */}
          <div className="flex sm:hidden justify-center pt-3 pb-1 bg-slate-50/50">
            <div className="w-12 h-1 bg-slate-300 rounded-full" />
          </div>
          <div className="px-6 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Request Details</h2>
              <div className='flex items-center gap-2'>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{request.id}</p>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${
                request.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                request.status === 'Accepted' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                'bg-rose-50 text-rose-600 border-rose-200'
              }`}>
                {request.status}
              </div>
              </div>
              <span className="text-xs text-slate-700">
                    {new Date(request.createdAt || request.requestSentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">


            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Trip Information</h3>
              </div>
              <div className="p-6 bg-slate-50 border border-slate-100 rounded-[2rem] space-y-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1 flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl w-full">
                    <div className="p-2 bg-emerald-50 rounded-xl flex items-center justify-center self-start">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Pickup Location</span>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{request.from || request.pickup || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center opacity-30">
                    <div className="w-6 h-6 rounded-full border-2 border-slate-300 flex items-center justify-center">
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex-1 flex gap-4 p-4 bg-white border border-slate-100 rounded-2xl w-full">
                    <div className="p-2 bg-rose-50 rounded-xl flex items-center justify-center self-start">
                      <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Drop-off Location</span>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{request.to || request.drop || 'N/A'}</p>
                    </div>
                  </div>
                </div>

              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-3 bg-amber-500 rounded-full" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Timing & Schedule</h3>
              </div>
              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl">
                  <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Requested Route Dates</span>
                  <div className="flex flex-wrap gap-2">
                    {request.schedules ? request.schedules.map((sched, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white border border-indigo-100/30 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 me-5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700">{sched.date}</span>
                        </div>
                        {sched.time && sched.time.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-xs font-bold text-slate-600">{sched.time[0]}</span>
                          </div>
                        )}
                      </div>
                    )) : request.routeDates?.map((date, idx) => (
                      <div key={idx} className="flex items-center justify-between py-2 px-3 bg-white border border-indigo-100/30 rounded-xl shadow-sm">
                        <div className="flex items-center gap-2 me-5">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700">{new Date(date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-xs font-bold text-slate-600">{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>


          </div>

          {request.status === 'Pending' && (
            <div className="p-4 sm:p-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 bg-slate-50/50">
              <button 
                onClick={() => {
                  onReject(request);
                  onClose();
                }}
                className="px-4 py-3.5 bg-white border border-slate-200 text-rose-600 rounded-xl text-sm font-black hover:bg-rose-50 transition-all shadow-sm w-full sm:flex-1"
              >
                Reject Request
              </button>
              <button 
                onClick={() => {
                  onAccept(request);
                  onClose();
                }}
                className="px-4 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 w-full sm:flex-1"
              >
                Accept & Assign
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsDrawer;
