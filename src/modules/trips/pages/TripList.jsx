import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Eye, MapPin, Calendar, Loader2, ArrowRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader, StatusBadge } from '../../../components/Shared';
import { Table } from '../../../shared/Table/Table';
import { useTrips } from '../hooks/trip.useTrips';
import { useToast } from '../../../shared/hooks/ToastContext';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import DeleteModal from '../../../shared/DeleteModal/DeleteModal';
import { collection, query, where, getCountFromServer } from 'firebase/firestore';

import { db } from '../../../shared/services/firebase';


export const TripList = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeFilter, setActiveFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [cancelModal, setCancelModal] = useState({ isOpen: false, trip: null });
  const [cancelling, setCancelling] = useState(false);
  const [confirmedPaymentsCount, setConfirmedPaymentsCount] = useState(0);
  const [loadingPaymentsCount, setLoadingPaymentsCount] = useState(false);
  const [initiateRefund, setInitiateRefund] = useState(false);
  const { trips, hasMore, fetchTrips, loading } = useTrips();

  useEffect(() => {
    fetchTrips({ searchQuery, activeFilter });
  }, [searchQuery, activeFilter, fetchTrips]);

  const handleClear = () => {
    setActiveFilter('');
    setSearchQuery('');
  };

  const handleView = (trip) => {
    const docId = String(trip?.id || trip?.docId || '').replace('#', '');
    if (docId) navigate(`/trips/view/${docId}`);
  };

  const handleEdit = (trip) => {
    const docId = String(trip?.id || trip?.docId || '').replace('#', '');
    if (docId) navigate(`/trips/edit/${docId}`);
  };

  const handleCancelClick = (trip) => {
    setCancelModal({ isOpen: true, trip });
  };

  const confirmCancel = async () => {
    if (!cancelModal.trip) return;
    setCancelling(true);
    try {
      const docId = String(cancelModal.trip.id || cancelModal.trip.docId || '').replace('#', '');
      const response = await FunctionsAPI.cancelTrip({
        tripId: docId,
        refund: initiateRefund
      });

      console.log('Cancel Trip Response:', response);

      if (response?.success === false) {
        throw new Error(response.error || 'Failed to cancel trip');
      }

      showToast(response?.message || 'Trip cancelled successfully', 'success');
      fetchTrips({ searchQuery, activeFilter });
    } catch (error) {
      console.error('Error cancelling trip:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Unknown error occurred';
      showToast(`Error cancelling trip: ${errorMessage}`, 'error');
    } finally {
      setCancelling(false);
      setCancelModal({ isOpen: false, trip: null });
    }
  };

  useEffect(() => {
    if (!cancelModal.isOpen || !cancelModal.trip) {
      setConfirmedPaymentsCount(0);
      setInitiateRefund(false);
      return;
    }

    const fetchConfirmedCount = async () => {
      setLoadingPaymentsCount(true);

      try {
        const docId = String(
          cancelModal.trip.id ||
          cancelModal.trip.docId ||
          ''
        ).replace('#', '');

        const colRef = collection(db, 'finance');
        console.log(docId)
        const q = query(
          collection(db, 'finance'),
          where('status', '==', 'Confirmed'),
          where('tripId', '==', docId),
          where('paymentStatus', '==', 'complete')
        );

        const snapshot = await getCountFromServer(q);
        console.log(snapshot.data().count)
        setConfirmedPaymentsCount(snapshot.data().count);

      } catch (error) {
        console.error(error);
      } finally {
        setLoadingPaymentsCount(false);
      }
    };

    fetchConfirmedCount();
  }, [cancelModal.isOpen, cancelModal.trip]);





  return (
    <div className="animate-in fade-in duration-700">
      <SectionHeader
        title="Fleet Operations"
        subtitle="Orchestrate trip schedules, resource allocation, and mission deployment across the network."
        actionLabel="Schedule Trip"
        actionIcon={Plus}
        actionTo="/trips/add"
      />

      <div className="pb-10">
        <Table
          headers={['Sl No', 'Trip ID', 'Date', 'Asset & Operator', 'Route Intelligence', 'Operational Status']}
          data={trips}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onClear={handleClear}
          searchPlaceholder="Search operations (ID, Driver, Registration)..."
          filterOptions={[
            { label: 'Active', value: 'Active' },
            { label: 'Completed', value: 'Completed' },
            { label: 'Cancelled', value: 'Cancelled' },
          ]}
          renderRow={(trip, idx) => (
            <>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{idx + 1}</td>
              <td className="px-8 py-4 text-[13px] font-black text-slate-800">{trip.tripId || 'N/A'}</td>

              <td className="px-8 py-4">
                <div className="flex flex-col">
                  {/* <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      ID: {trip.tripId}
                    </span>
                  </div> */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[13px] font-black text-slate-700 tracking-tight">
                      {trip.selectedDates?.length || 0} Scheduled Dates
                    </span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                    {Array.isArray(trip?.selectedDates) && typeof trip.selectedDates[0] === 'string' ? trip.selectedDates[0] : 'No dates'}
                  </div>
                </div>
              </td>

              {/* Asset & Operator */}
              <td className="px-8 py-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-black text-slate-800 tracking-tight">{typeof trip?.driver_name === 'string' ? trip.driver_name : 'Unknown Operator'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-600 tracking-tight">{typeof trip?.vehicle_reg === 'string' ? trip.vehicle_reg : 'Unregistered'}</span>
                  </div>
                </div>
              </td>

              {/* Route Intelligence */}
              <td className="px-8 py-4">
                <div className="flex flex-col max-w-xs">
                  <span className="text-[13px] font-black text-slate-800 tracking-tight truncate mb-1">
                    {typeof trip?.route_name === 'string' ? trip.route_name : 'Unnamed Route'}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                    <MapPin className="w-3 h-3 text-emerald-500" />
                    <span className="truncate">{Array.isArray(trip?.routes) && typeof trip.routes[0] === 'string' ? trip.routes[0] : '...'}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="truncate">{Array.isArray(trip?.routes) && typeof trip.routes[trip.routes.length - 1] === 'string' ? trip.routes[trip.routes.length - 1] : '...'}</span>
                  </div>
                </div>
              </td>

              {/* Service Parameters */}
              {/* <td className="px-8 py-4">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Type</span>
                    <span className="text-[10px] font-black text-slate-700 uppercase">{typeof trip?.route_type === 'string' ? trip.route_type : 'CORE'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Capacity</span>
                    <span className="text-[10px] font-black text-slate-700">{typeof trip?.total_seats === 'number' || typeof trip?.total_seats === 'string' ? trip.total_seats : '0'} PAX</span>
                  </div>
                </div>
              </td> */}

              {/* Operational Status */}
              <td className="px-8 py-4 text-center">
                <StatusBadge
                  status={String(trip.status || '')}
                  statusColor={
                    trip.status === 'Active' ? 'success' :
                      trip.status === 'Completed' ? 'primary' : 'danger'
                  }
                />
              </td>
            </>
          )}
          actions={(trip) => (
            <div className="flex items-center gap-2">
              {trip.route_type === 'flexi' && (
                <button
                  onClick={() => handleCancelClick(trip)}
                  disabled={trip.status === 'Cancelled'}
                  className={`p-2.5 bg-white border border-slate-200 text-slate-500 rounded-xl transition-all ${trip.status === 'Cancelled'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:text-red-500 hover:border-red-100 hover:shadow-lg active:scale-95'
                    }`}
                  title="Cancel Trip"
                >
                  <XCircle className="w-4 h-4" />
                </button>


              )}
              <button
                onClick={() => handleView(trip)}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="View Operational Dossier"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(trip)}
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-amber-600 hover:border-amber-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Update Schedule"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                className="p-2.5 bg-white border border-slate-200 text-slate-500 hover:text-red-500 hover:border-red-100 rounded-xl transition-all hover:shadow-lg active:scale-95"
                title="Terminate Trip"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        />

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => fetchTrips({ searchQuery, activeFilter, isLoadMore: true })}
              disabled={loading}
              className="px-10 py-3 bg-white border border-slate-200 text-slate-500 font-black text-[11px] uppercase tracking-[0.2em] rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center gap-3"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />}
              {loading ? 'Syncing Operations...' : 'Load More Operational Logs'}
            </button>
          </div>
        )}
      </div>

      <DeleteModal
        isOpen={cancelModal.isOpen}
        onClose={() => setCancelModal({ isOpen: false, trip: null })}
        onConfirm={confirmCancel}
        title="Cancel Trip"
        message={
          loadingPaymentsCount
            ? "Checking active bookings..."
            : confirmedPaymentsCount > 0
              ? `There are ${confirmedPaymentsCount} confirmed booking(s) for this trip.`
              : "Are you sure you want to cancel this trip?"
        }
        itemName={`Trip #${cancelModal.trip?.tripId || ''}`}
        confirmText="Yes, Cancel Trip"
        loading={cancelling}
      >
        {confirmedPaymentsCount > 0 &&
          !loadingPaymentsCount && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4 mb-6">

              <input
                type="checkbox"
                id="initiateRefundCheckbox"
                checked={initiateRefund}
                onChange={(e) =>
                  setInitiateRefund(e.target.checked)
                }
                className="w-4 h-4 text-red-600 border-slate-300 rounded"
              />

              <label
                htmlFor="initiateRefundCheckbox"
                className="text-xs font-bold text-slate-700 cursor-pointer"
              >
                Initiate refund for confirmed customers
              </label>

            </div>
          )}
      </DeleteModal>
    </div>
  );
};
