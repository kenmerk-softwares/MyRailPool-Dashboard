import { DriverValidationSchema } from '../../../shared/utils/Validations/DriverValidation';
import React, { useState } from 'react';
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
  GraduationCap,
  Activity,
  UserCheck,
  AlertCircle,
  Loader2,
  Lock,
  Bell,
  Stethoscope,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';

export const AddDriver = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
    mobile: '',
    email: '',
    address: '',
    phLicenseNumber: '',
    phExpiryDate: '',
    dvlaLicenseNumber: '',
    dvlaExpiryDate: '',
    dbsCertificateNumber: '',
    dbsDateOfIssue: '',
    medicalExemption: 'No',
    trainingStatus: 'No',
    trainingSignedDate: '',
    councilNotified: 'Yes',
    rtwVerifiedDate: '',
    rtwNote: '',
    serviceStartDate: '',
    contractEndDate: '',
    terminationReason: '',
    confidentialNotes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = DriverValidationSchema.validate(formData, { abortEarly: false, allowUnknown: true });
    if (error) {
      const newErrors = {};
      error.details.forEach(err => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      showToast("Please check mandatory fields", "error");
      return;
    }

    setErrors({});
    setLoading(true);
    try {
      const res = await FunctionsAPI.addDriver({
        type: "add",
        fields: {
          ...formData,
          searchKey: formData.name ? formData.name.toLowerCase() : ""
        }
      });

      if (res.success) {
        showToast("Driver profile created successfully!", "success");
        navigate('/drivers');
      } else {
        showToast(res.error || "Failed to create driver profile", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  // Shared input class builder
  const inputCls = (field) =>
    `w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] ${errors[field] ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`;

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-full mx-auto pb-12 px-2 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden">

        {/* ── Section 1: Identity & Contact ── */}
        <div className="space-y-4 mt-4">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <User className="w-4 h-4 text-indigo-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Identity & Contact</h3>
          </div>

          <div className="px-6 pb-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Full Legal Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" name="name" value={formData.name} onChange={handleChange}
                    className={inputCls('name')} placeholder="e.g. Alexander Hamilton"
                  />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email" name="email" value={formData.email} onChange={handleChange}
                    className={inputCls('email')} placeholder="driver@myrailpool.com"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Mobile <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel" name="mobile" value={formData.mobile} onChange={handleChange}
                    className={inputCls('mobile')} placeholder="+44 7000 000000"
                  />
                </div>
                {errors.mobile && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status" value={formData.status} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-indigo-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="active">🟢 Active</option>
                  <option value="inactive">⚪ Inactive</option>
                  <option value="on_leave">🟡 On Leave</option>
                  <option value="suspended">🔴 Suspended</option>
                </select>
              </div>

              {/* Address */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Residential Address
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  <textarea
                    rows="2" name="address" value={formData.address} onChange={handleChange}
                    className={`${inputCls('address')} py-3 resize-none`} placeholder="Street, City, Postcode"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ── Section 2: Licensing & Compliance ── */}
        <div className="mt-6">
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Licensing & Compliance</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* PH License */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  PH License No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" name="phLicenseNumber" value={formData.phLicenseNumber} onChange={handleChange}
                    className={inputCls('phLicenseNumber')} placeholder="PH-LIC-000"
                  />
                </div>
                {errors.phLicenseNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phLicenseNumber}</p>}
              </div>

              {/* PH Expiry */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  PH Expiry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="phExpiryDate" value={formData.phExpiryDate} onChange={handleChange}
                    className={inputCls('phExpiryDate')}
                  />
                </div>
                {errors.phExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phExpiryDate}</p>}
              </div>

              {/* DVLA License */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  DVLA License No <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" name="dvlaLicenseNumber" value={formData.dvlaLicenseNumber} onChange={handleChange}
                    className={inputCls('dvlaLicenseNumber')} placeholder="DVLA-000"
                  />
                </div>
                {errors.dvlaLicenseNumber && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaLicenseNumber}</p>}
              </div>

              {/* DVLA Expiry */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  DVLA Expiry <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="dvlaExpiryDate" value={formData.dvlaExpiryDate} onChange={handleChange}
                    className={inputCls('dvlaExpiryDate')}
                  />
                </div>
                {errors.dvlaExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaExpiryDate}</p>}
              </div>

              {/* DBS Certificate */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  DBS Certificate No
                </label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text" name="dbsCertificateNumber" value={formData.dbsCertificateNumber} onChange={handleChange}
                    className={inputCls('dbsCertificateNumber')} placeholder="DBS-000"
                  />
                </div>
              </div>

              {/* DBS Date of Issue */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                  DBS Issue Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="dbsDateOfIssue" value={formData.dbsDateOfIssue} onChange={handleChange}
                    className={inputCls('dbsDateOfIssue')}
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 3: Deployment & Safety ── */}
        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Deployment & Safety</h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Service Start */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Start</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="serviceStartDate" value={formData.serviceStartDate} onChange={handleChange}
                    className={inputCls('serviceStartDate')}
                  />
                </div>
              </div>

              {/* Contract End */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Contract End</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleChange}
                    className={inputCls('contractEndDate')}
                  />
                </div>
              </div>

              {/* RTW Verified Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">RTW Verified</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="rtwVerifiedDate" value={formData.rtwVerifiedDate} onChange={handleChange}
                    className={inputCls('rtwVerifiedDate')}
                  />
                </div>
              </div>

              {/* Training Signed Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Signed</label>
                <div className="relative">
                  <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="date" name="trainingSignedDate" value={formData.trainingSignedDate} onChange={handleChange}
                    className={inputCls('trainingSignedDate')}
                  />
                </div>
              </div>

              {/* Medical Exemption */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Medical Exemption</label>
                <select
                  name="medicalExemption" value={formData.medicalExemption} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {/* Training Status */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Status</label>
                <select
                  name="trainingStatus" value={formData.trainingStatus} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="No">Pending</option>
                  <option value="Yes">Inducted</option>
                </select>
              </div>

              {/* Council Notified */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Council Notified</label>
                <select
                  name="councilNotified" value={formData.councilNotified} onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              {/* Termination Reason */}
              <div className="md:col-span-4 space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Termination Reason</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <textarea
                    rows="2" name="terminationReason" value={formData.terminationReason} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none text-sm"
                    placeholder="Leave blank if active..."
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Section 4: Confidential Records ── */}
        <div>
          <div className="px-6 py-2 border-b border-slate-100 flex items-center gap-3 bg-rose-50/30">
            <div className="p-2 bg-rose-50 rounded-lg">
              <Lock className="w-4 h-4 text-rose-600" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Confidential Records</h3>
            <span className="ml-auto text-[10px] font-black text-rose-400 uppercase tracking-widest">Internal Only</span>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* RTW Note */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">RTW Verification Note</label>
                <div className="relative">
                  <FileText className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <textarea
                    rows="3" name="rtwNote" value={formData.rtwNote} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50/30 text-slate-800 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none text-sm placeholder:text-slate-500"
                    placeholder="Enter RTW validation logs..."
                  />
                </div>
              </div>

              {/* Confidential Notes */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Internal Performance Notes</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                  <textarea
                    rows="3" name="confidentialNotes" value={formData.confidentialNotes} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border-[1.5px] border-slate-200 bg-slate-50/30 text-slate-800 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none text-sm placeholder:text-slate-500"
                    placeholder="Secure operational documentation..."
                  />
                </div>
              </div>

            </div>
          </div>
        </div>


        {/* ── Footer Actions ── */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
          <Link
            to="/drivers"
            className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider"
          >
            Cancel
          </Link>
          <button
            type="submit" disabled={loading}
            className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {loading ? "Creating..." : "Add Driver"}
          </button>
        </div>

      </div>
    </form>
  );
};
