import React from 'react';
import {Car, Clock, CalendarCheck, CheckCircle2, XCircle } from 'lucide-react';
import { SectionHeader } from '../../components/Shared';

const NotificationItem = ({ icon: Icon, title, message, time, type }) => {
  const getColors = () => {
    switch(type) {
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'danger': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-primary-50 text-primary-600 border-primary-100';
    }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-100 flex gap-4 md:gap-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border ${getColors()}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-1">
          <h4 className="text-sm md:text-base font-bold text-slate-800">{title}</h4>
          <span className="text-[10px] md:text-xs text-slate-400 font-medium whitespace-nowrap">{time}</span>
        </div>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed">{message}</p>
      </div>
    </div>
  );
};

export const NotificationList = () => {
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
    <div className="max-w-4xl mx-auto">
      <SectionHeader 
        title="Notifications" 
        subtitle="Manage and view real-time updates for bookings, drivers, and trips." 
      />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today</span>
          <button className="text-xs font-medium text-primary-600 hover:text-primary-700">Mark all as read</button>
        </div>
        
        {notifications.slice(0, 3).map((notif, idx) => (
          <NotificationItem key={idx} {...notif} />
        ))}

        <div className="flex items-center justify-between px-2 pt-6 mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Yesterday</span>
        </div>
        
        {notifications.slice(3).map((notif, idx) => (
          <NotificationItem key={idx} {...notif} />
        ))}
      </div>
    </div>
  );
};
