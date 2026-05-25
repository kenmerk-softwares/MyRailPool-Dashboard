import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Bell, RefreshCcw, AlertTriangle,
} from 'lucide-react';
import Filters from './Filters';
import RequestCard from './RequestCard';
import DetailsDrawer from './DetailsDrawer';
import RejectModal from './RejectModal';
import { useRouteReqs } from './hooks/routeReq.useRouteReqs';

const RouteReq = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const {
    requests,
    loading,
    fetchRequests,
    updateRequestStatus
  } = useRouteReqs();

  useEffect(() => {
    fetchRequests({
      searchTerm,
      statusFilter,
      dateFilter
    });
  }, [searchTerm, statusFilter, dateFilter, fetchRequests]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification({
        id: 'new-1',
        from: 'Indiranagar',
        to: 'Bangalore Airport',
        createdAt: new Date().toISOString(),
        schedules: [{ date: '21-05-2026', time: ['3:30 pm'] }],
        status: 'Pending'
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const filteredRequests = requests;

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
  };

  const handleAccept = async (req) => {
    await updateRequestStatus(req.id, 'Accepted');
    const routeDates = req.schedules ? req.schedules.map(s => {
      try {
        const dateParts = s.date.split('-');
        const year = parseInt(dateParts[2], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[0], 10);

        let hours = 12;
        let minutes = 0;
        if (s.time && s.time.length > 0) {
          const timeStr = s.time[0].toLowerCase();
          const ampm = timeStr.includes('pm');
          const cleanTime = timeStr.replace('am', '').replace('pm', '').trim();
          const [h, m] = cleanTime.split(':');
          hours = parseInt(h, 10);
          minutes = parseInt(m, 10) || 0;
          if (ampm && hours < 12) hours += 12;
          if (!ampm && hours === 12) hours = 0;
        }
        return new Date(year, month, day, hours, minutes).toISOString();
      } catch (e) {
        return new Date().toISOString();
      }
    }) : (req.routeDates || []);

    const operatingDates = req.schedules ? req.schedules.map(s => {
      try {
        const parts = s.date.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } catch (e) {
        return '';
      }
    }).filter(Boolean) : [];

    const fromNode = req.from || req.pickup || '';
    const toNode = req.to || req.drop || '';
    const routeNodes = [fromNode, toNode].filter(Boolean);
    const routesDataNodes = routeNodes.map(node => ({ name: node, distanceFromStart: 0 }));

    navigate('/routes/add', {
      state: {
        route: {
          name: routeNodes.join(' - '),
          operating_dates: operatingDates,
          routes: routeNodes,
          routesData: routesDataNodes
        }
      }
    });
  };

  const handleReject = (req) => {
    setSelectedRequest(req);
    setIsRejectModalOpen(true);
  };

  const confirmReject = async (reason, comment) => {
    const result = await updateRequestStatus(selectedRequest.id, 'Rejected', {
      rejectionReason: reason,
      rejectionComment: comment
    });
    setIsRejectModalOpen(false);
    if (result.success) {
      alert(`Request ${selectedRequest.id} rejected: ${reason}`);
    } else {
      alert(`Error rejecting request: ${result.error}`);
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="flex justify-between items-end">
          <div className="space-y-3">
            <div className="h-10 w-64 bg-slate-200 rounded-2xl" />
            <div className="h-4 w-96 bg-slate-100 rounded-xl" />
          </div>
          <div className="h-12 w-48 bg-slate-200 rounded-2xl" />
        </div>
        <div className="h-16 bg-slate-100 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 bg-slate-50 border border-slate-100 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 p-3 sm:p-6 md:p-8 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 lg:mb-10 gap-4 lg:gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Route Requests</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium ml-12">Manage incoming customer requests</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:self-end w-full lg:w-auto">
          <div className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
            <RefreshCcw className="w-3 h-3 mr-2 animate-spin-slow" />
            Last Updated: Just now
          </div>
          <button
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 w-full sm:w-auto"
            onClick={() => navigate('/routes/add')}
          >
            <Plus className="w-5 h-5" />
            Create Custom Route
          </button>
        </div>
      </div>

      <div className="w-full">
        <div className=" space-y-8">
          <Filters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
          />

          {filteredRequests.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => (
                <RequestCard
                  key={req.id}
                  request={req}
                  onView={handleViewDetails}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <AlertTriangle className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-900">No requests found</h3>
              <p className="text-slate-500 mt-2 max-w-sm font-medium">We couldn't find any requests matching your current filters. Try adjusting your search criteria.</p>
              <button
                onClick={() => { setSearchTerm(''); setStatusFilter('All Status'); setDateFilter(''); }}
                className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-black transition-all"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      <DetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        request={selectedRequest}
        onAccept={handleAccept}
        onReject={handleReject}
      />

      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={confirmReject}
        request={selectedRequest}
      />
    </div>
  );
};

export default RouteReq;