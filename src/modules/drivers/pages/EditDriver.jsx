import React, { useEffect, useState } from 'react';
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
  Clock,
  Loader2,
  ChevronLeft,
  Lock,
  KeyRound,
  X
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../shared/services/firebase';
import { FunctionsAPI } from '../../../shared/services/functions.api';
import { useToast } from '../../../shared/hooks/ToastContext';
import { DriverValidationSchema } from '../../../shared/utils/Validations/DriverValidation';

export const EditDriver = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "drivers", docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const formattedData = { ...data };
          const dateFields = [
            'phExpiryDate', 'dvlaExpiryDate', 'dbsDateOfIssue',
            'trainingSignedDate', 'rtwVerifiedDate',
            'serviceStartDate', 'contractEndDate'
          ];

          dateFields.forEach(field => {
            if (formattedData[field]) {
              if (typeof formattedData[field].toDate === 'function') {
                formattedData[field] = formattedData[field].toDate().toISOString().split('T')[0];
              } else if (typeof formattedData[field] === 'string' && formattedData[field].includes('T')) {
                formattedData[field] = formattedData[field].split('T')[0];
              }
            }
          });

          setFormData(formattedData);
        } else {
          showToast("Dossier not found in registry", "error");
          navigate('/drivers');
        }
      } catch (error) {
        console.error("Fetch Error:", error);
        showToast("Access Denied: Unable to retrieve driver dossier", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchDriver();
  }, [id, navigate, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!newPassword || !confirmNewPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      const docId = String(id || '').replace('#', '');
      const res = await FunctionsAPI.changePassword({ id: docId, password: newPassword });
      if (res?.success) {
        showToast("Password changed successfully!", "success");
        setIsPasswordModalOpen(false);
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordError(res.error || "Failed to change password.");
      }
    } catch (error) {
      console.error("Change Password Error:", error);
      setPasswordError(error.message || "An unexpected error occurred.");
    } finally {
      setPasswordLoading(false);
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

    setUpdating(true);
    try {
      const docId = String(id || '').replace('#', '');
      const { id: _, uid: __, docId: ___, ...updateFields } = formData;

      const res = await FunctionsAPI.addDriver({
        type: "update",
        fields: {
          ...updateFields,
          id: docId,
          searchKey: formData.name ? formData.name.toLowerCase() : ""
        }
      });

      if (res.success) {
        showToast("Driver profile updated successfully!", "success");
        navigate('/drivers');
      } else {
        showToast(res.error || "Failed to update driver profile", "error");
      }
    } catch (error) {
      showToast(error.message || "An unexpected error occurred", "error");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Synchronizing Dossier...</p>
      </div>
    );
  }

  // Shared input class builder
  const inputCls = (field) =>
    `w-full pl-11 pr-4 py-2.5 rounded-xl border ${errors[field] ? 'border-red-500 bg-red-50/10' : 'border-slate-200 bg-white'} text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all text-sm`;

  return (
    <>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">

                {/* Full Name */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Full Legal Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text" name="name" value={formData?.name || ''} onChange={handleChange}
                      className={inputCls('name')} placeholder="e.g. Alexander Hamilton"
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                </div>

                {/* Email */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email" name="email" value={formData?.email || ''} onChange={handleChange}
                      className={inputCls('email')} placeholder="driver@myrailpool.com"
                    />
                  </div>
                  {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status" value={formData?.status || 'active'} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-indigo-700 font-bold focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                  >
                    <option value="active">🟢 Active</option>
                    <option value="inactive">⚪ Inactive</option>
                    <option value="on_leave">🟡 On Leave</option>
                    <option value="suspended">🔴 Suspended</option>
                  </select>
                </div>

                {/* Mobile */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="tel" name="mobile" value={formData?.mobile || ''} onChange={handleChange}
                      className={inputCls('mobile')} placeholder="+44 7000 000000"
                    />
                  </div>
                  {errors.mobile && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
                </div>

                {/* Address */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Residential Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text" name="address" value={formData?.address || ''} onChange={handleChange}
                      className={inputCls('address')} placeholder="Street, City, Postcode"
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                {/* PH License */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    PH License No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text" name="phLicenseNumber" value={formData?.phLicenseNumber || ''} onChange={handleChange}
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
                      type="date" name="phExpiryDate" value={formData?.phExpiryDate || ''} onChange={handleChange}
                      className={inputCls('phExpiryDate')}
                    />
                  </div>
                  {errors.phExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phExpiryDate}</p>}
                </div>

                {/* DVLA License */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    DVLA License No <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text" name="dvlaLicenseNumber" value={formData?.dvlaLicenseNumber || ''} onChange={handleChange}
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
                      type="date" name="dvlaExpiryDate" value={formData?.dvlaExpiryDate || ''} onChange={handleChange}
                      className={inputCls('dvlaExpiryDate')}
                    />
                  </div>
                  {errors.dvlaExpiryDate && <p className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaExpiryDate}</p>}
                </div>

                {/* DBS Certificate */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    DBS Certificate No
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text" name="dbsCertificateNumber" value={formData?.dbsCertificateNumber || ''} onChange={handleChange}
                      className={inputCls('dbsCertificateNumber')} placeholder="DBS-000"
                    />
                  </div>
                </div>

                {/* DBS Date of Issue */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block">
                    DBS Issue Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date" name="dbsDateOfIssue" value={formData?.dbsDateOfIssue || ''} onChange={handleChange}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">

                {/* Service Start */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Service Start</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="date" name="serviceStartDate" value={formData?.serviceStartDate || ''} onChange={handleChange}
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
                      type="date" name="contractEndDate" value={formData?.contractEndDate || ''} onChange={handleChange}
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
                      type="date" name="rtwVerifiedDate" value={formData?.rtwVerifiedDate || ''} onChange={handleChange}
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
                      type="date" name="trainingSignedDate" value={formData?.trainingSignedDate || ''} onChange={handleChange}
                      className={inputCls('trainingSignedDate')}
                    />
                  </div>
                </div>

                {/* Medical Exemption */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Medical Exemption</label>
                  <select
                    name="medicalExemption" value={formData?.medicalExemption || 'No'} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                {/* Training Status */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Training Status</label>
                  <select
                    name="trainingStatus" value={formData?.trainingStatus || 'No'} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                  >
                    <option value="No">Pending</option>
                    <option value="Yes">Inducted</option>
                  </select>
                </div>

                {/* Council Notified */}
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Council Notified</label>
                  <select
                    name="councilNotified" value={formData?.councilNotified || 'No'} onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all cursor-pointer text-sm"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                {/* Termination Reason */}
                <div className="md:col-span-5 space-y-2">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Termination Reason</label>
                  <div className="relative">
                    <FileText className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                    <textarea
                      rows="1" name="terminationReason" value={formData?.terminationReason || ''} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none text-sm"
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
                      rows="3" name="rtwNote" value={formData?.rtwNote || ''} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none text-sm placeholder:text-slate-500"
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
                      rows="3" name="confidentialNotes" value={formData?.confidentialNotes || ''} onChange={handleChange}
                      className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 text-slate-800 font-medium focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none transition-all resize-none text-sm placeholder:text-slate-500"
                      placeholder="Secure operational documentation..."
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>


          {/* ── Footer Actions ── */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => {
                setPasswordError('');
                setNewPassword('');
                setConfirmNewPassword('');
                setIsPasswordModalOpen(true);
              }}
              className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition-all text-sm uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              Change Password
            </button>
            <Link
              to="/drivers"
              className="w-full sm:w-auto text-center px-6 py-1.5 rounded-xl font-bold bg-slate-50 text-slate-500 border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all text-sm uppercase tracking-wider"
            >
              Cancel
            </Link>
            <button
              type="submit" disabled={updating}
              className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-10 py-1.5 rounded-xl font-bold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {updating ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </form>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!passwordLoading) {
                setIsPasswordModalOpen(false);
              }
            }}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-amber-50 p-2.5 rounded-xl">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Change Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For <span className="font-semibold text-slate-700">{formData?.name || 'Driver'}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-2 hover:bg-slate-200/50 rounded-xl transition-colors text-slate-500 hover:text-slate-600"
                disabled={passwordLoading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-start w-full">
                  <label htmlFor="newPassword" className="mb-2 text-sm font-semibold text-slate-700">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    disabled={passwordLoading}
                  />
                </div>

                <div className="flex flex-col items-start w-full">
                  <label htmlFor="confirmNewPassword" className="mb-2 text-sm font-semibold text-slate-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-500 text-sm"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    disabled={passwordLoading}
                  />
                </div>

                {passwordError && (
                  <div className="text-red-500 text-xs font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setIsPasswordModalOpen(false)}
                    disabled={passwordLoading}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition-all text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={passwordLoading}
                    className="flex-[2] px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all text-sm shadow-lg shadow-amber-600/20 disabled:opacity-50"
                  >
                    {passwordLoading ? "Changing..." : "Change Password"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
