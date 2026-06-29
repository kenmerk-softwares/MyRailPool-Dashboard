import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Send,
  Eye,
  MapPin,
  Phone,
  User,
  Calendar,
  Bell,
  Check
} from 'lucide-react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../shared/services/firebase';

const formatTimeAgo = (createdAt) => {
  if (!createdAt) return '';
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

  return date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const NotificationItem = ({ id, title, message, createdAt, type, status, onView }) => {
  const getIcon = () => {
    if (title?.toLowerCase().includes('confirmed') || title?.toLowerCase().includes('received')) {
      return CalendarCheck;
    }
    switch (type) {
      case 'success': return CheckCircle2;
      case 'warning': return Clock;
      case 'danger': return XCircle;
      default: return Bell;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'danger': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-primary-50 text-primary-600 border-primary-100';
    }
  };

  const Icon = getIcon();
  const timeStr = formatTimeAgo(createdAt);

  return (
    <div
      onClick={onView}
      className={`bg-white p-4 md:p-6 rounded-2xl border flex items-start gap-4 md:gap-6 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${status === 'Unread' ? 'border-primary-100 bg-primary-50/10' : 'border-slate-100'
        }`}
    >
      {status === 'Unread' && (
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-primary-600 rounded-bl-xl" />
      )}
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 border ${getColors()} mt-1`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4 mb-1">
          <h4 className="text-sm md:text-base font-bold text-slate-800 truncate">{title}</h4>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-tight whitespace-nowrap">{timeStr}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onView(); }}
              className="p-2 bg-slate-50 text-slate-500 hover:bg-primary-600 hover:text-white rounded-lg transition-all border border-slate-100 hover:border-primary-600 shadow-sm"
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'admin_notification'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => n.status === "Unread");
      const promises = unreadNotifications.map(n =>
        updateDoc(doc(db, 'admin_notification', n.id), { status: 'Read' })
      );
      await Promise.all(promises);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleViewNotification = async (notif) => {
    setSelectedNotif(notif);
    if (notif.status === 'Unread') {
      try {
        await updateDoc(doc(db, 'admin_notification', notif.id), { status: 'Read' });
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
  };

  const isToday = (someDate) => {
    const today = new Date();
    return someDate.getDate() === today.getDate() &&
      someDate.getMonth() === today.getMonth() &&
      someDate.getFullYear() === today.getFullYear();
  };

  const todayNotifications = notifications.filter(n => {
    const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
    return isToday(date);
  });

  const olderNotifications = notifications.filter(n => {
    const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
    return !isToday(date);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-4xl mx-auto pb-10 px-4 md:px-0 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Notifications</h2>
            <p className="text-slate-500 mt-1">Manage and view real-time updates for bookings, drivers, and trips.</p>
          </div>
          {/* <Link
          to="/notifications/send"
          className="bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Send className="w-4 h-4" />
          Send Notification
        </Link> */}
        </div>

        {notifications.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400 animate-bounce" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 tracking-tight">No notifications yet</h3>
            <p className="text-slate-500 mt-1 max-w-sm text-sm">When bookings are confirmed, they will show up here in real-time.</p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Controls */}
            {notifications.some(n => n.status === 'Unread') && (
              <div className="flex justify-end mb-2 animate-in fade-in slide-in-from-top-4 duration-300">
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs font-bold text-primary-600 hover:text-primary-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Mark all as read
                </button>
              </div>
            )}

            {/* Today Group */}
            {todayNotifications.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Today</span>
                </div>
                {todayNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    {...notif}
                    onView={() => handleViewNotification(notif)}
                  />
                ))}
              </div>
            )}

            {/* Older Group */}
            {olderNotifications.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between px-2 mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">Older</span>
                </div>
                {olderNotifications.map((notif) => (
                  <NotificationItem
                    key={notif.id}
                    {...notif}
                    onView={() => handleViewNotification(notif)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[150] flex items-start justify-center p-4 pt-16 md:pt-24 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${selectedNotif.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      selectedNotif.type === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        selectedNotif.type === 'danger' ? 'bg-red-50 text-red-600 border-red-100' :
                          'bg-primary-50 text-primary-600 border-primary-100'
                    }`}>
                    {React.createElement(
                      selectedNotif.title?.toLowerCase().includes('confirmed') || selectedNotif.title?.toLowerCase().includes('received')
                        ? CalendarCheck
                        : selectedNotif.type === 'success' ? CheckCircle2 : Bell,
                      { className: "w-6 h-6" }
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">{selectedNotif.title}</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-tight">{formatTimeAgo(selectedNotif.createdAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <XCircle className="w-6 h-6 text-slate-500" />
                </button>
              </div>

              {/* Dynamic structured details for admin notifications */}
              {selectedNotif.details ? (
                <div className="space-y-4 mb-8">
                  {/* Route & Trip Info card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-xs md:text-sm space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Booking No:</span>
                      <span className="font-black text-slate-800">{selectedNotif.details.bookingNo}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Route Name:</span>
                      <span className="font-bold text-slate-800">{selectedNotif.details.routeName}</span>
                    </div>
                    <div className="flex justify-between items-start border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500 shrink-0">Journey:</span>
                      <div className="text-right font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-indigo-500 inline shrink-0" />
                        <span>{selectedNotif.details.startingPoint}</span>
                        <span className="text-slate-400 mx-1">→</span>
                        <MapPin className="w-3.5 h-3.5 text-red-500 inline shrink-0" />
                        <span>{selectedNotif.details.dropPoint}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Date & Timings:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedNotif.details.date}</span>
                        <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                        <span>{selectedNotif.details.departureTime} - {selectedNotif.details.arrivalTime}</span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">Driver Assigned:</span>
                      <span className="font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
                        {selectedNotif.details.driverName}
                      </span>
                    </div>
                  </div>

                  {/* Customer & Passenger Card */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-slate-700 text-xs md:text-sm space-y-2.5">
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Booked By:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {selectedNotif.details.userName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                      <span className="font-bold text-slate-500">Contact:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {selectedNotif.details.userPhone}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-500">Passenger Count:</span>
                      <span className="font-bold text-slate-800 bg-primary-50 text-primary-600 px-2.5 py-0.5 rounded-lg border border-primary-100">
                        {selectedNotif.details.passengerCount}
                      </span>
                    </div>
                    {selectedNotif.details.passengers && selectedNotif.details.passengers.length > 0 && (
                      <div className="pt-3 border-t border-slate-200/60">
                        <span className="font-bold text-slate-500 block mb-2">Passengers List:</span>
                        <div className="space-y-1.5 max-h-[100px] overflow-y-auto pr-1">
                          {selectedNotif.details.passengers.map((p, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] md:text-xs">
                              <span className="font-bold text-slate-700">{p.name || 'N/A'}</span>
                              <span className="text-slate-500 font-mono">{p.mobile || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
                  <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                    {selectedNotif.message}
                  </p>
                </div>
              )}

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
    </>
  );
};
