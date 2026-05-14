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
  Stethoscope,
  GraduationCap,
  Bell,
  Activity,
  UserCheck,
  Briefcase,
  AlertCircle,
  Clock,
  Loader2,
  ChevronLeft,
  BadgeCheck
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

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        const docId = String(id || '').replace('#', '');
        const docRef = doc(db, "drivers", docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Format date fields for HTML5 date inputs (YYYY-MM-DD)
          const formattedData = { ...data };
          const dateFields = [
            'phExpiryDate', 'dvlaExpiryDate', 'dbsDateOfIssue', 
            'trainingSignedDate', 'rtwVerifiedDate', 
            'serviceStartDate', 'contractEndDate'
          ];
          
          dateFields.forEach(field => {
            if (formattedData[field]) {
              // Handle Firestore Timestamp
              if (typeof formattedData[field].toDate === 'function') {
                formattedData[field] = formattedData[field].toDate().toISOString().split('T')[0];
              } 
              // Handle string dates if they are not already in YYYY-MM-DD
              else if (typeof formattedData[field] === 'string' && formattedData[field].includes('T')) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate
    const { error } = DriverValidationSchema.validate(formData, { abortEarly: false, allowUnknown: true });
    if (error) {
      const newErrors = {};
      error.details.forEach(err => { newErrors[err.path[0]] = err.message; });
      setErrors(newErrors);
      showToast("Verification failed. Please review all highlighted fields.", "error");
      return;
    }

    setUpdating(true);
    try {
      const docId = String(id || '').replace('#', '');
      
      // Clean up fields before sending to update
      // We don't want to update the 'id' field inside the document if it exists as 'id' or 'uid'
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
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Synchronizing Dossier...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link to="/drivers" className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-slate-600 rounded-xl transition-all hover:shadow-md">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Modify Dossier</h2>
                <BadgeCheck className="w-6 h-6 text-indigo-500 fill-indigo-50" />
            </div>
            <p className="text-slate-500 font-medium mt-1">Updating compliance records for <span className="text-indigo-600 font-black">{formData?.name}</span></p>
          </div>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identity Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <User className="w-4 h-4 text-indigo-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Identity Profile</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Full Legal Name</label>
                    <div className="relative group">
                      <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" name="name" value={formData?.name || ''} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.name ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all`} 
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Primary Mobile</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="tel" name="mobile" value={formData?.mobile || ''} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.mobile ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all`} 
                      />
                    </div>
                    {errors.mobile && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="email" name="email" value={formData?.email || ''} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.email ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all`} 
                      />
                    </div>
                    {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Account Status</label>
                    <select 
                      name="status" value={formData?.status || 'active'} onChange={handleChange}
                      className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-white text-indigo-700 font-black focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all cursor-pointer appearance-none shadow-sm"
                    >
                      <option value="active">🟢 Active Deployment</option>
                      <option value="inactive">⚪ Inactive Profile</option>
                      <option value="on_leave">🟡 Seasonal Leave</option>
                      <option value="suspended">🔴 Suspended Duty</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Residential Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                      <input 
                        type="text" name="address" value={formData?.address || ''} onChange={handleChange}
                        className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.address ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all`} 
                      />
                    </div>
                    {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-1.5 flex items-center gap-1.5 px-1"><AlertCircle className="w-3 h-3" /> {errors.address}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-emerald-50 rounded-xl">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Licensing & Regulatory Compliance</h3>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">PH License Number</label>
                      <div className="relative">
                        <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" name="phLicenseNumber" value={formData?.phLicenseNumber || ''} onChange={handleChange} 
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.phLicenseNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                      {errors.phLicenseNumber && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phLicenseNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">PH Expiry Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" name="phExpiryDate" value={formData?.phExpiryDate || ''} onChange={handleChange} 
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.phExpiryDate ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                      {errors.phExpiryDate && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.phExpiryDate}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">DVLA License Number</label>
                      <div className="relative">
                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="text" name="dvlaLicenseNumber" value={formData?.dvlaLicenseNumber || ''} onChange={handleChange} 
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dvlaLicenseNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                      {errors.dvlaLicenseNumber && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaLicenseNumber}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">DVLA Expiry Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                          type="date" name="dvlaExpiryDate" value={formData?.dvlaExpiryDate || ''} onChange={handleChange} 
                          className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dvlaExpiryDate ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                        />
                      </div>
                      {errors.dvlaExpiryDate && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dvlaExpiryDate}</p>}
                    </div>
                  </div>

                  <div className="md:col-span-2 border-t border-slate-100 pt-6 mt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">DBS Certificate Number</label>
                        <div className="relative">
                          <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="text" name="dbsCertificateNumber" value={formData?.dbsCertificateNumber || ''} onChange={handleChange} 
                            className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dbsCertificateNumber ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                          />
                        </div>
                        {errors.dbsCertificateNumber && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dbsCertificateNumber}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-emerald-600">DBS Date of Issue</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input 
                            type="date" name="dbsDateOfIssue" value={formData?.dbsDateOfIssue || ''} onChange={handleChange} 
                            className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${errors.dbsDateOfIssue ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} text-slate-800 font-bold focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all`} 
                          />
                        </div>
                        {errors.dbsDateOfIssue && <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.dbsDateOfIssue}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-amber-50 rounded-xl">
                  <Activity className="w-4 h-4 text-amber-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Deployment Metrics</h3>
              </div>
              <div className="p-8 space-y-5">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block text-amber-600">Service Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" name="serviceStartDate" value={formData?.serviceStartDate || ''} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Contract End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" name="contractEndDate" value={formData?.contractEndDate || ''} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">RTW Verified Date</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="date" name="rtwVerifiedDate" value={formData?.rtwVerifiedDate || ''} onChange={handleChange} className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">Termination Reason</label>
                  <div className="relative">
                    <AlertCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" name="terminationReason" value={formData?.terminationReason || ''} onChange={handleChange} placeholder="Optional" className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-slate-800 font-bold focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50/30">
                <div className="p-2 bg-rose-50 rounded-xl">
                  <GraduationCap className="w-4 h-4 text-rose-600" />
                </div>
                <h3 className="font-black text-slate-800 tracking-tight uppercase text-xs">Safety Checklist</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[12px] font-black text-slate-700">Medical Exemption</p>
                    <p className="text-[10px] font-bold text-slate-400">Validated status</p>
                  </div>
                  <select name="medicalExemption" value={formData?.medicalExemption || 'No'} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 pl-3 pr-8 cursor-pointer">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-[12px] font-black text-slate-700">Training Status</p>
                    <p className="text-[10px] font-bold text-slate-400">Induction check</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <input type="date" name="trainingSignedDate" value={formData?.trainingSignedDate || ''} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 px-3 outline-none" />
                    <select name="trainingStatus" value={formData?.trainingStatus || 'No'} onChange={handleChange} className="bg-slate-50 border-none rounded-lg text-[11px] font-black text-slate-600 py-1.5 pl-3 pr-8 cursor-pointer">
                      <option value="No">Pending</option>
                      <option value="Yes">Inducted</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest block">RTW Verification Note</label>
                  <textarea 
                    name="rtwNote" value={formData?.rtwNote || ''} onChange={handleChange}
                    className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 text-[12px] font-bold text-slate-600 focus:border-indigo-500 outline-none transition-all resize-none h-20"
                    placeholder="Enter validation details..."
                  />
                </div>
              </div>
            </div>

            {/* Confidential Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden col-span-full">
              <div className="px-8 py-5 border-b border-slate-100 flex items-center gap-3 bg-slate-950">
                <div className="p-2 bg-slate-800 rounded-xl">
                  <Activity className="w-4 h-4 text-slate-200" />
                </div>
                <h3 className="font-black text-slate-200 tracking-tight uppercase text-xs">Confidential Records</h3>
              </div>
              <div className="p-8">
                <textarea 
                  name="confidentialNotes" value={formData?.confidentialNotes || ''} onChange={handleChange}
                  className="w-full p-6 rounded-2xl border border-slate-200 bg-slate-50/50 text-[13px] font-medium text-slate-600 focus:border-indigo-500 outline-none transition-all h-32"
                  placeholder="Enter internal annotations..."
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-4 pt-6 border-t border-slate-100">
          <Link to="/drivers" className="w-full sm:w-auto px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all text-center">
            Cancel Updates
          </Link>
          <button 
            type="submit" disabled={updating} 
            className="w-full sm:w-auto px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {updating ? "Updating..." : "Commit Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

