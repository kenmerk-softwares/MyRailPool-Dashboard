import React from 'react';
import {
  ArrowLeft,
  Save,
  User,
  MapPin,
  CreditCard,
  Calendar,
  Smartphone,
  Users,
  Accessibility,
  Info,
  Clock,
  Navigation,
  CheckCircle,
  Hash,
  Globe,
  Handshake,
  XCircle,
  ShieldCheck,
  FileText,
  DollarSign,
  Briefcase
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { bookingsData } from '../../data/mockData';

export const EditBooking = () => {
  const { id } = useParams();

  // Find the booking data by ID
  const booking = bookingsData.find(b => b.booking_id === id) || bookingsData[0];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Edit Booking {id}</h2>
          <p className="text-sm md:text-base text-slate-500 mt-1">Update operational details and mission status for this request.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Core Request Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Hash className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Core Request Basis</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Req Ref</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.req_ref} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking ID</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.booking_id} readOnly />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Request Date</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.req_date} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Source Channel</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.channel}>
                <option value="Website">Website</option>
                <option value="App">Mobile App</option>
                <option value="Call">Phone Call</option>
                <option value="WhatsApp Business">WhatsApp Business</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white font-bold text-primary-700 uppercase" defaultValue={booking.status}>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="IN TRANSIT">IN TRANSIT</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          </div>
        </div>

        {/* Client & Passenger Credentials */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Passenger Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider"> Name</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.name} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
              <input type="tel" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.phone} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
              <input type="email" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.email} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passenger Count</label>
              <input type="number" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.p_count} />
            </div>
          </div>
        </div>

        {/* Journey Information */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Navigation className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Journey Pathway</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Date/Time</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.pickup_date} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pickup Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.pickup} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</label>
              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input type="text" className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.destination} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Actual Dropoff (Ref)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.actual_dropoff} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Drop Time</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.drop_time} />
            </div>
          </div>
        </div>

        {/* Financial Logistics */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <DollarSign className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Financial Logistics</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fare (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.fare} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fare Date</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.fare_date} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fare Confirm</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.fare_confirm}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fare Confirm Date</label>
              <input type="datetime-local" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.fare_confirm_date} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fare Channel</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.fare_channel}>
                <option value="Call">Phone Call</option>
                <option value="WhatsApp Business">WhatsApp Business</option>
                <option value="Email">Email</option>
                <option value="In-Person">In-Person</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.payment}>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Online">Online / Card</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Amount (₹)</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.paid} />
            </div>
          </div>
        </div>

        {/* Operational Constraints & Special Needs */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Accessibility className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Constraints & Safety</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Needs?</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.access_need}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Access Details</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.access_details} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">3rd Row Warning</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white font-bold text-amber-600" defaultValue={booking.third_row_warn}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">PSV Consent</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.psv_consent}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resource Allocation & Dispatch */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Operational Asset & Management</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accepted By</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.accepted_by} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dispatched By</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.dispatched_by} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Primary Driver</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.driver} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver License ref</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.driver_lic} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle NO.</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.vehicle_reg} />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vehicle License Ref</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.vehicle_lic} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Other Drivers / Multi-Asset</label>
              <input type="text" className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all" defaultValue={booking.other_drivers} />
            </div>
          </div>
        </div>

        {/* Subcontracting & Cancellation Logic */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden text-sm">
          <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-2 bg-slate-50/50">
            <Handshake className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 tracking-tight">Lifecycle Exception Logic</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 bg-blue-50/30 p-4 rounded-2xl border border-blue-100 shadow-inner">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subcontracted?</label>
              <select className="w-full px-4 py-2.5 mt-1 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white" defaultValue={booking.subcontracted}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
              <div className="mt-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Subcontract To</label>
                <input type="text" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs" defaultValue={booking.subcontract_to} />
              </div>
              <div className="mt-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Contract Date</label>
                <input type="datetime-local" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs" defaultValue={booking.subcontract_date} />
              </div>
            </div>

            <div className="space-y-2 bg-red-50/30 p-4 rounded-2xl border border-red-100 shadow-inner">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancelled?</label>
              <select className="w-full px-4 py-2.5 mt-1 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all bg-white font-bold text-red-600" defaultValue={booking.cancelled}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
              <div className="mt-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Cancelled By</label>
                <input type="text" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs" defaultValue={booking.cancel_by} />
              </div>
              <div className="mt-3 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Cancel Date</label>
                <input type="datetime-local" className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs" defaultValue={booking.cancel_date} />
              </div>
            </div>

            <div className="space-y-2 p-4">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider"> Remarks</label>
              <textarea className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all h-[155px]" defaultValue={booking.notes} placeholder="Detailed notes regarding this request..."></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Link to="/bookings" className="px-8 py-3 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all hover:bg-red-100">Discard Changes</Link>
        <button className="text-sm bg-primary-800 text-white px-6 py-3 rounded-xl font-black uppercase tracking-wider hover:bg-primary-900 active:bg-primary-900 transition-all shadow-xl shadow-primary-600/30 flex items-center gap-2">
          <Save className="w-4 h-4" /> Update Booking
        </button>
      </div>
    </div>
  );
};

