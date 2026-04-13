import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Users,
  Car,
  DollarSign,
  Navigation,
  Leaf,
  FileText,
  Calendar,
  Edit,
  ArrowLeft,
  TrendingUp,
  CreditCard,
  Briefcase,
  Smartphone,
  Hash,
  Globe,
  Milestone,
  ArrowRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { StatusBadge } from '../../components/Shared';
import { tripsData } from '../../data/mockData';

export const ViewTrip = () => {
  const { id } = useParams();
  const trip = tripsData.find(t => t.trip_id === id);

  if (!trip) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Trip Not Found</h3>
        <p className="text-slate-500 mt-1 mb-6">The specified Mission ID does not exist in the decentralized database.</p>
        
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'IN TRANSIT': return 'primary';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      default: return 'slate';
    }
  };

  const revenue = trip.price ? parseFloat(trip.price.replace('₹', '').replace(',', '')) : 0;
  const profit = trip.profit ? parseFloat(trip.profit.replace('₹', '').replace(',', '')) : 0;

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Trip Details: {trip.trip_id}</h2>
              <StatusBadge status={trip.status} statusColor={getStatusColor(trip.status)} />
            </div>
            <p className="text-slate-500 font-medium mt-1">Operational audit and mission overview for selected trip ID.</p>
          </div>
        </div>
        <Link
          to={`/trips/add/${id}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-700 text-white rounded-xl font-bold text-sm hover:bg-primary-800 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4.5 h-4.5" /> Edit Trip
        </Link>
      </div>

      <div className="space-y-8 text-sm">
        {/*  Basic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Hash className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Basic Information</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip ID</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-100">{trip.trip_id}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Assigned Driver</label>
                <div className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white text-[10px]">{trip.driver.charAt(0)}</div>
                  <span>{trip.driver}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">License Reference</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-semibold border border-slate-200">{trip.driver_lic || 'DL-3994-01'}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Vehicle Registration</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100">{trip.vehicle_reg}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 pt-6 border-t border-slate-50">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Trip Date & Time</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{trip.trip_date} • {trip.start_time}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Bookings</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-bold border border-slate-100">{trip.total_bookings} Bookings</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Booking IDs</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {trip.booking_ids?.split(',').map(bid => (
                    <Link key={bid} to={`/bookings/view/${bid.trim()}`} className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-primary-600 font-bold text-[10px] hover:bg-primary-50 transition-colors">
                      {bid.trim()}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Remarks</label>
                <div className="px-4 py-3 rounded-xl bg-yellow-50/30 text-slate-600 font-medium italic border border-yellow-100 min-h-[46px]">
                  {trip.notes || 'No remarks recorded.'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Execution & Route Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Milestone className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight"> Route Details</h3>
          </div>

          <div className="p-6">
            <div className="mb-8 p-6 rounded-2xl bg-slate-50 border border-slate-100 relative">
              <div className="flex items-center justify-between gap-8">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Departure</p>
                  <p className="text-lg font-bold text-slate-900">{trip.start_loc}</p>
                </div>
                <div className="flex flex-col items-center gap-1 group">
                  <div className="h-px w-24 sm:w-48 bg-gradient-to-r from-primary-200 via-primary-500 to-emerald-200 relative mb-2">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                      <ArrowRight className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                  </div>
                  <StatusBadge status={trip.status} statusColor={getStatusColor(trip.status)} />
                </div>
                <div className="flex-1 text-right">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                  <p className="text-lg font-bold text-slate-900">{trip.end_loc}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Estimated Departure</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{trip.start_time}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Estimated Arrival</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{trip.end_time}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Route</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{trip.route}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Actual Destination</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-emerald-700">{trip.actual_dest || trip.route}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-8 pt-6 border-t border-slate-50">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Passenger Count</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{trip.total_pcount}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Total Miles</label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-200">
                  <Navigation className="w-4 h-4 text-slate-500" />
                  <span className="font-bold text-slate-800">{trip.miles || '0'} Miles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Financial Summary</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="space-y-1.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Gross Revenue</label>
                <p className="text-lg font-bold text-slate-900">{trip.price}</p>
              </div>

              <div className="space-y-1.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Driver Cost</label>
                <p className="text-lg font-bold text-red-600">-{trip.driver_cost || '₹0'}</p>
              </div>

              <div className="space-y-1.5 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-0.5">Fuel Economy</label>
                <p className="text-lg font-bold text-slate-700">{trip.saved_money || '₹0'}</p>
              </div>

              <div className="space-y-1.5 px-4 py-3 rounded-xl bg-primary-50 border border-primary-100">
                <label className="text-[11px] font-semibold text-primary-700 uppercase tracking-wider block mb-0.5">Net Profit</label>
                <div className="flex items-center gap-3">
                  <p className="text-xl font-extrabold text-primary-700">{trip.profit || '₹0'}</p>
                </div>
              </div>

              <div className="space-y-1.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <label className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider block mb-0.5">CO2 Savings</label>
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <p className="text-lg font-bold text-emerald-700">{trip.co2_saved || '0.0'} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
