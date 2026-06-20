import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Bell, RefreshCcw, AlertTriangle, X
} from 'lucide-react';
import Filters from './Filters';
import RequestCard from './RequestCard';
import DetailsDrawer from './DetailsDrawer';
import RejectModal from './RejectModal';
import { useRouteReqs } from './hooks/routeReq.useRouteReqs';
import { db } from '../../shared/services/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { FunctionsAPI } from '../../shared/services/functions.api';

const RouteReq = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // States for accepting request
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [acceptRequest, setAcceptRequest] = useState(null);
  const [fare, setFare] = useState('10');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [customSeatingCapacity, setCustomSeatingCapacity] = useState('');
  const [processing, setProcessing] = useState(false);

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
    const fetchResources = async () => {
      try {
        const driversSnap = await getDocs(collection(db, 'drivers'));
        const driversList = driversSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDrivers(driversList);

        const vehiclesSnap = await getDocs(collection(db, 'vehicles'));
        const vehiclesList = vehiclesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicles(vehiclesList);
      } catch (err) {
        console.error("Error fetching drivers/vehicles:", err);
      }
    };
    fetchResources();
  }, []);

  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);
      if (vehicle && vehicle.seatingCapacity) {
        setCustomSeatingCapacity(String(vehicle.seatingCapacity));
      } else {
        setCustomSeatingCapacity('');
      }
    } else {
      setCustomSeatingCapacity('');
    }
  }, [selectedVehicleId, vehicles]);

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

  const handleAccept = (req) => {
    setAcceptRequest(req);
    setIsAcceptModalOpen(true);
  };

  const submitAcceptRouteRequest = async () => {
    setProcessing(true);
    try {
      const driver = drivers.find(d => d.id === selectedDriverId);
      const vehicle = vehicles.find(v => v.id === selectedVehicleId);

      const res = await FunctionsAPI.processRouteRequest({
        routeRequestId: acceptRequest.id,
        fare: parseFloat(fare),
        driverId: selectedDriverId,
        driverName: driver ? driver.name : "",
        vehicleId: selectedVehicleId,
        vehicleReg: vehicle ? vehicle.registrationNo : "",
        seatingCapacity: parseInt(customSeatingCapacity) || 0,
      });

      if (res.success) {
        alert("Route Request successfully accepted and processed!");
        setIsAcceptModalOpen(false);
        setAcceptRequest(null);
        setSelectedDriverId('');
        setSelectedVehicleId('');
        setFare('10');
        setCustomSeatingCapacity('');
        fetchRequests({ searchTerm, statusFilter, dateFilter });
      } else {
        alert(res.error || "An error occurred while processing the request.");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to process route request.");
    } finally {
      setProcessing(false);
    }
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
          <div className="flex items-center justify-center px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
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

      {isAcceptModalOpen && acceptRequest && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsAcceptModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl rounded-3xl p-6 overflow-hidden animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Assign Route & Trip</h3>
              <button onClick={() => setIsAcceptModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Driver Assignment</label>
                <select
                  value={selectedDriverId}
                  onChange={(e) => setSelectedDriverId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="">Select a Driver</option>
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.mobile || "No phone"})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Vehicle Assignment</label>
                <select
                  value={selectedVehicleId}
                  onChange={(e) => setSelectedVehicleId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="">Select a Vehicle</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.registrationNo} - {v.make} {v.model}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Route Fare (£)</label>
                <input
                  type="number"
                  value={fare}
                  onChange={(e) => setFare(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Seating Capacity</label>
                <input
                  type="number"
                  value={customSeatingCapacity}
                  onChange={(e) => setCustomSeatingCapacity(e.target.value)}
                  placeholder="e.g. 15"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-indigo-500 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsAcceptModalOpen(false)}
                className="flex-1 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={submitAcceptRouteRequest}
                disabled={
                  processing || 
                  !selectedDriverId || 
                  !selectedVehicleId || 
                  !fare || 
                  !customSeatingCapacity || 
                  parseInt(customSeatingCapacity) <= 0
                }
                className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Confirm & Process'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteReq;