import React from 'react';
import {
  Save,
  User,
  Phone,
  Mail,
  MapPin,
  Award,
  Calendar,
  Shield,
  ShieldCheck,
  FileText,
  Stethoscope,
  GraduationCap,
  Bell,
  Activity,
  UserCheck,
  Briefcase,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { driversData } from '../../data/mockData';

export const EditDriver = () => {
  const { id } = useParams();
  const driver = driversData.find(d => d.driver_id.replace('#', '') === id) || driversData[0];

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Operator {driver.driver_id}</h2>
            <p className="text-slate-500 font-medium mt-1">Modify compliance records and operational parameters for {driver.name}.</p>
          </div>
        </div>
      </div>

      <div className="space-y-8 text-sm">
        {/* Section 1: Identity & Communication */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-primary-50 rounded-lg">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Identity & Communication</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.name} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Operator ID</label>
                <div className="relative">
                  <Info className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.driver_id} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Account Status</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-primary-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer" defaultValue={driver.status}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.phone} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.email} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Residential Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.address} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Licensing Jurisdictions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Shield className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing Jurisdictions</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH License Number</label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.ph_lic} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">PH Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.ph_exp} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DVLA License Number</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.dvla_lic} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DVLA Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.dvla_exp} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DBS Certificate Number</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.dbs_no} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">DBS Date of Issue</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.dbs_date} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Operative Compliance */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Operative Compliance</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Medical Exemption</label>
                <div className="relative">
                  <Stethoscope className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none" defaultValue={driver.medical_ex}>
                    <option value="No">No Exemption</option>
                    <option value="Yes">Exemption Active</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Status</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none" defaultValue={driver.training_done}>
                    <option value="No">Pending</option>
                    <option value="Yes">Completed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Signed Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.training_date} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Council Notified</label>
                <div className="relative">
                  <Bell className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer appearance-none" defaultValue={driver.council_notified}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Right to Work Verified Date</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.rtw_date} />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Right to Work Note</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.rtw_note} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Lifecycle Management */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Lifecycle Management</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Start Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.start_date} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Contract End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="date" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.end_date} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Termination Reason</label>
                <div className="relative">
                  <AlertCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all" defaultValue={driver.termination_reason} />
                </div>
              </div>

              <div className="lg:col-span-3 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Confidential Notes</label>
                <div className="relative">
                  <Activity className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <textarea rows="3" className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none" defaultValue={driver.notes}></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-end gap-4 px-4">
        <Link to="/drivers" className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all text-sm">
          Cancel Updates
        </Link>
        <button className="bg-primary-600 text-white px-10 py-3.5 rounded-xl font-bold text-sm hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/20 flex items-center gap-2.5">
          <Save className="w-4 h-4" /> Update Driver
        </button>
      </div>
    </div>
  );
};
