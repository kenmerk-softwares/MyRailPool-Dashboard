import React from 'react';
import { Bell, MapPin, Calendar, Clock, ChevronRight } from 'lucide-react';

const NotificationItem = ({ notification, onClick }) => {
  return (
    <div 
      onClick={() => onClick(notification)}
      className="p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group animate-in slide-in-from-right duration-300"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition-colors">
          <Bell className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-sm font-bold text-slate-900 truncate">{notification.customerName}</h4>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{notification.requestSentTime}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{notification.pickup} → {notification.drop}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {notification.routeDates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-medium text-slate-600">
                <Calendar className="w-2.5 h-2.5" />
                <span>{new Date(date).toLocaleDateString()}</span>
                <Clock className="w-2.5 h-2.5 ml-1" />
                <span>{new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            ))}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors self-center" />
      </div>
    </div>
  );
};

const NotificationCenter = ({ notifications, onNotificationClick }) => {
  if (!notifications || notifications.length === 0) {
    return (
      <div className="bg-white/50 backdrop-blur-sm border border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
          <Bell className="w-6 h-6 text-slate-300" />
        </div>
        <p className="text-sm font-bold text-slate-500">No new notifications</p>
        <p className="text-xs text-slate-400 mt-1">New route requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          Recent Requests
          <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        </h3>
        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
          {notifications.length} New
        </span>
      </div>
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {notifications.map((notif) => (
          <NotificationItem 
            key={notif.id} 
            notification={notif} 
            onClick={onNotificationClick} 
          />
        ))}
      </div>
    </div>
  );
};

export default NotificationCenter;
