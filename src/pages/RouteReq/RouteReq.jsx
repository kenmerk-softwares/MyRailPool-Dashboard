import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Bell, Filter as FilterIcon,
  RefreshCcw, AlertTriangle, CheckCircle, Info
} from 'lucide-react';
import Filters from './components/Filters';
import NotificationCenter from './components/NotificationCenter';
import RequestCard from './components/RequestCard';
import DetailsDrawer from './components/DetailsDrawer';
import RejectModal from './components/RejectModal';
import { mockRequests } from '../../data/mockData';

const RouteReq = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setRequests(mockRequests);
      setLoading(false);

      // Simulate/Show notification after 2 seconds
      setTimeout(() => {
        setNotification({
          id: 'new-1',
          customerName: 'Vikram Mehta',
          pickup: 'Indiranagar',
          drop: 'Bangalore Airport',
          requestSentTime: 'Just now',
          routeDates: [new Date().toISOString()]
        });
      }, 2000);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All Status' || req.status === statusFilter;

    const matchesDate = !dateFilter || req.routeDates.some(d => d.startsWith(dateFilter));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (req) => {
    setSelectedRequest(req);
    setIsDrawerOpen(true);
  };

  const handleAccept = (req) => {
    navigate('/trips/add', {
      state: {
        origin: req.pickup,
        destination: req.drop,
        passengerCount: req.passengerCount,
        customerName: req.customerName,
        requestId: req.id,
        routeDates: req.routeDates
      }
    });
  };

  const handleReject = (req) => {
    setSelectedRequest(req);
    setIsRejectModalOpen(true);
  };

  const confirmReject = (reason, comment) => {
    setRequests(prev => prev.map(r =>
      r.id === selectedRequest.id
        ? { ...r, status: 'Rejected', rejectionReason: reason, rejectionComment: comment }
        : r
    ));
    setIsRejectModalOpen(false);
    // Show success toast (simulated)
    alert(`Request ${selectedRequest.id} rejected: ${reason}`);
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
    <div className="min-h-screen bg-slate-50/30 p-4 md:p-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Requests</h1>
          </div>
          <p className="text-slate-500 font-medium ml-12">Manage incoming customer requests for new travel corridors and assign assets.</p>
        </div>

        <div className="flex items-center gap-4 lg:self-end">
          <div className="hidden md:flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest shadow-sm">
            <RefreshCcw className="w-3 h-3 mr-2 animate-spin-slow" />
            Last Updated: Just now
          </div>
          <button
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
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

      {/* Overlays */}
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