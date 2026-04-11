import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Car,
  Clock,
  Navigation,
  DollarSign,
  Accessibility,
  Edit,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Layers,
  ShieldCheck,
  TrendingUp,
  Globe,
  XCircle,
  Users,
  Handshake,
  FileText,
  PhoneCall,
  Hash,
  Milestone,
  User2
} from 'lucide-react';
import { StatusBadge } from '../../components/Shared';
import { bookingsData } from '../../data/mockData';

export const ViewBooking = () => {
  const { id } = useParams();
  const booking = bookingsData.find(b => b.booking_id === id);

  if (!booking) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/60 shadow-sm animate-in zoom-in duration-300">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Booking Mission Not Found</h3>
        <p className="text-slate-500 mt-1 mb-6">The requested booking record could not be retrieved from the central registry.</p>
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Registry
        </Link>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'success';
      case 'IN TRANSIT': return 'primary';
      case 'PENDING': return 'warning';
      case 'CANCELLED': return 'danger';
      case 'APPROVED': return 'success';
      default: return 'slate';
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500 font-jakarta">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4 text-sm">
        <div className="flex items-center gap-4">
          <Link to="/bookings" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Booking: {booking.booking_id}</h2>
              <StatusBadge status={booking.status} statusColor={getStatusColor(booking.status)} />
            </div>
            <p className="text-slate-500 font-medium mt-1">Full operational record and journey logs for request reference {booking.req_ref}.</p>
          </div>
        </div>
        <Link
          to={`/bookings/edit/${id}`}
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20"
        >
          <Edit className="w-4.5 h-4.5" /> Edit Booking
        </Link>
      </div>

      <div className="space-y-8">
        {/* Section 1: Core Request Basis */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Hash className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Core Request Basis</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Req Ref</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-700 font-bold border border-slate-100">{booking.req_ref}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Booking ID</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-800 font-bold border border-slate-200 shadow-sm">{booking.booking_id}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Request Date</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{booking.req_date}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Source Channel</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  {booking.channel}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Status</label>
                <div className="pt-1 pl-1">
                  <StatusBadge status={booking.status} statusColor={getStatusColor(booking.status)} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Passenger Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Passenger Credentials</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Full Name</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex items-center gap-2">
                  <User2 className="w-3.5 h-3.5 text-slate-400" />
                  {booking.name || 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Phone Contact</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {booking.phone || 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Email Registry</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 truncate flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {booking.email || 'N/A'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Passenger Count</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" />
                  {booking.p_count}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Journey Pathway */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Navigation className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Journey Pathway</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Pickup Date/Time</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {booking.pickup_date}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Pickup Location</label>
                <p className="px-4 py-3 rounded-xl bg-slate-50 text-slate-800 font-bold border border-slate-100 flex items-center gap-2 text-base">
                  <MapPin className="w-4 h-4 text-primary-600 shrink-0" />
                  {booking.pickup}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Destination Address</label>
                <p className="px-4 py-3 rounded-xl bg-indigo-50/30 text-slate-800 font-bold border border-indigo-100 flex items-center gap-2 text-base">
                  <Navigation className="w-4 h-4 text-indigo-600 shrink-0" />
                  {booking.destination}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Actual Dropoff</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-bold border border-slate-200 italic">
                  {booking.actual_dropoff || booking.destination}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Final Drop Time</label>
                <p className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {booking.drop_time || 'Pending Arrival'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Financial Logistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <DollarSign className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Financial Logistics</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] bg-white/20 font-semibold text-slate-500 uppercase tracking-wider block pl-1">Calculated Fare</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex justify-between">
                  <span>{booking.fare}</span>
                  <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded uppercase tracking-widest">{booking.payment}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Fare Logic Date</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{booking.fare_date}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Verification Status</label>
                <div className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200 flex items-center justify-between">
                  <span>{booking.fare_confirm === 'Yes' ? 'Confirmed' : 'Unverified'}</span>
                  {booking.fare_confirm === 'Yes' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-amber-500" />}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Confirmation Date</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-semibold border border-slate-200">{booking.fare_confirm_date || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Confirmation Channel</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{booking.fare_channel || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Paid Amount</label>
                <p className="px-4 py-3 rounded-xl bg-emerald-50 text-emerald-700 font-black border border-emerald-100">{booking.paid}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Constraints & Safety */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <Accessibility className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Constraints & Safety Parameters</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Access Requirements</label>
                <p className={`px-4 py-3 rounded-xl font-bold border ${booking.access_need === 'Yes' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {booking.access_need === 'Yes' ? 'NEEDS ASSISTANCE' : 'STANDARD ACCESS'}
                </p>
              </div>
              <div className="space-y-1.5 md:col-span-1 lg:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Access Details / Specific Notes</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-medium italic border border-slate-200 min-h-[46px]">
                  {booking.access_details || 'No specific accessibility requirements logged.'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">3rd Row Warning</label>
                <p className={`px-4 py-3 rounded-xl font-bold border ${booking.third_row_warn === 'Yes' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-white text-slate-500 border-slate-200'}`}>
                  {booking.third_row_warn === 'Yes' ? 'WARNING ACTIVE' : 'NO WARNING'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">PSV Consent Log</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">
                  {booking.psv_consent === 'Yes' ? 'GRANTED' : 'PENDING/DECLINED'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 6: Asset & Resource Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Operational Asset & Management</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Accepted By</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{booking.accepted_by || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Dispatched By</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-700 font-bold border border-slate-200">{booking.dispatched_by || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Primary Driver</label>
                <div className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-black border border-indigo-100 flex items-center gap-2">
                  <User className="w-3.5 h-3.5" />
                  {booking.driver || 'UNASSIGNED'}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Driver License Ref</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-semibold border border-slate-200">{booking.driver_lic || 'N/A'}</p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Vehicle Asset NO.</label>
                <p className="px-4 py-3 rounded-xl text-gray-800 font-black border border-slate-800 flex items-center gap-2">
                  <Car className="w-3.5 h-3.5" />
                  {booking.vehicle_reg || 'NONE'}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Asset License Ref</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-semibold border border-slate-200">{booking.vehicle_lic || 'N/A'}</p>
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1">Multi-Asset / Other Drivers</label>
                <p className="px-4 py-3 rounded-xl bg-white text-slate-600 font-medium border border-slate-200">{booking.other_drivers || 'No additional assets allocated.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 7: Lifecycle Exceptions & Logistics */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Handshake className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Operational Exceptions & Audit</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className={`p-4 rounded-2xl border ${booking.subcontracted === 'Yes' ? 'bg-blue-50 border-blue-100 shadow-inner' : 'bg-slate-50/50 border-slate-100'}`}>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3 pl-1">Subcontracted Asset Logic</label>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <span className="font-bold">{booking.subcontracted === 'Yes' ? 'YES' : 'NO'}</span>
                  </div>
                  {booking.subcontracted === 'Yes' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Partner:</span>
                        <span className="font-bold text-blue-700">{booking.subcontract_to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Handoff DT:</span>
                        <span className="font-bold">{booking.subcontract_date}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className={`p-4 rounded-2xl border ${booking.cancelled === 'Yes' ? 'bg-red-50 border-red-100 shadow-inner' : 'bg-slate-50/50 border-slate-100'}`}>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-3 pl-1">Cancellation Incident Log</label>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Terminated:</span>
                    <span className={`font-bold ${booking.cancelled === 'Yes' ? 'text-red-600' : ''}`}>{booking.cancelled === 'Yes' ? 'YES' : 'NO'}</span>
                  </div>
                  {booking.cancelled === 'Yes' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Authority:</span>
                        <span className="font-bold text-red-700">{booking.cancel_by}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Canceled Date:</span>
                        <span className="font-bold">{booking.cancel_date}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2 lg:col-span-1 border border-slate-100 p-4 rounded-2xl bg-white shadow-sm">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block pl-1"> Notes</label>
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                  {booking.notes || 'No operational remarks recorded by the tactical team.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
