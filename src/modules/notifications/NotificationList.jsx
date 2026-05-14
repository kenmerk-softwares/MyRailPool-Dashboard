import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {Car, Clock, CalendarCheck, CheckCircle2, XCircle, Send, Eye } from 'lucide-react';

const NotificationItem = ({ icon: Icon, title, message, time, type, onView }) => {
  const getColors = () => {
    switch(type) {
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'danger': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-primary-50 text-primary-600 border-primary-100';
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 flex items-start gap-4 md:gap-6 hover:shadow-md transition-shadow cursor-pointer group relative overflow-hidden">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border ${getColors()} mt-1`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1">
          <h4 className="text-sm md:text-base font-bold text-slate-800 truncate">{title}</h4>
          <div className="flex flex-col items-end gap-2 shrink-0">
             <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-tight whitespace-nowrap">{time}</span>
             <button 
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="p-2 bg-slate-50 text-slate-400 hover:bg-primary-600 hover:text-white rounded-lg transition-all border border-slate-100 hover:border-primary-600 shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed line-clamp-1">{message}</p>
      </div>
    </div>
  );
};

export const NotificationList = () => {
  const [selectedNotif, setSelectedNotif] = useState(null);
  
  const notifications = [
    {
      icon: CalendarCheck,
      title: "New Booking Request",
      message: "Customer Liam Johnson requested a new ride from Airport Terminal 1 to Downtown Hotel.",
      time: "2 mins ago",
      type: "primary"
    },
    {
      icon: CheckCircle2,
      title: "Booking Confirmed",
      message: "Emma Watson's booking #BK-8492 has been successfully confirmed and a driver is assigned.",
      time: "1 hour ago",
      type: "success"
    },
    {
      icon: Car,
      title: "Driver Arrived",
      message: "James Miller has arrived at the pickup location for booking #BK-8492.",
      time: "3 hours ago",
      type: "success"
    },
    {
      icon: XCircle,
      title: "Booking Declined",
      message: "Booking #BK-8490 was declined by the administrator due to driver unavailability.",
      time: "Yesterday, 14:00",
      type: "danger"
    },
    {
      icon: Clock,
      title: "Quote Reminder",
      message: "Request for price quote for #BK-8501 is still pending your attention.",
      time: "Yesterday, 10:20",
      type: "warning"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h2>
          <p className="text-slate-500 mt-1">Manage and view real-time updates for bookings, drivers, and trips.</p>
        </div>
        <Link
          to="/notifications/send"
          className="bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </Link>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Today</span>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">Mark all as read</button>
        </div>
        
        {notifications.slice(0, 3).map((notif, idx) => (
          <NotificationItem key={idx} {...notif} onView={() => setSelectedNotif(notif)} />
        ))}

        <div className="flex items-center justify-between px-2 pt-6 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Yesterday</span>
        </div>
        
        {notifications.slice(3).map((notif, idx) => (
          <NotificationItem key={idx} {...notif} onView={() => setSelectedNotif(notif)} />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                    selectedNotif.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                    selectedNotif.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                    selectedNotif.type === 'danger' ? 'bg-red-50 text-red-600 border-red-100' :
                    'bg-primary-50 text-primary-600 border-primary-100'
                  }`}>
                    <selectedNotif.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{selectedNotif.title}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{selectedNotif.time}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                <p className="text-slate-600 leading-relaxed font-medium">
                  {selectedNotif.message}
                </p>
              </div>
              
              <button 
                onClick={() => setSelectedNotif(null)}
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg"
              >
                Close Notification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
